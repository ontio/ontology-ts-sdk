import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim, Metadata, Signature} from '../claim'
import * as scrypt from '../scrypt'
import {sendBackResult2Native, EventEmitter, str2hexstr} from '../utils'
import * as core from '../core'
import {buildAddAttributeTx, buildTxParam, buildRpcParam,  buildRegisterOntidTx, parseEventNotify, buildGetDDOTx, checkOntid, makeTransferTransaction} from '../transaction/makeTransactions'
import { ERROR_CODE } from '../error';
import {tx_url, socket_url, ONT_NETWORK, transfer_url} from '../consts'
import { encrypt } from '../scrypt';
import TxSender from '../transaction/TxSender'
import axios from 'axios'

export class SDK {

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
        let privateKey = core.generatePrivateKeyStr()
        identity.create(privateKey, password,name)

        wallet.defaultOntid = identity.ontid
        wallet.addIdentity(identity)

        // let account = new Account()
        // account.create(privateKey, password, name)
        // wallet.addAccount(account)

        let walletDataStr = wallet.toJson()
         
        let tx = buildRegisterOntidTx(identity.ontid, privateKey)
        let param = buildTxParam(tx)
        
        const socketCallback = function(res:any, socket:any) {
            let obj = {
                error: ERROR_CODE.SUCCESS,
                result: walletDataStr,
                desc: ''
            }
            if(res.Error === 0) {
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                socket.close()
            } else {
                let errResult = {
                    error: res.Error,
                    result: '',
                    desc: res.Result
                }
                if (callback) {
                    sendBackResult2Native(JSON.stringify(errResult), callback)
                }
                socket.close()
            }
        } 

        var txSender = new TxSender(ONT_NETWORK.TEST)
        txSender.sendTxWithSocket(param, socketCallback)

