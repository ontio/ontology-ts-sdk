import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim} from '../claim'
import * as scrypt from '../scrypt'
import {sendBackResult2Native} from '../utils'
import * as core from '../core'

export class SDK {

    static createWallet(name : string, password : string, callback?: string) : string {
        let wallet = new Wallet()
        wallet.create(name, password)
        let identity = new Identity()
        let privateKey = core.generatePrivateKeyStr()
        identity.create(privateKey, password,'')
        //TODO register ontid
        wallet.ontid = identity.ontid
        wallet.addIdentity(identity)
        let walletDataStr = wallet.toJson()
        if(callback) {
            sendBackResult2Native(walletDataStr, callback)
        }
        return walletDataStr
    }

    static importIdentityWithoutWallet(identityDataStr : string ,encryptedPrivateKey : string, password : string, ontid : string, callback ?: string) : string {
        let wallet = new Wallet()
        wallet.create('',password)
        //TODO check ontid
        wallet.ontid = ontid
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

    static importIdentityWithWallet(walletDataStr: string,identityDataStr : string, encryptedPrivateKey : string, password : string, 
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


    static signClaim(context: string, claimData : string, metadata : string,
         privateKey : string, callback :string) : string {
             let claimDataObj = JSON.parse(claimData)
             let metadataObj = JSON.parse(metadata)
            let claim = new Claim(context, claimDataObj, metadataObj, privateKey)
            if(callback) {
                sendBackResult2Native(claim.signedData, callback)
            }
            return claim.signedData
    }

}