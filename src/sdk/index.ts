/*
* Copyright (C) 2018 The ontology Authors
* This file is part of The ontology library.
*
* The ontology is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* The ontology is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
********************************* Notice ********************************************
*************************************************************************************
* All the methods in this file is only for our native app development!!!
* We do not recommend you to use these methods directly.
* You can refer to these methods or the test cases to implement the same methods.
*************************************************************************************
*************************************************************************************
*/
import axios from 'axios';
import * as bip39 from 'bip39';
import { Account } from '../account';
import { Claim } from '../claim/claim';
import { HTTP_REST_PORT, HTTP_WS_PORT, REST_API, TEST_NODE } from '../consts';
import { Address, PgpSignature, PrivateKey } from '../crypto';
import { ERROR_CODE } from '../error';
import { Identity } from '../identity';
import RestClient from '../network/rest/restClient';
import * as scrypt from '../scrypt';
import { makeTransferTx, makeWithdrawOngTx, ONT_CONTRACT } from '../smartcontract/nativevm/ontAssetTxBuilder';
import { buildAddAttributeTx, buildGetDDOTx, buildRegisterOntidTx
} from '../smartcontract/nativevm/ontidContractTxBuilder';
import { DDOAttribute } from '../transaction/ddo';
import {
    buildRestfulParam,
    sendRawTxRestfulUrl,
    signTransaction
} from '../transaction/transactionBuilder';
import { generateMnemonic,
    hexstr2str, isBase64, now, sendBackResult2Native, str2hexstr } from '../utils';
import { Wallet } from '../wallet';

// tslint:disable:no-unused-expression
// tslint:disable:no-shadowed-variable

export class SDK {
    static SERVER_NODE: string = TEST_NODE;
    static REST_PORT: string = HTTP_REST_PORT;
    static SOCKET_PORT: string = HTTP_WS_PORT;

    static setServerNode(node: string) {
        if (node) {
            let url = '';
            if (node.indexOf('http') > -1) {
                url = node.substr('http://'.length);
            } else {
                url = node;
            }
            SDK.SERVER_NODE = url;
            return;
        }

        throw new Error('Can not set ' + node + 'as server node');
    }

    static setRestPort(port: string) {
        if (port) {
            SDK.REST_PORT = port;
            return;
        }

        throw new Error('Can not set ' + port + ' as restful port');
    }

    static setSocketPort(port: string) {
        if (port) {
            SDK.SOCKET_PORT = port;
            return;
        }
        throw new Error('Can not set ' + port + 'as socket port');
    }

    static getDecryptError(err: any) {
        return {
            error: ERROR_CODE.Decrypto_ERROR,
            result: ''
        };
    }

    static transformPassword(password: string) {
        if (isBase64(password)) {
            return Buffer.from(password, 'base64').toString();
        }
        return password;
    }