        let obj = {
            error : 0,
            result : walletDataStr,
            desc : ''
        }
        return obj
    }

    static importIdentityWithWallet(walletDataStr : string, label : string, encryptedPrivateKey : string, 
        password : string, callback ?: string) {
        let identity = new Identity()
        let wallet = Wallet.parseJson(walletDataStr)
        try {
            //TODO check ontid
            identity = Identity.importIdentity(label, encryptedPrivateKey, password)
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
        callback && sendBackResult2Native(JSON.stringify(obj), callback)
        return obj
    }

    //send http post to check
    static importIdentity(label : string, encryptedPrivateKey : string, password : string, callback ?: string) {
        let identity = new Identity()
        let error = {}
        /* try {
            Identity.importIdentity(label, encryptedPrivateKey, password).then((res:any)=>{
                if(res.result) {
                    identity = res.result
                    let wallet = new Wallet()
                    wallet.create(identity.label)
                    wallet.defaultOntid = identity.ontid
                    wallet.addIdentity(identity)
                    let walletStr = wallet.toJson()
                    let obj = {
                        error : ERROR_CODE.SUCCESS,
                        result : walletStr,
                        desc : ''
                    }
                    sendBackResult2Native(JSON.stringify(obj), callback)
                } else {
                    let obj = {
                        error : res.error,
                        result : null,
                        desc : ''
                    }
                    sendBackResult2Native(JSON.stringify(obj), callback)
                }
            }, (err:any)=>{
                let obj = {
                    error : ERROR_CODE.NETWORK_ERROR,
                    result : '',
                    desc : '' 
                }
                sendBackResult2Native(JSON.stringify(obj), callback)
            })
        } catch(err) {
            error = {
                error : err
            }
            sendBackResult2Native(JSON.stringify(error), callback)
        } */

        try {
            identity = Identity.importIdentity(label, encryptedPrivateKey, password)
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
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
            return obj
        } catch(err) {
            error = this.getDecryptError(err)
            callback && sendBackResult2Native(JSON.stringify(error), callback)
            return error
        }
    }

    static createIdentity(label : string, password : string, callback?: string) {
        let identity = new Identity()
        let privateKey = core.generatePrivateKeyStr()
        identity.create(privateKey, password, label)
        let result = identity.toJson()
        if (callback) {
            let obj = {
                error: ERROR_CODE.SUCCESS,
                result: result,
                desc: ''
            }
            sendBackResult2Native(JSON.stringify(obj), callback)
        }
        return result
    }

    static createAccount(label: string, password: string, callback?: string): string {
        let account = new Account()
        let privateKey = core.generatePrivateKeyStr()        
        account.create(privateKey, password, label)
        let result = account.toJson()
        if (callback) {
            let obj = {
                error : ERROR_CODE.SUCCESS,
                result : result,
                desc : ''
            }
            sendBackResult2Native(JSON.stringify(obj), callback)
        }
        return result
    }

    static importAccountWithWallet(walletDataStr:string, label : string, encryptedPrivateKey:string, password:string, callback: string) {
        let wallet = Wallet.parseJson(walletDataStr)
        let account = new Account()
        try {
            account = Account.importAccount(label, encryptedPrivateKey, password)
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
         encryptedPrivateKey : string, password : string, callback :string)  {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        } catch(err) {
            let result = this.getDecryptError(err)

            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        
            let claimDataObj = JSON.parse(claimData)
            let metadata = new Metadata()
            let date = (new Date()).toISOString()
            if(date.indexOf('.') > -1) {
                date = date.substring(0, date.indexOf('.')) + 'Z'
            }
            metadata.CreateTime = date
            metadata.Issuer = ontid
            metadata.Subject = ontid
            let claim = new Claim(context, claimDataObj, metadata)
            claim.sign(privateKey)
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
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
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


    //subject : 声明接收者ontid
    static buildClaimTx(path: string, value: string, subject : string, encryptedPrivateKey: string, 
        password : string) {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        } catch (err) {
            let result = this.getDecryptError(err)
            return result
        }
        let tx = buildAddAttributeTx(path, value, subject,  privateKey)
        let param = buildTxParam(tx)
        return {
            error : 0,
            result : param,
            desc : ''
        }
    }

    static getClaim(claimId : string, context: string, issuer : string, subject : string, encryptedPrivateKey : string,
         password : string, callback : string ) {
            let privateKey = ''
            try {
                privateKey = scrypt.decrypt(encryptedPrivateKey, password);
            } catch (err) {
                let result = this.getDecryptError(err)
                callback && sendBackResult2Native(JSON.stringify(result), callback)
                return result
            }
            let path = claimId
            let value = {
                Context : context,
                Ontid : issuer
            }
            // let tx = buildAddAttributeTx(path, JSON.stringify(value), subject, privateKey)
            let tx = buildAddAttributeTx(path, issuer, subject, privateKey)
            
            let txId = core.getHash(tx.serialize())
            let param = buildTxParam(tx)
            //TODO：根据不同环境选择不同网络
            var txSender = new TxSender(ONT_NETWORK.TEST)
            const socketCallback = function(res : any, socket : any) {
                console.log('res: '+ JSON.stringify(res))
                if(res.Result.BlockHeight) {
                    let obj = {
                        error : ERROR_CODE.SUCCESS,
                        result : txId
                    }
                    callback && sendBackResult2Native(JSON.stringify(obj), callback)
                    socket.close()
                }
            }

            txSender.sendTxWithSocket(param, socketCallback)
    }

    static signData(content : string, encryptedPrivateKey : string, password : string, callback? : string) {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        } catch (err) {
            let result = this.getDecryptError(err)

            callback && sendBackResult2Native(JSON.stringify(result), callback)
            return result
        }
        let value = core.signatureData(content, privateKey)

        let result = new Signature()
        result.Value = value

        callback && sendBackResult2Native(JSON.stringify(result), callback)
        return result
    }


    static getBalance(address : string, callback : string) {
        var url = 'http://192.168.3.141',
            restPort = '20384',
            balanceApi = '/api/v1/balance'
        if(address.length === 40) {
            address = core.addressToBase58(address)
        }
        let request = `${url}:${restPort}${balanceApi}/${address}`
        axios.get(request).then((res : any) => {
            if(res.data.Error === 0) {
                let obj = {
                    error : 0,
                    result : res.data.Result
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            } else {
                let obj = {
                    error: res.data.Error,
                    result : ''
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
                
            }
        }).catch( (err:any) => {
            let obj = {
                error: JSON.stringify(err),
                result: ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        })
    }

    //can only test Ont transfer now
    static transferAssets(token: string , from : string, to : string, value : string, encryptedPrivateKey : string, password : string, callback : string) {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password)
        } catch (err) {
            let result = this.getDecryptError(err)
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        let tx = makeTransferTransaction('ONT',from, to, value, privateKey)
        var param = buildRpcParam(tx)

        axios.post(transfer_url, param).then( (res:any) => {
            console.log('transfer response: ' + JSON.stringify(res.data))
            if(res.data.error === 0) {
                let obj = {
                    error : 0,
                    result : '',
                    desc : 'Send transfer success.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            } else {
                let obj = {
                    error: res.data.error,
                    result: '',
                    desc: 'Send transfer failed.'
                }
                callback && sendBackResult2Native(JSON.stringify(obj), callback)
            }
        }).catch( (err:any) => {
            console.log(err)
        })
    }

}