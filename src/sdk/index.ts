
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
import { BigNumber } from 'bignumber.js';
import { Account } from '../account';
import { Claim } from '../claim/claim';
import { HTTP_REST_PORT, HTTP_WS_PORT, ONT_NETWORK, REST_API, TEST_NODE, TEST_ONT_URL } from '../consts';
import * as core from '../core';
import { Address, PgpSignature, PrivateKey } from '../crypto';
import { ERROR_CODE } from '../error';
import { Identity } from '../identity';
import RestClient from '../network/rest/restClient';
import { makeClaimOngTx, makeTransferTx } from '../smartcontract/ontAssetTxBuilder';
import { buildAddAttributeTx, buildGetDDOTx, buildRegisterOntidTx } from '../smartcontract/ontidContractTxBuilder';
import { DDO, DDOAttribute } from '../transaction/ddo';
import {
    buildRestfulParam,
    buildRpcParam,
    buildTxParam,
    makeTransferTransaction,
    parseEventNotify,
    sendRawTxRestfulUrl,
    signTransaction
} from '../transaction/transactionBuilder';
import TxSender from '../transaction/txSender';
import { ab2hexstring, EventEmitter, now, sendBackResult2Native, str2hexstr } from '../utils';
import { Wallet } from '../wallet';

export class SDK {
    static SERVER_NODE: string = TEST_NODE;
    static REST_PORT: string = HTTP_REST_PORT;
    static SOCKET_PORT: string = HTTP_WS_PORT;

    static setServerNode(node : string) {
        if(node) {
            let url = ''
            if(node.indexOf('http') > -1) {
                url = node.substr('http://'.length)
            } else {
                url = node
            }
            SDK.SERVER_NODE = url
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
            result: '',
            desc: err.message || ''
        };
    }

    static createWallet(name: string, password: string, payer: string, callback?: string) {
        const wallet = new Wallet();
        wallet.create(name);

        const identity = new Identity();
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, name);

        wallet.defaultOntid = identity.ontid;
        wallet.addIdentity(identity);

        // let account = new Account()
        // account.create(privateKey, password, name)
        // wallet.addAccount(account)

