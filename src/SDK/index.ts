import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim, Metadata} from '../claim'
import * as scrypt from '../scrypt'
import {sendBackResult2Native, EventEmitter} from '../utils'
import * as core from '../core'
import {buildAddAttributeTxParam, buildRegisterOntidTx, parseEventNotify, buildGetDDOTx, checkOntid} from '../transaction/makeTransactions'
import { ERROR_CODE } from '../error';
import {tx_url, socket_url} from '../consts'
import { encrypt } from '../scrypt';

export class SDK {

    //this method may need to wait too long, will remove it
    static checkOntid(ontid : string, privateKey : string, result:string, callback ?: string) {
        let param = buildGetDDOTx(ontid, privateKey)
        const socket = new WebSocket(socket_url)
        socket.onopen = () => {
            console.log('connected')
            socket.send(param)
        }
        socket.onmessage = (event) => {
            let res
            if (typeof event.data === 'string') {
                res = JSON.parse(event.data)
            }
            console.log('response for checkontid: ' + JSON.stringify(res))
            if(callback) {
                sendBackResult2Native(result, callback)
            }
            socket.close()
        }
        socket.onerror = (event: any) => {
            //no server or server is stopped
            let errResult = {
                error: ERROR_CODE.NETWORK_ERROR,
                result : '',
                desc : 'Network Error'
            }
            if(callback) {
                sendBackResult2Native(JSON.stringify(errResult), callback)
            }
            console.log(event)
            socket.close()
        }
    }


    //result 要发送的数据
    //callback 回调函数名
    static sendTx(param : string, result: string, callback ?: string) {
        const socket = new WebSocket(socket_url)
        socket.onopen = () => {
            console.log('connected')
            socket.send(param)
        }
        socket.onmessage = (event) => {
            let res
            if (typeof event.data === 'string') {
                res = JSON.parse(event.data)
            }
            if(res.Error == ERROR_CODE.SUCCESS) {
                setTimeout(()=>{
                    let obj = {
                        error : ERROR_CODE.SUCCESS,
                        result : result,
                        desc : ''
                    }
                    if(callback) {
                        sendBackResult2Native(JSON.stringify(obj), callback)
                    }
                },2000)
            } else {
                let errResult = {
                    error: res.Error,
                    result : '',
                    desc: res.Result
                }
                if(callback) {
                    sendBackResult2Native(JSON.stringify(errResult), callback)
                }
            }
            socket.close()
            console.log('response for send tx: ' + JSON.stringify(res))
            
            /*  wait too long, remove it
            if (res.Action === 'Notify') {
                let parsedRes = parseEventNotify(res)
                console.log('paresed event notify: ' + JSON.stringify(parsedRes))
                if (parsedRes.Error == 0 && parsedRes.Result.BlockHeight) {
                    sendBackResult2Native(result, callback)
                } else {
                    let errResult = {
                        error : parsedRes.Error,
                        desc :  parsedRes.Result
                    }
                    sendBackResult2Native(JSON.stringify(errResult), callback)
                }

                socket.close()
            } */
        }
        socket.onerror = (event:any) => {
            //no server or server is stopped
            let errResult = {
                error: ERROR_CODE.NETWORK_ERROR,
                result: '',
                desc: 'Network Error'
            }
            callback && sendBackResult2Native(JSON.stringify(errResult), callback)
            console.log(event)
            socket.close()
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
        let walletDataStr = wallet.toJson()
        
        let param = buildRegisterOntidTx(identity.ontid, privateKey)
        
        SDK.sendTx(param, walletDataStr, callback)
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
            let obj  = {
                error : err,
                result : ''
            }
            callback && sendBackResult2Native(JSON.stringify(obj), callback)
        }
        wallet.addIdentity(identity)
        let walletStr = wallet.toJson()
        let obj = {
            error : ERROR_CODE.SUCCESS,
            result : walletStr,
            desc : ''
        }
        callback && sendBackResult2Native(JSON.stringify(obj), callback)
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
            error = {
                error: err
            }
            callback && sendBackResult2Native(JSON.stringify(error), callback)
            return error
        }
    }


    static createAccount(password: string, label: string, callback?: string): string {
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

    static signSelfClaim(context: string, claimData : string, ontid : string,
         encryptedPrivateKey : string, password : string, callback :string)  {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        } catch(err) {
            let result = {
                error : err,
                result : '',
                desc : ''
            }
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result
        }
        
            let claimDataObj = JSON.parse(claimData)
            let metadata = new Metadata()
            metadata.CreateTime = (new Date()).toISOString()
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
            let result = {
                error : err,
                result : '',
                desc : ''
            }
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

    static buildClaimTx(path: string, value: string, ontid: string, encryptedPrivateKey: string, 
        password : string) {
        let privateKey = ''
        try {
            privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        } catch (err) {
            let result = {
                error: err,
                result : ''
            }
            return result
        }
        let param = buildAddAttributeTxParam(path, value, ontid, privateKey)
        return {
            error : 0,
            result : param,
            desc : ''
        }
    }


}