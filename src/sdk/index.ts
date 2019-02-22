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
import { HTTP_REST_PORT, HTTP_WS_PORT, ONT_BIP44_PATH, REST_API, TEST_NODE } from '../consts';
import { Address, PgpSignature, PrivateKey, PublicKey } from '../crypto';
import { ERROR_CODE } from '../error';
import { Identity } from '../identity';
import { NeoRpc } from '../neocore/NeoRpc';
import { Program } from '../neocore/Program';
import { SmartContract } from '../neocore/SmartContract';
import RestClient from '../network/rest/restClient';
import { WebsocketClient } from '../network/websocket/websocketClient';
import * as scrypt from '../scrypt';
import { ScryptParams } from '../scrypt';
import AbiInfo from '../smartcontract/abi/abiInfo';
import { Parameter } from '../smartcontract/abi/parameter';
import { makeTransferTx, makeWithdrawOngTx, ONT_CONTRACT } from '../smartcontract/nativevm/ontAssetTxBuilder';
import { buildAddAttributeTx, buildGetDDOTx, buildRegisterOntidTx
} from '../smartcontract/nativevm/ontidContractTxBuilder';
import { Oep8TxBuilder } from '../smartcontract/neovm/oep8TxBuilder';
import { DDOAttribute } from '../transaction/ddo';
import { Transaction } from '../transaction/transaction';
import {
    buildRestfulParam,
    sendRawTxRestfulUrl,
    signTransaction,
    signTx
} from '../transaction/transactionBuilder';
import { generateMnemonic, hexstr2str, isBase64, isHexString, now, reverseHex,
    sendBackResult2Native, str2hexstr, StringReader } from '../utils';
import { Wallet } from '../wallet';
import { Ecies } from './../crypto/Ecies';
import { ParameterType } from './../smartcontract/abi/parameter';
import { Oep4TxBuilder } from './../smartcontract/neovm/oep4TxBuilder';

// tslint:disable-next-line:no-var-requires
const HDKey = require('@ont-community/hdkey-secp256r1');

// tslint:disable:no-unused-expression
// tslint:disable:no-shadowed-variable

// neo contract
const CONTRACT_HASH = 'ceab719b8baa2310f232ee0d277c061704541cfb';
// neo node
const NEO_NODE = 'http://neonode1.ont.network:10332';
// neo abi
// tslint:disable-next-line:max-line-length
const NEP5_ABI = '{"hash":"0x5bb169f915c916a5e30a3c13a5e0cd228ea26826","entrypoint":"Main","functions":[{"name":"Name","parameters":[],"returntype":"String"},{"name":"Symbol","parameters":[],"returntype":"String"},{"name":"Decimals","parameters":[],"returntype":"Integer"},{"name":"Main","parameters":[{"name":"operation","type":"String"},{"name":"args","type":"Array"}],"returntype":"Any"},{"name":"Init","parameters":[],"returntype":"Boolean"},{"name":"TotalSupply","parameters":[],"returntype":"Integer"},{"name":"Transfer","parameters":[{"name":"from","type":"ByteArray"},{"name":"to","type":"ByteArray"},{"name":"value","type":"Integer"}],"returntype":"Boolean"},{"name":"BalanceOf","parameters":[{"name":"address","type":"ByteArray"}],"returntype":"Integer"}],"events":[{"name":"transfer","parameters":[{"name":"arg1","type":"ByteArray"},{"name":"arg2","type":"ByteArray"},{"name":"arg3","type":"Integer"}],"returntype":"Void"}]}';
// neo swap address
// const RECEIVER_ADDR = 'AFmseVrdL9f9oyCzZefL9tG6UbvhPbdYzM';

const NEO_TRAN = 100000000;