        const walletDataStr = wallet.toJson();
        let obj: any = {
            error: 0,
            result: walletDataStr,
            desc: '',
            tx : ''
        }
        let publicKey = privateKey.getPublicKey()
        let tx = buildRegisterOntidTx(identity.ontid, publicKey,'0')
        tx.payer = new Address(payer)
        signTransaction(tx, privateKey)
        //add preExec
        let restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`)
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            //preExec success, send real request
            if (res.Result.Result == '01') {
                // restClient.sendRawTransaction(tx.serialize(), false)
                obj.tx = tx.serialize();

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: '',
                    desc: res.Result
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
        walletDataStr: string,
        label: string,
        encryptedPrivateKey: string,
        password: string,
        checksum: string,
        callback?: string
    ) {
        let obj: any;
        let identity = new Identity();
        const wallet = Wallet.parseJson(walletDataStr);

        try {
            // TODO check ontid
            const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password, checksum);
        } catch (err) {
            obj  = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
            return obj;
        }
        wallet.addIdentity(identity);
        const walletStr = wallet.toJson();
        obj = {
            error : ERROR_CODE.SUCCESS,
            result : walletStr,
            desc : ''
        }
        //check ontid on chain
        let tx = buildGetDDOTx(identity.ontid)
        let param = buildRestfulParam(tx)
        let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`
        let url = sendRawTxRestfulUrl(restUrl, true)
        return axios.post(url, param).then((res:any) => {
            let result = res.data.Result
            if (result.Result) {
                                    
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
        checksum: string,
        callback?: string
    ) {
        let identity = new Identity();
        let error = {};
        let obj: any;
        try {
            const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password, checksum);
            const wallet = new Wallet();
            wallet.create(identity.label);
            wallet.defaultOntid = identity.ontid;
            wallet.addIdentity(identity);
            const walletStr = wallet.toJson();
            obj = {
                error: ERROR_CODE.SUCCESS,
                result: walletStr,
                desc: ''
            }
            //check ontid on chain
            let tx = buildGetDDOTx(identity.ontid)
            let param = buildRestfulParam(tx)
            let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`            
            let url = sendRawTxRestfulUrl(restUrl, true)
            return axios.post(url, param).then((res: any) => {
                let result = res.data.Result
                if (result.Result) {

                } else {
                    obj.error = ERROR_CODE.UNKNOWN_ONTID
                    obj.result = ''
                    obj.desc = res.data.Result
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

    static createIdentity(label: string, password: string, payer: string, callback?: string) {
        const identity = new Identity();
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, label);
        const result = identity.toJson();
        let obj: any = {
            error: ERROR_CODE.SUCCESS,
            result,
            desc: '',
            tx : ''
        }
        //register ontid
        let publicKey = privateKey.getPublicKey()
        let tx = buildRegisterOntidTx(identity.ontid, publicKey,'0')
        tx.payer = new Address(payer)
        signTransaction(tx, privateKey)
        let restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`)
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            //preExec success, send real request
            if (res.Result.Result == '01') {
                // restClient.sendRawTransaction(tx.serialize(), false)
                obj.tx = tx.serialize();

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: '',
                    desc: res.Result
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
        const account = new Account();
        const privateKey = PrivateKey.random();
        account.create(privateKey, password, label);
        const result = account.toJson();
        const obj = {
            error : ERROR_CODE.SUCCESS,
            result,
            desc : ''
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
    }

    static importAccountWithWallet(
        walletDataStr: string,
        label: string,
        encryptedPrivateKey: string,
        password: string,
        checksum: string,
        callback?: string
    ) {
        const wallet = Wallet.parseJson(walletDataStr);
        let account = new Account();
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            account = Account.importAccount(label, encryptedPrivateKeyObj, password, checksum);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        wallet.addAccount(account);
        const walletStr = wallet.toJson();
        const obj = {
            error: ERROR_CODE.SUCCESS,
            result: walletStr,
            desc: ''
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
    }

    static signSelfClaim(
        context: string,
        claimData: string,
        ontid: string,
        encryptedPrivateKey: string,
        password: string,
        callback?: string
    )  {
        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        const restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`;
        const checksum = core.getChecksumFromOntid(ontid);
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        const claimDataObj = JSON.parse(claimData);
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
            result : claim,
            desc : ''
        };
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
    }

    static decryptEncryptedPrivateKey(
        encryptedPrivateKey: string,
        password: string,
        checksum: string,
        callback?: string
    ) {
        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch (err) {
            const result = this.getDecryptError(err);

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        const obj = {
            error : 0,
            result : privateKey,
            desc : ''
        };

        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback);
        }
        return obj;
    }

    static getClaim(claimId : string, context: string, issuer : string, subject : string, encryptedPrivateKey: string,
         password : string, payer:string, callback ?: string ) {
            let privateKey: PrivateKey;
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)   
            let checksum = core.getChecksumFromOntid(subject)     
            try {
                privateKey = encryptedPrivateKeyObj.decrypt(password,checksum);
            } catch (err) {
                let result = this.getDecryptError(err)
                callback && sendBackResult2Native(JSON.stringify(result), callback)
                return result
            }
            let path = 'claim' + claimId
            let valueObj = {
                Type : 'JSON',
                Value : {
                    Context: context,
                    Issuer: issuer
                }
            }
            const type = 'JSON'
            const value = JSON.stringify(valueObj)
            let attr = new DDOAttribute()
            attr.key = path
            attr.type = 'JSON'
            attr.value = value
            let publicKey = privateKey.getPublicKey()
            let tx = buildAddAttributeTx(subject,[attr], publicKey, '0')
            tx.payer = new Address(payer)
            signTransaction(tx, privateKey)
            let restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`)
            return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
                if (res.Result.Result == '01') {
                    //user agent will do this
                    // restClient.sendRawTransaction(tx.serialize(), false)
                    // const hash = core.sha256(core.sha256(tx.serializeUnsignedData()))
                    let obj = {
                        error: ERROR_CODE.SUCCESS,
                        result: '',
                        tx : tx.serialize()
                    }
                    callback && sendBackResult2Native(JSON.stringify(obj), callback)
                    return obj
                } else {
                    let obj = {
                        error: ERROR_CODE.PreExec_ERROR,
                        result: ''
                    }
                    callback && sendBackResult2Native(JSON.stringify(obj), callback)
                    return obj
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
        checksum: string,
        callback?: string
    ): PgpSignature | object {
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        let check : string | Address    
        if(checksum.length === 8) {
            check = checksum
        } else if(checksum.length === 40 || checksum.length === 34) {
            check = new Address(checksum)
        } else {
            throw ERROR_CODE.INVALID_PARAMS
        } 
        let result   
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password,check);
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
        return result;
    }

    static getBalance(address: string, callback?: string) {
        if (address.length === 40) {
            address = core.u160ToAddress(address);
        }
        const request = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.getBalance}/${address}`;
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
        gas: string,
        callback: string) {
        try {
            if (from.length !== 40) {
                from = core.addressToU160(from);
            }
            if (to.length !== 40) {
                to = core.addressToU160(to);
            }
        } catch (err) {
            const result = {
                error : ERROR_CODE.INVALID_PARAMS,
                result : '',
                desc : 'Illegal adderss'
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        const checksum = core.getChecksumFromAddress(new Address(from));
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        const tx = makeTransferTx(token, new Address(from), new Address(to), value, '0');
        tx.payer = new Address(from);
        signTransaction(tx, privateKey);
        const param = buildRestfulParam(tx);
        const request = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`;
        return axios.post(request, param).then( (res: any) => {
            // tslint:disable-next-line:no-console
            console.log('transfer response: ' + JSON.stringify(res.data));
            if (res.data.Error === 0) {
                const obj = {
                    error : 0,
                    result : '',
                    desc : 'Send transfer success.'
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const obj = {
                    error: res.data.Error,
                    result: '',
                    desc: 'Send transfer failed.'
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
        });
    }

    static claimOng(
        address: string,
        value: string,
        encryptedPrivateKey: string,
        password: string,
        gas: string,
        callback: string
    ) {
        try {
            if (address.length !== 40) {
                address = core.addressToU160(address);
            }

        } catch (err) {
            const result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: '',
                desc: 'Illegal adderss'
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }

        let privateKey: PrivateKey;
        const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
        const checksum = core.getChecksumFromAddress(new Address(address));
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch (err) {
            const result = this.getDecryptError(err);
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback);
            }
            return result;
        }
        let addressObj = new Address(address)
        let tx = makeClaimOngTx(addressObj, addressObj, value,'0')
        tx.payer = addressObj
        signTransaction(tx, privateKey)
        let restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`)
        return restClient.sendRawTransaction(tx.serialize()).then( res=> {
            console.log('transfer response: ' + JSON.stringify(res))
            if (res.Error === 0) {
                const obj = {
                    error: 0,
                    result: '',
                    desc: 'Claim ong successed.'
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            } else {
                const obj = {
                    error: res.Error,
                    result: '',
                    desc: 'Claim ong failed.'
                };

                if (callback) {
                    sendBackResult2Native(JSON.stringify(obj), callback);
                }
                return obj;
            }
        }).catch((err: any) => {
            const obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            };

            if (callback) {
                sendBackResult2Native(JSON.stringify(obj), callback);
            }
        });
    }

    static exportIdentityToQrcode(identityDataStr: string, callback: string) {
        const obj = Identity.parseJson(identityDataStr);
        const checksum = core.getChecksumFromOntid(obj.ontid);
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
            prefix : checksum,
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
        const checksum = core.getChecksumFromOntid(obj.ontid);
        const key = obj.controls[0].encryptedKey.key;
        const result = checksum + key;

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }

    static exportAccountToQrcode(accountDataStr: string, callback : string) {
        let obj = Account.parseJson(accountDataStr)
        let checksum = core.getChecksumFromAddress(obj.address)
        let result = {
            type: "A",
            label: obj.label,
            algorithm: 'ECDSA',
            scrypt: {
                n: 4096,
                p: 8,
                r: 8,
                dkLen: 64
            },
            key: obj.encryptedKey.key,
            prefix: checksum,
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
        const checksum = core.getChecksumFromAddress(obj.address);
        const key = obj.encryptedKey.key;
        const result = checksum + key;

        if (callback) {
            sendBackResult2Native(JSON.stringify(result), callback);
        }
        return result;
    }
}
