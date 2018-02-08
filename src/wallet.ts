import * as core from './core'
import { identityData, controlData, Identity } from './identity'
import {  Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { formatDate, ab2hexstring, hexstring2ab } from './utils'
import { access } from 'fs';
import { format } from 'url';
import * as scrypt from './scrypt'

export class walletData {
    name: string;
    ontid : string;
    createTime : string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<Identity>;
    accounts: Array<Account>;
    extra: null;
};

export class Wallet {
    name: string;
    ontid: string;
    createTime: string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<Identity>;
    accounts: Array<Account>;
    extra: null;
    //what for?
    identity: Array<Identity> = [];
    account: Array<Account> = [];


    constructor() {
    }

    //create a empty wallet
     create(name: string, keyphrase: string, privateKey? : string ): Wallet {
        this.name = name;
        
        //createtime
        this.createTime = (new Date).toISOString()
        this.version = "1.0";
        this.scrypt = {
            "n": 16384,
            "r": 8,
            "p": 8
        };

        return this
    }


    addAccount(account: Account) : void {
        for (let ac of this.accounts) {
            if(ac.key === account.key) {
                return;
            }
        }
        this.accounts.push(account)
    }

    addIdentity(identity : Identity) :void {
        for (let item of this.identities) {
            if (item.ontid === identity.ontid) {
                return;
            }
        }
        this.identities.push(identity)
    }

    decryptWallet( jsonData: string, keyphrase : string ): number {
        this.wallet = JSON.parse(jsonData);

        // identity
        for ( let i=0; i<this.wallet.identities.length; i++ ){
            this.identity[i] = new Identity();
            this.identity[i].decrypt( this.wallet.identities[i], keyphrase );
        }

        // account
        for ( let i=0; i<this.wallet.accounts.length; i++ ){
            this.account[i] = new Account();
            this.account[i].decrypt( this.wallet.accounts[i], keyphrase );
        } 
 
        return 0;
    }

    /* load walletData json string to instantiated a wallet */
    loadWalletFile(walletDataStr : string) : number {
        this.wallet = JSON.parse(walletDataStr)
        return 0;
    }

    //import wallet by scanning qrcode or input encrypted private key and ontid
    //1. check password
    //2. check ontid
    //3. return new wallet json string
    /* 
    *@return {string} if return "", password is error; otherwise return json string
    */
    importWallet(encryptedPrivateKey : string, password : string, ontid : string) : string {
        //decrypt with password to get privateKey
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password)
        if(!wifKey){
            return '';
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        //TODO: call request to check onid
        this.create('Default name', password, privateKey)
        //set ontid
        this.wallet.ontid = ontid
        return JSON.stringify(this.wallet)
    }

    /* 
    load an identity and return modified walletData json string to save
    @param { string } walletDataString
    @param { string } encryptedPrivateKey
    @param { string } password
    @param { string } ontid
    @return { string } modified wallet json string
    */
    importIdentity( walletDataStr : string, encryptedPrivateKey : string, password : string, onid : string) {
        //decrypt with password to get privateKey
        this.wallet = JSON.parse(walletDataStr)
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password)
        if (!wifKey) {
            return '';
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        //TODO: call request to check onid, this is a sync process

        let identity = new Identity()
        identity.createSecp256r1(privateKey, password, '')//set label as '', maybe will change it  
        this.addIdentity(identity.identity)
        return JSON.stringify(this.wallet)
    }

    setDefaultAccount(index : number) : boolean {
        let length = this.accounts.length
        if(index < 0 || index > length -1) {
            return false
        }
        for(let i = 0; i< length ;i++) {
            this.accounts[i].isDefault = index === i ? true : false
        }
        return true
    }

    setDefaultIdentity(index : number) : boolean {
        let length = this.identities.length
        if (index < 0 || index > length - 1) {
            return false
        }
        for (let i = 0; i < length; i++) {
            this.identities[i].isDefault = index === i ? true : false
        }
        return true
    }

    toJson() : string {
        let obj = {
            name: this.name,
            ontid: this.ontid,
            createTime: this.createTime,
            version: this.version,
            scrypt: this.scrypt,
            identities: this.identities,
            accounts : this.accounts,
            extra: null
        }

        return JSON.stringify(obj)
    }

    static parseJson(json : string) : Wallet {
        let wallet = new Wallet()
        let obj = JSON.parse(json)
        wallet.name = obj.name
        wallet.ontid = obj.ontid
        wallet.createTime = obj.createTime
        wallet.version = obj.version
        wallet.scrypt = obj.scrypt
        wallet.identities = obj.identities
        wallet.accounts = obj.accounts
        wallet.extra = obj.extra 
        return wallet
    }

    signatureData() : string {
        return ''
    }
}