    static createWallet(name: string,
                        password: string, payer: string, gasPrice: string, gasLimit: string, callback?: string) {
        const wallet = Wallet.create(name);
        password = this.transformPassword(password);
        const privateKey = PrivateKey.random();
        const identity = Identity.create(privateKey, password, name);

        wallet.defaultOntid = identity.ontid;
        wallet.addIdentity(identity);

        // let account = new Account()
        // account.create(privateKey, password, name)
        // wallet.addAccount(account)

        const walletDataStr = wallet.toJson();
        let obj: any = {
            error: 0,
            result: walletDataStr,
            tx : ''
        };

        const publicKey = privateKey.getPublicKey();
        const tx = buildRegisterOntidTx(identity.ontid, publicKey, gasPrice, gasLimit);
        tx.payer = new Address(payer);
        signTransaction(tx, privateKey);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        // add preExec
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            // preExec success, send real request
            if (res.Result.Result === '01') {
                // restClient.sendRawTransaction(tx.serialize(), false)
                obj.tx = tx.serialize();

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: ''
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(errResult), callback);
                }
                return errResult;
            }
        }).catch((err: any) => {
            obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static importIdentityWithWallet(
        label: string,
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        callback?: string
    ) {
        let obj: any;
        let identity = new Identity();
        try {
            // TODO check ontid
            const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
            const addr = new Address(address);
            password = this.transformPassword(password);
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password, addr, salt);
        } catch (err) {
            obj  = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
            return obj;
        }
        obj = {
            error : ERROR_CODE.SUCCESS,
            result : identity.toJson()
        };
        // check ontid on chain
        const tx = buildGetDDOTx(identity.ontid);
        const param = buildRestfulParam(tx);
        const restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`;
        const url = sendRawTxRestfulUrl(restUrl, true);
        // clear privateKey and password
        password = '';
        return axios.post(url, param).then((res: any) => {
            const result = res.data.Result;
            if (result.Result) {
                //
            } else {
                obj.error = ERROR_CODE.UNKNOWN_ONTID;
                obj.result = '';
            }

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
            return obj;
        }).catch((err) => {
            obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result : ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    // send http post to check
    static importIdentityAndCreateWallet(
        label: string,
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        callback?: string
    ) {
        let identity = new Identity();
        let error = {};
        let obj: any;
        try {
            password = this.transformPassword(password);
            const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
            const addr = new Address(address);
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password, addr, salt);
            const wallet = Wallet.create(identity.label);
            wallet.defaultOntid = identity.ontid;
            wallet.addIdentity(identity);
            const walletStr = wallet.toJson();
            obj = {
                error: ERROR_CODE.SUCCESS,
                result: walletStr
            };
            // check ontid on chain
            const tx = buildGetDDOTx(identity.ontid);
            const param = buildRestfulParam(tx);
            const restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`;
            const url = sendRawTxRestfulUrl(restUrl, true);
            return axios.post(url, param).then((res: any) => {
                const result = res.data.Result;
                if (result.Result) {
                    //
                } else {
                    obj.error = ERROR_CODE.UNKNOWN_ONTID;
                    obj.result = '';
                }
                // clear privateKey and password
                password = '';
                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            }).catch((err) => {
                obj = {
                    error: ERROR_CODE.NETWORK_ERROR,
                    result : ''
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
            });
            // callback && sendBackResult2Native(JSON.stringify(obj), callback)
            // return obj
        } catch (err) {
            error = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(error), callback);
            }
            return Promise.reject(error);
        }
    }

    static createIdentity(label: string, password: string, payer: string,
                          gasPrice: string, gasLimit: string, callback?: string) {
        const privateKey = PrivateKey.random();
        password = this.transformPassword(password);
        const identity = Identity.create(privateKey, password, label);
        const result = identity.toJson();
        let obj: any = {
            error: ERROR_CODE.SUCCESS,
            result,
            tx : ''
        };
        // register ontid
        const publicKey = privateKey.getPublicKey();
        const tx = buildRegisterOntidTx(identity.ontid, publicKey, gasPrice, gasLimit);
        tx.payer = new Address(payer);
        signTransaction(tx, privateKey);
        password = '';
        privateKey.key = '';
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            // preExec success, send real request
            if (res.Result.Result === '01') {
                // restClient.sendRawTransaction(tx.serialize(), false)
                obj.tx = tx.serialize();

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                // clear privateKey and password
                privateKey.key = '';
                password = '';
                return obj;
            } else {
                const errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: ''
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(errResult), callback);
                }
                return errResult;
            }
        }).catch((err: any) => {
            obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static createAccount(label: string, password: string, callback?: string) {
        // generate mnemnic
        let mnemonic = generateMnemonic();
        password = this.transformPassword(password);
        const mnemonicHex = str2hexstr(mnemonic);
        const privateKey = PrivateKey.generateFromMnemonic(mnemonic);
        const account = Account.create(privateKey, password, label);
        const addr = account.address;
        const salt = Buffer.from(account.salt, 'base64').toString('hex');
        const mnemonicEnc = scrypt.encryptWithGcm(mnemonicHex, addr, salt, password);
        const result = account.toJson();
        const obj = {
            error : ERROR_CODE.SUCCESS,
            result,
            mnemonicEnc
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        mnemonic = '';
        return obj;
    }

    static decryptMnemonicEnc(mnemonicEnc: string,
                              address: string, salt: string, password: string, callback: string) {
        let obj;
        password = this.transformPassword(password);
        const addr = new Address(address);
        const saltHex = Buffer.from(salt, 'base64').toString('hex');
        const decMneHex = scrypt.decryptWithGcm(mnemonicEnc, addr, saltHex, password);
        const decMne = hexstr2str(decMneHex);
        obj = {
            error: ERROR_CODE.SUCCESS,
            result: decMne
        };
        // tslint:disable-next-line:no-unused-expression
        callback && sendBackResult2Native(JSON.stringify(obj), callback);
        return obj;
    }

    static importAccountWithWallet(
        label: string,
        encryptedPrivateKey: string,
        address: string,
        salt: string,
        password: string,
        callback?: string
    ) {
        let account = new Account();
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const addr = new Address(address);
            account = Account.importAccount(label, encryptedPrivateKeyObj, password, addr, salt);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const obj = {
            error: ERROR_CODE.SUCCESS,
            result: account.toJson()
        };
        // add address check
        if (address !== account.address.toBase58()) {
            obj.error = ERROR_CODE.INVALID_ADDR,
            obj.result = '';
        }

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        // clear privateKey and password
        password = '';
        return obj;
    }

    static signSelfClaim(
        context: string,
        claimData: string,
        ontid: string,
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        callback?: string
    )  {
        let privateKey: PrivateKey;
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        const restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`;
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        // const claimDataObj = JSON.parse(claimData);
        const metadata = {
            issuer: ontid,
            subject: ontid,
            issuedAt: now()
        };

        // todo: pass real public key id
        const publicKeyId = ontid + '#keys-1';
        const claim = new Claim(metadata, undefined, undefined);
        claim.sign(restUrl, publicKeyId, privateKey);
        const obj = {
            error : 0,
            result : claim
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return obj;
    }

    static decryptEncryptedPrivateKey(
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        callback?: string
    ) {
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const obj = {
            error : 0,
            result : ''
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        // clear privateKey and password
        password = '';
        return obj;
    }

    static getClaim(
        claimId: string,
        context: string,
        issuer: string,
        subject: string,
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        payer: string,
        gasPrice: string,
        gasLimit: string,
        callback ?: string
    ) {
        let privateKey: PrivateKey;
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }

            return result;
        }
        const path = 'claim' + claimId;
        const valueObj = {
            Type : 'JSON',
            Value : {
                Context: context,
                Issuer: issuer
            }
        };
        // const type = 'JSON';
        const value = JSON.stringify(valueObj);
        const attr = new DDOAttribute();
        attr.key = path;
        attr.type = 'JSON';
        attr.value = value;
        const publicKey = privateKey.getPublicKey();
        const tx = buildAddAttributeTx(subject, [attr], publicKey, gasPrice, gasLimit);
        tx.payer = new Address(payer);
        signTransaction(tx, privateKey);
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            if (res.Result.Result === '01') {
                // user agent will do this
                // restClient.sendRawTransaction(tx.serialize(), false)
                // const hash = sha256(sha256(tx.serializeUnsignedData()))
                const obj = {
                    error: ERROR_CODE.SUCCESS,
                    result: '',
                    tx: tx.serialize()
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                // clear privateKey and password
                privateKey.key = '';
                password = '';
                return obj;
            } else {
                const obj = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: ''
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            }
        }
        ).catch((err: any) => {
            const obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static signData(
        content: string,
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        callback?: string
    ): PgpSignature | object {
        let privateKey: PrivateKey;
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        let result;
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const signature = privateKey.sign(content);
        result = signature.serializePgp();

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static getBalance(address: string, callback?: string) {
        const addressObj = new Address(address);
        const request = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.getBalance}/${addressObj.toBase58()}`;
        return axios.get(request).then((res: any) => {
            if (res.data.Error === 0) {
                const result = res.data.Result;
                const obj = {
                    error : 0,
                    result
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const obj = {
                    error: res.data.Error,
                    result : ''
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            }
        }).catch( (err: any) => {
            const obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
            return Promise.reject(obj);
        });
    }

    // pls check balance before transfer
    static transferAssets(
        token: string,
        from: string,
        to: string,
        value: string,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        gasPrice: string,
        gasLimit: string,
        payer: string,
        callback: string) {

        let fromAddress: Address;
        let toAddress: Address;
        password = this.transformPassword(password);
        try {
            fromAddress = new Address(from);
            toAddress = new Address(to);
        } catch (err) {
            const result = {
                error : ERROR_CODE.INVALID_PARAMS,
                result : ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const addr = new Address(from);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        const tx = makeTransferTx(token, fromAddress, toAddress, value, gasPrice, gasLimit);
        tx.payer = new Address(payer);
        signTransaction(tx, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: '',
            tx: tx.serialize()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static claimOng(
        address: string,
        value: string,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        gasPrice: string,
        gasLimit: string,
        payer: string,
        callback: string
    ) {
        let addressObj: Address;
        password = this.transformPassword(password);
        try {
            addressObj = new Address(address);

        } catch (err) {
            const result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addressObj, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        const tx = makeWithdrawOngTx(addressObj, addressObj, value, new Address(payer), gasPrice, gasLimit);
        signTransaction(tx, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: '',
            tx: tx.serialize()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static exportIdentityToQrcode(identityDataStr: string, callback: string) {
        const obj = Identity.parseJson(identityDataStr);
        const result = {
            type : 'I',
            label : obj.label,
            algorithm : 'ECDSA',
            scrypt : {
                n : 4096,
                p : 8,
                r : 8,
                dkLen : 64
            },
            key : obj.controls[0].encryptedKey.key,
            salt : obj.controls[0].salt,
            address: obj.controls[0].address.toBase58(),
            parameters : {
                curve : 'secp256r1'
            }
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }

    static exportIdentityToKeystring(identityDataStr: string, callback: string) {
        const obj = Identity.parseJson(identityDataStr);
        const address = obj.controls[0].address.toBase58();
        const salt = obj.controls[0].salt;
        const key = obj.controls[0].encryptedKey.key;
        const result = salt + address + key;

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }

    static exportAccountToQrcode(accountDataStr: string, callback: string) {
        const obj = Account.parseJson(accountDataStr);
        const result = {
            type: 'A',
            label: obj.label,
            algorithm: 'ECDSA',
            scrypt: {
                n: 4096,
                p: 8,
                r: 8,
                dkLen: 64
            },
            key: obj.encryptedKey.key,
            salt: obj.salt,
            address: obj.address.toBase58(),
            parameters: {
                curve: 'secp256r1'
            }
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }

    static exportAccountToKeystring(accountDataStr: string, callback: string) {
        const obj = Account.parseJson(accountDataStr);
        const salt = obj.salt;
        const address = obj.address.toBase58();
        const key = obj.encryptedKey.key;
        const result = salt + address + key;

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }

    static importAccountMnemonic(label: string, mnemonic: string, password: string, callback: string) {
        mnemonic = mnemonic.trim();
        password = this.transformPassword(password);
        if (!bip39.validateMnemonic(mnemonic)) {
            // tslint:disable-next-line:no-shadowed-variable
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            // tslint:disable-next-line:no-unused-expression
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        const seed = bip39.mnemonicToSeedHex(mnemonic);
        const pri = seed.substr(0, 64);
        const privateKey = new PrivateKey(pri);
        const account = Account.create(privateKey, password, label);
        const result = account.toJson();
        const obj = {
            error: ERROR_CODE.SUCCESS,
            result
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        mnemonic = '';
        return obj;
    }

    static exportWifPrivakeKey(encryptedKey: string, password: string,
                               address: string, salt: string, callback: string) {
        if (address.length !== 34 && address.length !== 40) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        password = this.transformPassword(password);
        const encrypt = new PrivateKey(encryptedKey);
        const addr = new Address(address);
        const saltHex = Buffer.from(salt, 'base64').toString('hex');
        const privateKey = encrypt.decrypt(password, addr, saltHex);
        let wif = privateKey.serializeWIF();
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: wif
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        wif = '';
        password = '';
        return result;
    }

    static importAccountWithWif(label: string, wif: string, password: string, callback: string) {
        let privateKey;
        password = this.transformPassword(password);
        try {
            privateKey = PrivateKey.deserializeWIF(wif);
        } catch (err) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        const account = Account.create(privateKey, password, label);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: account.toJson()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static importAccountWithPrivateKey(label: string, privateKey: string, password: string, callback: string) {
        privateKey = privateKey.trim();
        password = this.transformPassword(password);
        if (!privateKey || privateKey.length !== 64) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        const pri = new PrivateKey(privateKey);
        const account = Account.create(pri, password, label);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: account.toJson()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey = '';
        password = '';
        return result;
    }

    /**
     * Actually import with Qrcode
     */
    static importAccountWithKeystore(keystore: string, password: string, callback: string) {
        let keyStoreObj;
        password = this.transformPassword(password);
        try {
            keyStoreObj = JSON.parse(keystore);
        } catch (err) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        if (keyStoreObj.type !== 'A') {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        } else {
            let account = new Account();
            const encryptedPrivateKeyObj = new PrivateKey(keyStoreObj.key);
            try {
                const params = {
                    cost: keyStoreObj.scrypt.n || 4096,
                    blockSize: keyStoreObj.scrypt.p || 8,
                    parallel: keyStoreObj.scrypt.r || 8,
                    size: keyStoreObj.scrypt.dkLen || 64
                };
                const addr = new Address(keyStoreObj.address);
                const saltHex = Buffer.from(keyStoreObj.salt, 'base64').toString('hex');
                account = Account.importAccount(
                    keyStoreObj.label, encryptedPrivateKeyObj, password, addr, saltHex, params);
                const obj = {
                    error: ERROR_CODE.SUCCESS,
                    result: account.toJson()
                };
                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                // clear privateKey and password
                password = '';
                return obj;
            } catch (err) {
                const result = this.getDecryptError(err);
                if (callback) {
                    sendBackResult2Native(JSON.stringify(result), callback);
                }
                return result;
            }
        }
    }

    static getUnclaimedOng(address: string, callback: string) {
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.getAllowance('ong', new Address(ONT_CONTRACT), new Address(address)).then((res) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: res.Result
            };
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }).catch((err) => {
            const result = {
                error: err.Error,
                result: ''
            };
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        });
    }

    static querySmartCodeEventByTxhash(txHash: string, callback: string) {
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.getSmartCodeEvent(txHash).then((res) => {
            const obj = {
                error: ERROR_CODE.SUCCESS,
                result: res
            };
            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
            return obj;
        }).catch((err) => {
            const result = {
                error: err.Error,
                result: ''
            };
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        });
    }

}
