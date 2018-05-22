
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

import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim} from '../claim/claim'
import { PrivateKey, PgpSignature } from '../crypto';
import {sendBackResult2Native, EventEmitter, str2hexstr, ab2hexstring, now} from '../utils'
import * as core from '../core'
import { buildTxParam, buildRpcParam, parseEventNotify, makeTransferTransaction, buildRestfulParam, sendRawTxRestfulUrl, signTransaction} from '../transaction/transactionBuilder'
import { buildAddAttributeTx, buildRegisterOntidTx, buildGetDDOTx} from '../smartcontract/ontidContractTxBuilder'
import { ERROR_CODE } from '../error';
import { ONT_NETWORK, TEST_NODE, REST_API, HTTP_REST_PORT, HTTP_WS_PORT, TEST_ONT_URL } from '../consts';
import TxSender from '../transaction/txSender'
import axios from 'axios'
import {BigNumber} from 'bignumber.js'
import { DDO, DDOAttribute} from '../transaction/ddo';
import RestClient from '../network/rest/restClient';
import { makeClaimOngTx, makeTransferTx } from '../smartcontract/ontAssetTxBuilder';
import { Address } from '../crypto/address';


export class SDK {
    static SERVER_NODE : string = TEST_NODE
    static REST_PORT: string = HTTP_REST_PORT
    static SOCKET_PORT : string = HTTP_WS_PORT

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
        throw new Error('Can not set ' + node + 'as server node')
    }

    static setRestPort(port: string) {
        if (port) {
            SDK.REST_PORT = port
            return;
        }
        throw new Error('Can not set ' + port + ' as restful port')
    }

    static setSocketPort(port: string) {
        if (port) {
            SDK.SOCKET_PORT = port 
            return;
        }
        throw new Error('Can not set ' + port + 'as socket port')
    }

    static getDecryptError(err:any) {
        return {
            error: ERROR_CODE.Decrypto_ERROR,
            result: '',
            desc: err.message || ''
        }
    }

    static createWallet(name : string, password : string, payer:string, callback?: string) {
        let wallet = new Wallet()
        wallet.create(name)
        let identity = new Identity()
        const privateKey = PrivateKey.random();
        
        identity.create(privateKey, password, name)

        wallet.defaultOntid = identity.ontid
        wallet.addIdentity(identity)

        // let account = new Account()
        // account.create(privateKey, password, name)
        // wallet.addAccount(account)

        //
        let walletDataStr = wallet.toJson()
        let obj = {
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
                obj.tx = tx.serialize()
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj
            } else {
                let errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: '',
                    desc: res.Result
                }
                callback && sendBackResult2Native(JSON.stringify(errResult), callback)
                return errResult
            }
        }).catch((err: any) => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    static importIdentityWithWallet(walletDataStr : string, label : string, encryptedPrivateKey : string, 
        password : string, checksum: string, callback ?: string) {
        let identity = new Identity()
        let wallet = Wallet.parseJson(walletDataStr)
        try {
            //TODO check ontid
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
            identity = Identity.importIdentity(label,encryptedPrivateKeyObj, password, checksum)
        } catch (err) {
            let obj  = this.getDecryptError(err)

            callback && sendBackResult2Native(JSON.stringify(obj), callback)
            return obj
        }
        wallet.addIdentity(identity)
        let walletStr = wallet.toJson()
        let obj = {
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
                obj.error = ERROR_CODE.UNKNOWN_ONTID
                obj.result = ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
            return obj 
        }).catch(err => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result : ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    //send http post to check
    static importIdentityAndCreateWallet(label : string, encryptedPrivateKey : string, password : string,checksum: string, callback ?: string) {
        let identity = new Identity()
        let error = {}
        try {
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password,checksum)
            let wallet = new Wallet()
            wallet.create(identity.label)
            wallet.defaultOntid = identity.ontid
            wallet.addIdentity(identity)
            let walletStr = wallet.toJson()
            let obj = {
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
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj
            }).catch(err => {
                let obj = {
                    error: ERROR_CODE.NETWORK_ERROR,
                    result : ''
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            })
            // callback && sendBackResult2Native(JSON.stringify(obj), callback)
            // return obj
        } catch(err) {
            error = this.getDecryptError(err)
            callback && sendBackResult2Native(JSON.stringify(error), callback)
            return Promise.reject(error) 
        }
    }

    static createIdentity(label : string, password : string, payer:string, callback?: string) {
        let identity = new Identity()
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, label)        
        let result = identity.toJson()
        let obj = {
            error: ERROR_CODE.SUCCESS,
            result: result,
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
                obj.tx = tx.serialize()
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj
            } else {
                let errResult = {
                    error: ERROR_CODE.PreExec_ERROR,
                    result: '',
                    desc: res.Result
                }
                callback && sendBackResult2Native(JSON.stringify(errResult), callback)
                return errResult
            }
        }).catch((err: any) => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    static createAccount(label: string, password: string, callback?: string) {
        let account = new Account()
        let privateKey = PrivateKey.random();
        account.create(privateKey, password, label)
        let result = account.toJson()
        let obj = {
            error : ERROR_CODE.SUCCESS,
            result : result,
            desc : ''
        }
        callback && sendBackResult2Native(JSON.stringify(obj), callback)
        return obj
    }

    static importAccountWithWallet(walletDataStr:string, label : string, encryptedPrivateKey: string, password:string, checksum:string,callback ?: string) {
        let wallet = Wallet.parseJson(walletDataStr)
        let account = new Account()
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        try {
            account = Account.importAccount(label, encryptedPrivateKeyObj, password, checksum)
        } catch(err) {
            let result = this.getDecryptError(err)
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        wallet.addAccount(account)
        let walletStr = wallet.toJson()
        let obj = {
            error: ERROR_CODE.SUCCESS,
            result: walletStr,
            desc: ''
        }
        callback && sendBackResult2Native(JSON.stringify(obj), callback)
        return obj
    }

    static signSelfClaim(context: string, claimData : string, ontid : string,
         encryptedPrivateKey : string, password : string, callback ?:string)  {
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`
        let checksum = core.getChecksumFromOntid(ontid)
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch(err) {
            let result = this.getDecryptError(err)

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        
            let claimDataObj = JSON.parse(claimData)
            const metadata = {
                issuer: ontid,
                subject: ontid,
                issuedAt: now()
            };
           
            // todo: pass real public key id
            const publicKeyId = ontid + '#keys-1';
            const claim = new Claim(metadata, undefined, undefined)
            claim.sign(restUrl, publicKeyId, privateKey);
            let obj = {
                error : 0,
                result : claim,
                desc : ''
            }
            if(callback) {
                sendBackResult2Native(JSON.stringify(obj), callback)
            }
            return obj
    }


    static decryptEncryptedPrivateKey( encryptedPrivateKey : string, password : string,checksum:string, callback?: string) {
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password,checksum);
        } catch(err) {
            let result = this.getDecryptError(err)

            if(callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        let obj = {
            error : 0,
            result : privateKey,
            desc : ''
        }
        
        if (callback) {
            sendBackResult2Native(JSON.stringify(obj), callback)
        }
        return obj
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
            }).catch((err: any) => {
                let obj = {
                    error: ERROR_CODE.NETWORK_ERROR,
                    result: ''
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            })
    }

    static signData(content: string, encryptedPrivateKey: string, password: string, checksum: string, callback? : string): PgpSignature | object {
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
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password,check);
        } catch (err) {
            let result = this.getDecryptError(err)

            callback && sendBackResult2Native(JSON.stringify(result), callback)
            return result
        }
        const signature = privateKey.sign(content);
        const result = signature.serializePgp();
        
        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
    }


    static getBalance(address : string, callback ?: string) {
        if(address.length === 40) {
            address = core.u160ToAddress(address)
        }
        let request = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.getBalance}/${address}`
        return axios.get(request).then((res : any) => {
            if(res.data.Error === 0) {
                let result = res.data.Result
                let obj = {
                    error : 0,
                    result : result
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj                
            } else {
                let obj = {
                    error: res.data.Error,
                    result : ''
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj                
            }
        }).catch( (err:any) => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
            return Promise.reject(obj)
        })
    }

    //pls check balance before transfer
    static transferAssets(token: string , from : string, to : string, value : string, encryptedPrivateKey : string, password : string, gas:string,callback : string) {
        try {
            if (from.length !== 40) {
                from = core.addressToU160(from)
            }
            if (to.length !== 40) {
                to = core.addressToU160(to)
            }
         } catch(err) {
            let result = {
                error : ERROR_CODE.INVALID_PARAMS,
                result : '',
                desc : 'Illegal adderss'
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback)
            return result
         }
        
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey) 
        let checksum = core.getChecksumFromAddress(new Address(from))       
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password,checksum);
        } catch (err) {
            let result = this.getDecryptError(err)
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        
        let tx = makeTransferTx(token,new Address(from), new Address(to), value, '0')
        tx.payer = new Address(from)
        signTransaction(tx, privateKey)
        var param = buildRestfulParam(tx)
        let request = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`
        return axios.post(request, param).then( (res:any) => {
            console.log('transfer response: ' + JSON.stringify(res.data))
            if(res.data.Error === 0) {
                let obj = {
                    error : 0,
                    result : '',
                    desc : 'Send transfer success.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj                
            } else {
                let obj = {
                    error: res.data.Error,
                    result: '',
                    desc: 'Send transfer failed.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj                
            }
        }).catch( (err:any) => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    static claimOng(address: string, value: string, encryptedPrivateKey: string, password: string, gas : string, callback: string) {
        try {
            if (address.length !== 40) {
                address = core.addressToU160(address)
            }
            
        } catch (err) {
            let result = {
                error: ERROR_CODE.INVALID_PARAMS,
                result: '',
                desc: 'Illegal adderss'
            }
            callback && sendBackResult2Native(JSON.stringify(result), callback)
            return result
        }

        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        let checksum = core.getChecksumFromAddress(new Address(address))
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password, checksum);
        } catch (err) {
            let result = this.getDecryptError(err)
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        let addressObj = new Address(address)
        let tx = makeClaimOngTx(addressObj, addressObj, value,'0')
        tx.payer = addressObj
        signTransaction(tx, privateKey)
        let restClient = new RestClient(`http://${SDK.SERVER_NODE}:${SDK.REST_PORT}`)
        return restClient.sendRawTransaction(tx.serialize()).then( res=> {
            console.log('transfer response: ' + JSON.stringify(res))
            if (res.Error === 0) {
                let obj = {
                    error: 0,
                    result: '',
                    desc: 'Claim ong successed.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj
            } else {
                let obj = {
                    error: res.Error,
                    result: '',
                    desc: 'Claim ong failed.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                return obj
            }
        }).catch((err: any) => {
            let obj = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    static exportIdentityToQrcode(identityDataStr : string, callback : string) {
        let obj = Identity.parseJson(identityDataStr)
        let checksum = core.getChecksumFromOntid(obj.ontid)
        let result = {
            type : "I",
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
        }
        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
    }

    static exportIdentityToKeystring(identityDataStr : string, callback : string) {
        let obj = Identity.parseJson(identityDataStr)
        let checksum = core.getChecksumFromOntid(obj.ontid)
        let key = obj.controls[0].encryptedKey.key
        let result = checksum + key
        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
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
        }
        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
    }

    static exportAccountToKeystring(accountDataStr: string, callback: string) {
        let obj = Account.parseJson(accountDataStr)
        let checksum = core.getChecksumFromAddress(obj.address)
        let key = obj.encryptedKey.key
        let result = checksum + key
        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
    }

}