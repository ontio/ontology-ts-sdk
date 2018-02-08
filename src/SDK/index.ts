import {Wallet} from '../wallet'
import {Identity} from '../identity'
import {Account} from '../account'
import {Claim} from '../claim'

import {sendBackResult2Native} from '../utils'

export class Sdk {

    static createWallet(name : string, password : string, callback?: string) : string {
        let wallet = new Wallet()
        let walletDataStr = wallet.create(name, password)
        if(callback) {
            sendBackResult2Native(walletDataStr, callback)
        }
        return walletDataStr
    }

    static importWallet(encryptedPrivateKey : string, password : string, ontid : string, callback ?: string) : string {
        let wallet = new Wallet()
        let result = wallet.importWallet(encryptedPrivateKey, password, ontid)
        if(callback) {
            sendBackResult2Native(result, callback)
        }
        return result
    }

    static importIdentity(walletDataStr: string, encryptedPrivateKey : string, password : string, 
        ontid : string, callback : string) : string {
            let wallet = new Wallet()
            let result = wallet.importIdentity(walletDataStr, encryptedPrivateKey, password, ontid)
            if(callback) {
                sendBackResult2Native(result, callback)
            }
            return result
    }

    static createIdentity(privateKey : string, password : string, label : string, callback ?: string) : string {
        let identity = new Identity()
        let result = identity.createSecp256r1(privateKey, password, label)
        if(callback) {
            sendBackResult2Native(result, callback)
        }
        return result
    }

    static decryptIdentity(identityDataStr : string, password : string, callback ?: string) : boolean {
        let identity = new Identity()
        let result = identity.decrypt(identityDataStr, password)
        if(callback) {
            sendBackResult2Native(result.toString(), callback)
        }
        return result
    }

    static createAccount(privateKey: string, password: string, label: string, callback?: string): string {
        let account = new Account()
        let result = account.createSecp256r1(privateKey, password, label)
        if (callback) {
            sendBackResult2Native(result, callback)
        }
        return result
    }

    static decryptAccount(accountDataStr: string, password: string, callback?: string): boolean {
        let account = new Account()
        let result = account.decrypt(accountDataStr, password)
        if (callback) {
            sendBackResult2Native(result.toString(), callback)
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