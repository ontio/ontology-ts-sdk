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
import { buildTxParam, buildRpcParam, parseEventNotify, makeTransferTransaction, buildRestfulParam, sendRawTxRestfulUrl} from '../transaction/transactionBuilder'
import { buildAddAttributeTx, buildRegisterOntidTx, buildGetDDOTx} from '../smartcontract/ontidContract'
import { ERROR_CODE } from '../error';
import { ONT_NETWORK, TEST_NODE, REST_API, HTTP_REST_PORT, HTTP_WS_PORT, TEST_ONT_URL } from '../consts';
import TxSender from '../transaction/txSender'
import axios from 'axios'
import {BigNumber} from 'bignumber.js'
import {DDO} from '../transaction/ddo';
import RestClient from '../network/rest/restClient';


export class SDK {
    static SERVER_NODE : string = TEST_NODE
    static REST_PORT: string = HTTP_REST_PORT
    static SOCKET_PORT : string = HTTP_WS_PORT

    static setServerNode(node : string) {
        if(node) {
            SDK.SERVER_NODE = node
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

    static createWallet(name : string, password : string, callback?: string) {
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
            desc: ''
        }
         
        let tx = buildRegisterOntidTx(identity.ontid, privateKey)
        let param = buildTxParam(tx)
        //add preExec
        let restClient = new RestClient()
        return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
            //preExec success, send real request
            if (res.Result == '01') {
                restClient.sendRawTransaction(tx.serialize(), false)
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
        password : string, callback ?: string) {
        let identity = new Identity()
        let wallet = Wallet.parseJson(walletDataStr)
        try {
            //TODO check ontid
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
            identity = Identity.importIdentity(label,encryptedPrivateKeyObj, password)
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
        let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}/`
        let url = sendRawTxRestfulUrl(restUrl, true)
        return axios.post(url, param).then((res:any) => {
            if (res.data.Result && res.data.Result.length > 0 && res.data.Result[0] !== '0000000000000000') {
                                    
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
    static importIdentity(label : string, encryptedPrivateKey : string, password : string, callback ?: string) {
        let identity = new Identity()
        let error = {}
        try {
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
            identity = Identity.importIdentity(label, encryptedPrivateKeyObj, password)
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
            let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}/`            
            let url = sendRawTxRestfulUrl(restUrl, true)
            return axios.post(url, param).then((res: any) => {
                if (res.data.Result && res.data.Result.length > 0 && res.data.Result[0] !== '0000000000000000') {

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
            // callback && sendBackResult2Native(JSON.stringify(obj), callback)
            // return obj
        } catch(err) {
            error = this.getDecryptError(err)
            callback && sendBackResult2Native(JSON.stringify(error), callback)
            return Promise.reject(error) 
        }
    }

    static createIdentity(label : string, password : string, callback?: string) {
        let identity = new Identity()
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, label)        
        let result = identity.toJson()
        let obj = {
            error: ERROR_CODE.SUCCESS,
            result: result,
            desc: ''
        }
        //register ontid
        let tx = buildRegisterOntidTx(identity.ontid, privateKey)
        let param = buildRestfulParam(tx)
        let restUrl = `http://${SDK.SERVER_NODE}:${SDK.REST_PORT}${REST_API.sendRawTx}`

        //this return is need or there is bug in android
        return axios.post(restUrl, param).then((res: any) => {
            if(res.data.Error === 0) {
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            } else {
                let obj = {
                    error: JSON.stringify(res.data.Error),
                    result: res.data.Result
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)  
                return obj 
            }
        }).catch(err => {
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

    static importAccountWithWallet(walletDataStr:string, label : string, encryptedPrivateKey: string, password:string, callback ?: string) {
        let wallet = Wallet.parseJson(walletDataStr)
        let account = new Account()
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        try {
            account = Account.importAccount(label, encryptedPrivateKeyObj, password)
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
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password);
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


    static decryptEncryptedPrivateKey( encryptedPrivateKey : string, password : string, callback?: string) {
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password);
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
         password : string, callback ?: string ) {
            let privateKey: PrivateKey;
            let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)        
            try {
                privateKey = encryptedPrivateKeyObj.decrypt(password);
            } catch (err) {
                let result = this.getDecryptError(err)
                callback && sendBackResult2Native(JSON.stringify(result), callback)
                return result
            }
            let path = str2hexstr('claim' + claimId)
            let valueObj = {
                Type : 'JSON',
                Value : {
                    Context: context,
                    Issuer: issuer
                }
            }
            let type = str2hexstr('JSON')
            const value = str2hexstr(JSON.stringify(valueObj))
            let tx = buildAddAttributeTx(path, value,type, subject, privateKey)
            
            let restClient = new RestClient()
            return restClient.sendRawTransaction(tx.serialize(), true).then((res: any) => {
                if (res.Result == '01') {
                    restClient.sendRawTransaction(tx.serialize(), false)
                    const hash = core.sha256(core.sha256(tx.serializeUnsignedData()))
                    let obj = {
                        error: ERROR_CODE.SUCCESS,
                        result: hash
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

    static signData(content : string, encryptedPrivateKey : string, password : string, callback? : string): PgpSignature | object {
        let privateKey: PrivateKey;
        let encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey)        
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password);
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
    static transferAssets(token: string , from : string, to : string, value : string, encryptedPrivateKey : string, password : string, callback : string) {
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
        try {
            privateKey = encryptedPrivateKeyObj.decrypt(password);
        } catch (err) {
            let result = this.getDecryptError(err)
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }

        let tx = makeTransferTransaction('ONT',from, to, value, privateKey)
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

}