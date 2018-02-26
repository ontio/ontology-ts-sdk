import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim, Metadata} from '../claim'
import * as scrypt from '../scrypt'
import {sendBackResult2Native} from '../utils'
import * as core from '../core'

export class SDK {

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
        return walletDataStr
    }

    static importIdentityByQrcode(identityDataStr : string ,encryptedPrivateKey : string, password : string, ontid : string, callback ?: string) : string {
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
        let result = wallet.toJson()
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
        //TODO check ontid
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
            let claimDataObj = JSON.parse(claimData)
            let metadata = new Metadata()
            metadata.createTime = (new Date()).toISOString()
            metadata.issuer = ontid
            metadata.subject = ontid
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

}