export class SDK {
    static SERVER_NODE: string = TEST_NODE;
    static REST_PORT: string = HTTP_REST_PORT;
    static SOCKET_PORT: string = HTTP_WS_PORT;
    static restClient: RestClient = new RestClient();
    static socketClient: WebsocketClient = new WebsocketClient();

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
            SDK.restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
            return;
        }

        throw new Error('Can not set ' + port + ' as restful port');
    }

    static setSocketPort(port: string) {
        if (port) {
            SDK.SOCKET_PORT = port;
            SDK.socketClient = new WebsocketClient(`ws://${SDK.SERVER_NODE}:${SDK.SOCKET_PORT}`);
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

    static importIdentityWithPrivateKey(
        label: string = '',
        privateKey: string,
        password: string,
        callback?: string
    ) {
        privateKey = privateKey.trim();
        password = this.transformPassword(password);
        if (!privateKey || privateKey.length !== 64 || !isHexString(privateKey)) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        let obj: any;
        const pri = new PrivateKey(privateKey);
        const identity = Identity.create(pri, password, label);
        obj = {
            error: ERROR_CODE.SUCCESS,
            result: identity.toJson()
        };
        const tx = buildGetDDOTx(identity.ontid);
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = res.Result;
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
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static importIdentityWithWif(
        label: string = '',
        wif: string,
        password: string,
        callback?: string
    ) {
        wif = wif.trim();
        password = this.transformPassword(password);
        let obj: any;
        let pri: PrivateKey;
        try {
            pri = PrivateKey.deserializeWIF(wif);
        } catch (err) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        const identity = Identity.create(pri, password, label);
        obj = {
            error: ERROR_CODE.SUCCESS,
            result: identity.toJson()
        };
        const tx = buildGetDDOTx(identity.ontid);
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = res.Result;
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
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static importIdentityWithWifOffChain(
        label: string = '',
        wif: string,
        password: string,
        callback?: string
    ) {
        wif = wif.trim();
        password = this.transformPassword(password);
        let obj: any;
        let pri: PrivateKey;
        try {
            pri = PrivateKey.deserializeWIF(wif);
        } catch (err) {
            const obj = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            callback && sendBackResult2Native(JSON.stringify(obj), callback);
            return obj;
        }
        const identity = Identity.create(pri, password, label);
        obj = {
            error: ERROR_CODE.SUCCESS,
            result: identity.toJson()
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
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
                              address: string, salt: string, password: string, callback?: string) {
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
        let pri;
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            pri = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const obj = {
            error : 0,
            result : pri.key
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
        content: string, // hex string
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
        callback?: string) {

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
            tx: tx.serialize(),
            txHash: reverseHex(tx.getSignContent())
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
        callback?: string
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
            tx: tx.serialize(),
            txHash: reverseHex(tx.getSignContent())
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static exportIdentityToQrcode(identityDataStr: string, callback?: string) {
        const obj = Identity.parseJson(identityDataStr);
        let salt = obj.controls[0].salt;
        if (!isBase64(salt)) {
            salt = Buffer.from(salt, 'hex').toString('base64');
        }
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
            salt,
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

    static exportIdentityToKeystring(identityDataStr: string, callback?: string) {
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

    static exportAccountToQrcode(accountDataStr: string, callback?: string) {
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

    static exportAccountToKeystring(accountDataStr: string, callback?: string) {
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

    static importAccountMnemonic(label: string, mnemonic: string, password: string, callback?: string) {
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
        const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        const pri = hdkey.derive(ONT_BIP44_PATH);
        const key = Buffer.from(pri.privateKey).toString('hex');
        const privateKey = new PrivateKey(key);
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
                               address: string, salt: string, callback?: string) {
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
            result: {
                wif,
                privateKey: privateKey.key
            }
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        wif = '';
        password = '';
        return result;
    }

    static importAccountWithWif(label: string, wif: string, password: string, callback?: string) {
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

    static importAccountWithPrivateKey(label: string, privateKey: string, password: string, callback?: string) {
        privateKey = privateKey.trim();
        password = this.transformPassword(password);
        if (!privateKey || privateKey.length !== 64 || !isHexString(privateKey)) {
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
    static importAccountWithKeystore(keystore: string, password: string, callback?: string) {
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
                account = Account.importAccount(
                    keyStoreObj.label, encryptedPrivateKeyObj, password, addr, keyStoreObj.salt, params);
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

    static getUnclaimedOng(address: string, callback?: string) {
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

    static querySmartCodeEventByTxhash(txHash: string, callback?: string) {
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

    static createSharedWallet(requiredSignatureNum: string, allRelatedPks: string, callback?: string) {
        const M  = parseInt(requiredSignatureNum, 10);
        let pks = [];
        let pubs = [];
        let error = ERROR_CODE.SUCCESS;
        try {
            pks = JSON.parse(allRelatedPks);
            pubs = pks.map((p: string) => PublicKey.deserializeHex(new StringReader(p)));
        } catch (err) {
            error = ERROR_CODE.INVALID_PARAMS;
        }
        if (M < 2 || pks.length < M || pks.length > 12) {
            error = ERROR_CODE.INVALID_PARAMS;
        }
        let address = '';
        try {
            address = Address.fromMultiPubKeys(M, pubs).toBase58();
        } catch (err) {
            error = ERROR_CODE.INVALID_PARAMS;
        }
        if (callback) {
            const result = {
                error,
                result: address
            };
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return address;
    }

    static adderssFromPublicKey(publicKey: string, callback?: string) {
        const pk = PublicKey.deserializeHex(new StringReader(publicKey));
        const address = Address.fromPubKey(pk).toBase58();
        const result = {
            error : ERROR_CODE.SUCCESS,
            result: address
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return address;
    }

    static makeMultiSignTransaction(asset: string, from: string, to: string, amount: string, gasPrice: string,
                                    gasLimit: string, callback?: string) {
        let fromAddress: Address;
        let toAddress: Address;
        try {
            fromAddress = new Address(from);
            toAddress = new Address(to);
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
        const tx = makeTransferTx(asset, fromAddress, toAddress, amount, gasPrice, gasLimit);
        tx.payer = fromAddress;
        const result = {
            error: ERROR_CODE.SUCCESS,
            txHash: reverseHex(tx.getSignContent()),
            txData: tx.serialize()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        return result;
    }

    static signMultiAddrTransaction(
        encryptedPrivateKey: string,
        address: string,
        salt: string,
        password: string,
        allRelatedPks: string,
        requiredSignatureNum: string,
        txDada: string,
        callback?: string) {
        password = this.transformPassword(password);
        let privateKey: PrivateKey;
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
        const M = parseInt(requiredSignatureNum, 10);
        const tx = Transaction.deserialize(txDada);
        const pubs = JSON.parse(allRelatedPks);
        const pks = pubs.map((p: string) => new PublicKey(p));
        signTx(tx, M, pks, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            signedHash: tx.serialize()
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        return tx;
    }

    /**
     * Neo transfer
     */
    static neoTransfer(
        from: string,
        to: string,
        value: string,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        callback?: string,
        params ?: ScryptParams
    ) {
        password = this.transformPassword(password);
        const recv = new Address(to);
        const addr = new Address(from);
        const abiInfo = AbiInfo.parseJson(NEP5_ABI);
        const contractAddr = new Address(reverseHex(CONTRACT_HASH));
        const amount = parseInt(value, 10);
        const func = abiInfo.getFunction('Transfer');
        func.name = func.name.toLowerCase();
        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex, params);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const p1 = new Parameter('from', ParameterType.ByteArray, addr.serialize());
        const p2 = new Parameter('to', ParameterType.ByteArray, recv.serialize());
        const p3 = new Parameter('value', ParameterType.Integer, amount * NEO_TRAN);
        func.setParamsValue(p1, p2, p3);
        const tx = SmartContract.makeInvokeTransaction(contractAddr, addr, func);
        const p = new Program();
        p.parameter = Program.programFromParams([tx.sign(privateKey)]);
        p.code = Program.programFromPubKey(privateKey.getPublicKey());
        tx.scripts = [p];

        return NeoRpc.sendRawTransaction(NEO_NODE, tx.serialize()).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: ''
            };
            if (res.result) {
                result.result = reverseHex(tx.getHash());
                callback && sendBackResult2Native(JSON.stringify(result), callback);
            } else {
                result.error = ERROR_CODE.NETWORK_ERROR;
                callback && sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        });
    }

    static getNeoBalance(address: string, callback?: string) {
        const contractAddr = new Address(reverseHex(CONTRACT_HASH));
        const addr = new Address(address);
        return NeoRpc.getBalance(NEO_NODE, contractAddr, addr).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: 0
            };
            if (res.result) {
                const balance = parseInt(reverseHex(res.result), 16);
                result.result = balance;
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback);
            return result;
        });
    }

    static sendTransaction(txData: string, callback?: string) {
        const restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`);
        return restClient.sendRawTransaction(txData).then((res) => {
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

    static sendTransactionWithWebsocket(txData: string, callback?: string) {
        const socketClient = new WebsocketClient(`ws://${SDK.SERVER_NODE}:${SDK.SOCKET_PORT}`);
        return socketClient.sendRawTransaction(txData, false, true).then((res) => {
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

    // ope8 apis for ONTO
    static queryOep8Balance(
        contractHash: string,
        account: string,
        tokenId: number,
        callback?: string
    ) {
        const contractAddr = new Address(reverseHex(contractHash));
        const oep8 = new Oep8TxBuilder(contractAddr);
        const addr = new Address(account);
        const tx = oep8.makeQueryBalanceOfTx(addr, tokenId);
        return SDK.restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: 0
            };
            if (res.Result.Result) {
                result.result = parseInt(reverseHex(res.Result.Result), 16);
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback);
            return result;
        });
    }

    static queryOep8Balances(
        contractHash: string,
        account: string,
        callback?: string
    ) {
        const contractAddr = new Address(reverseHex(contractHash));
        const oep8 = new Oep8TxBuilder(contractAddr);
        const addr = new Address(account);
        const tx = oep8.makeQueryBalancesTx(addr);
        return SDK.restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: [0, 0, 0, 0, 0, 0, 0, 0]
            };
            if (res.Result.Result) {
                const vals = res.Result.Result.map((v: string) => v ? parseInt(reverseHex(v), 16) : 0);
                result.result = vals;
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback);
            return result;
        });
    }

    static queryOep8TotalBalance(
        contractHash: string,
        account: string,
        callback?: string
    ) {
        const contractAddr = new Address(reverseHex(contractHash));
        const oep8 = new Oep8TxBuilder(contractAddr);
        const addr = new Address(account);
        const tx = oep8.makeQueryTotalBalanceTx(addr);
        return SDK.restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: 0
            };
            if (res.Result.Result) {
                result.result = parseInt(reverseHex(res.Result.Result), 16);
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback);
            return result;
        });
    }

    static transferOep8(
        contractHash: string,
        from: string,
        to: string,
        value: string,
        tokenId: number,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        gasPrice: string,
        gasLimit: string,
        payer: string,
        callback?: string
    ) {
        let fromAddress: Address;
        let toAddress: Address;
        let payerAddress: Address;
        password = this.transformPassword(password);
        try {
            fromAddress = new Address(from);
            toAddress = new Address(to);
            payerAddress = new Address(payer);
        } catch (err) {
            const result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
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
            return result;
        }
        const contractAddr = new Address(reverseHex(contractHash));
        const oep8 = new Oep8TxBuilder(contractAddr);
        const tx = oep8.makeTransferTx(fromAddress, toAddress, tokenId, value, gasPrice, gasLimit, payerAddress);
        signTransaction(tx, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: '',
            tx: tx.serialize(),
            txHash: reverseHex(tx.getSignContent())
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static compoundOep8(
        contractHash: string,
        account: string,
        compoundNum: number,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        gasPrice: string,
        gasLimit: string,
        payer: string,
        callback: string
    ) {
        let addr: Address;
        password = this.transformPassword(password);
        try {
            addr = new Address(account);
        } catch (err) {
            const result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
            return result;
        }

        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);
            return result;
        }
        const contractAddr = new Address(reverseHex(contractHash));
        const oep8 = new Oep8TxBuilder(contractAddr);
        const tx = oep8.makeCompoundTx(addr, compoundNum, gasPrice, gasLimit, addr);
        signTransaction(tx, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: '',
            tx: tx.serialize(),
            txHash: reverseHex(tx.getSignContent())
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    // ope4 apis for ONTO
    static queryOep4Balance(
        contractHash: string,
        account: string,
        callback?: string
    ) {
        const contractAddr = new Address(reverseHex(contractHash));
        const oep4 = new Oep4TxBuilder(contractAddr);
        const addr = new Address(account);
        const tx = oep4.queryBalanceOf(addr);
        return SDK.restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            const result = {
                error: ERROR_CODE.SUCCESS,
                result: 0
            };
            if (res.Result.Result) {
                result.result = parseInt(reverseHex(res.Result.Result), 16);
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback);
            return result;
        });
    }

    static transferOep4(
        contractHash: string,
        from: string,
        to: string,
        value: string,
        encryptedPrivateKey: string,
        password: string,
        salt: string,
        gasPrice: string,
        gasLimit: string,
        callback?: string
    ) {
        let fromAddress: Address;
        let toAddress: Address;
        password = this.transformPassword(password);
        try {
            fromAddress = new Address(from);
            toAddress = new Address(to);
        } catch (err) {
            const result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: ''
            };
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
            return result;
        }
        const contractAddr = new Address(reverseHex(contractHash));
        const oep4 = new Oep4TxBuilder(contractAddr);
        const tx = oep4.makeTransferTx(fromAddress, toAddress, value, gasPrice, gasLimit, fromAddress);
        signTransaction(tx, privateKey);
        const result = {
            error: ERROR_CODE.SUCCESS,
            result: '',
            tx: tx.serialize(),
            txHash: reverseHex(tx.getSignContent())
        };
        callback && sendBackResult2Native(JSON.stringify(result), callback);
        // clear privateKey and password
        privateKey.key = '';
        password = '';
        return result;
    }

    static eciesDecrypt(
        encryptedPrivateKey: string,
        password: string,
        address: string,
        salt: string,
        cipher: string,
        callback?: string
    ) {
        password = this.transformPassword(password);
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        let pri;
        try {
            const addr = new Address(address);
            const saltHex = Buffer.from(salt, 'base64').toString('hex');
            pri = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const ins = new Ecies();
        const cipherContent = cipher.split('.');
        ins.setKeyPair(pri.key);
        const plainBuffer = ins.dec(
            cipherContent[0],
            cipherContent[1],
            cipherContent[2],
            32
        );

        const plain = plainBuffer.toString('utf8');
        const obj = {
            error: 0,
            result: plain
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
    }

}
