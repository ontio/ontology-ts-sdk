import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim, Metadata} from '../claim'
import * as scrypt from '../scrypt'
import {sendBackResult2Native, EventEmitter} from '../utils'
import * as core from '../core'
import {buildAddAttributeTxParam, buildRegisterOntidTx, socket_url, parseEventNotify, buildGetDDOTx} from '../transaction/makeTransactions'


export class SDK {

    static checkOntid(ontid : string, privateKey : string, result:string, callback : string) {
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
            sendBackResult2Native(result, callback)
            socket.close()
        }
        socket.onerror = (event: any) => {
            //no server or server is stopped
            let errResult = {
                error: event.data
            }
            sendBackResult2Native(JSON.stringify(errResult), callback)
            console.log(event)
            socket.close()
        }
    }

    //result 要发送的数据
    //callback 回调函数名
    static sendTx(param : string, result: string, callback : string) {
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
            console.log('response for send tx: ' + JSON.stringify(res))
            
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
            }
        }
        socket.onerror = (event:any) => {
            //no server or server is stopped
            let errResult = {
                error : event.data
            }
            sendBackResult2Native(JSON.stringify(errResult), callback)
            console.log(event)
            socket.close()
        }
    }

    static createWallet(name : string, password : string, callback?: string) : string {
        let wallet = new Wallet()
        wallet.create(name)
        let identity = new Identity()
        let privateKey = core.generatePrivateKeyStr()
        identity.create(privateKey, password,name)
        //TODO register ontid
        wallet.defaultOntid = identity.ontid
        wallet.addIdentity(identity)
        let walletDataStr = wallet.toJson()
        if(callback) {
            sendBackResult2Native(walletDataStr, callback)
        }

        // let param = buildRegisterOntidTx(identity.ontid, privateKey)
        // if(callback) {
        //     SDK.sendTx(param, walletDataStr, callback)
        // }
        return walletDataStr
    }

    static registerOntid(walletDataStr : string, callback : string) {
        let wallet = Wallet.parseJson(walletDataStr)
        const ontid = wallet.identities[0].ontid
        const privateKey = wallet.identities[0].privateKey[0]
        let param = buildRegisterOntidTx(ontid, privateKey)
        SDK.sendTx(param, walletDataStr, callback)
    }

    static importIdentityByQrcode(identityDataStr : string ,encryptedPrivateKey : string, password : string, ontid : string, callback : string) : string {
        let wallet = new Wallet()
        wallet.create('Default name')
        wallet.defaultOntid = ontid
        let identity = (<Identity>{})
        try {
            identity = Identity.importIdentity(identityDataStr ,encryptedPrivateKey, password, ontid)
        } catch (err) {
            let result = {
                error : err
            }
            if(callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
        }
        wallet.addIdentity(identity)

        // //check ontid
        let result = wallet.toJson()
        // SDK.checkOntid(identity.ontid, identity.privateKey[0], result, callback)

        if(callback) {    
            sendBackResult2Native(result, callback)
        }
        return result
    }

    static importIdentityByInput(encryptedPrivateKey:string, ontid : string, password : string, callback : string) : string {
        let wallet = new Wallet()
        wallet.create('Default name')
        let identity = (<Identity>{})
        try {
            identity = Identity.importIdentity('', encryptedPrivateKey, password, ontid)
        } catch (err) {
            let result = {
                error: err
            }
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
        }
        wallet.addIdentity(identity)
        wallet.defaultOntid = ontid
        let result = wallet.toJson()
        if (callback) {
            sendBackResult2Native(result, callback)
        }
        // SDK.checkOntid(identity.ontid, identity.privateKey[0], result, callback)
        return result
    }

    static addIdentityToWallet(walletDataStr: string,identityDataStr : string, encryptedPrivateKey : string, password : string, 
        ontid : string, callback : string) : string {
            let wallet = Wallet.parseJson(walletDataStr)
            //TODO check ontid
            let identity = (<Identity>{})
            try {
                identity = Identity.importIdentity(identityDataStr,encryptedPrivateKey, password,ontid)
            } catch(err) {
                let result = {
                    error: err
                }
                if (callback) {
                    sendBackResult2Native(JSON.stringify(result), callback)
                }
            }
            wallet.addIdentity(identity)
            let result = wallet.toJson()
            if(callback) {
                sendBackResult2Native(result, callback)
            }
            return result
    }

    static createIdentity(privateKey : string, password : string, label : string, callback ?: string) : string {
        let identity = new Identity()
        identity.create(privateKey, password, label)
        let result = identity.toJson()
        if(callback) {
            sendBackResult2Native(result, callback)
        }
        return result
    }


    static createAccount(privateKey: string, password: string, label: string, callback?: string): string {
        let account = new Account()
        account.create(privateKey, password, label)
        let result = account.toJson()
        if (callback) {
            sendBackResult2Native(result, callback)
        }
        return result
    }

    static signSelfClaim(context: string, claimData : string, ontid : string,
         encryptedPrivateKey : string, password : string, callback :string) : string {
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password);
        if (!wifKey) {
            let result = {
                error: 'Password or encrypted privateKey error'
            }
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result.error
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
            let claimDataObj = JSON.parse(claimData)
            let metadata = new Metadata()
            metadata.CreateTime = (new Date()).toISOString()
            metadata.Issuer = ontid
            metadata.Subject = ontid
            let claim = new Claim(context, claimDataObj, metadata)
            claim.sign(privateKey)
            if(callback) {
                sendBackResult2Native(claim.signedData, callback)
            }
            return claim.signedData
    }

    static encryptPrivateKey( privateKey : string, password : string, callback : string) : string {
        let wifKey = core.getWIFFromPrivateKey(privateKey)
        let encryptedPrivateKey = scrypt.encrypt(wifKey, password)
        if(callback) {
            sendBackResult2Native(encryptedPrivateKey, callback)
        }
        return encryptedPrivateKey
    }

    static decryptEncryptedPrivateKey( encryptedPrivateKey : string, password : string, callback : string) : string {
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password);
        if (!wifKey) {
            let result = {
                error: 'Password or encrypted privateKey error'
            }
            if (callback) {
                sendBackResult2Native(JSON.stringify(result), callback)
            }
            return result.error
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        if (callback) {
            sendBackResult2Native(privateKey, callback)
        }
        return privateKey
    }

    static buildClaimTx(path: string, value: string, ontid: string, privateKey: string) {
        let param = buildAddAttributeTxParam(path, value, ontid, privateKey)
        return param
    }

}