import * as core from './core'
import { identityData, controlData, Identity } from './identity'
import { accountData, Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { formatDate, ab2hexstring, hexstring2ab } from './utils'
import { access } from 'fs';
import { format } from 'url';
import * as scrypt from './scrypt'

class walletData {
    name: string;
    ontid : string;
    createTime : string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<identityData>;
    accounts: Array<accountData>;
    extra: null;
};

export class Wallet {
    jsonWallet = {
        name: "",
        ontid : "",
        createTime : "",
        version: "",
        scrypt: {
            "n": 0,
            "r": 0,
            "p": 0
        },
        identities: [],
        accounts: [],
        extra: null,
    };

    wallet: walletData;
    identity: Array<Identity> = [];
    account: Array<Account> = [];

    constructor() {
    }

    create(name: string, keyphrase: string, privateKey? : string ): string {
        // wallet
        let wallet = (<walletData>this.jsonWallet);

        wallet.name = name;
        
        //createtime
        wallet.createTime = (new Date).toISOString()
        wallet.version = "1.0";
        wallet.scrypt = {
            "n": 16384,
            "r": 8,
            "p": 8
        };

        // let privateKeyForIdentity = ab2hexstring( core.generatePrivateKey() );
        // let privateKeyForAccount = ab2hexstring( core.generatePrivateKey() );

        // identity
        let identity = new Identity();
        if(!privateKey) {
            privateKey = core.generatePrivateKeyStr()
        }
        let jsonId = identity.createSecp256r1( privateKey, keyphrase, "Default Identity" );
        wallet.identities.push(identity.identity);
        
        //ontid
        wallet.ontid = identity.identity.ontid
        //TODO : will send ontid to blockchain to register.This is a async process and will take several seconds.
        //will notify the result by triggering event.
        
        // no need to create default account

        this.wallet = wallet;

        return JSON.stringify(this.wallet);
    }

    addAccount(account: accountData) : void {
        for (let ac of this.wallet.accounts) {
            if(ac.key === accountData.key) {
                return;
            }
        }
        this.wallet.accounts.push(account)
    }

    addIdentity(identity : identityData) :void {
        for (let item of this.wallet.identities) {
            if (item.ontid === identity.ontid) {
                return;
            }
        }
        this.wallet.identities.push(identity)
    }

    decryptWallet( jsonData: string ): number {
        this.wallet = JSON.parse(jsonData);

        /* 
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
        */

        return 0;
    }

    //load wallet by scanning qrcode or input encrypted private key and ontid
    //1. check password
    //2. check ontid
    //3. return new wallet json string
    /* 
    *@return {string} if return "", password is error; otherwise return json string
    */
    loadWallet(encryptedPrivateKey : string, password : string, ontid : string) : string {
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
    load an identity and return modified wallet json string to save
    @param { string } encryptedPrivateKey
    @param { string } password
    @param { string } ontid
    @return {string} modified wallet json string
    */
    loadIdentity(encryptedPrivateKey : string, password : string, onid : string) {
        //decrypt with password to get privateKey
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password)
        if (!wifKey) {
            return '';
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        //TODO: call request to check onid

        let identity = new Identity()
        identity.createSecp256r1(privateKey, password, '')//set label as '' 
        this.addIdentity(identity.identity)
        return JSON.stringify(this.wallet)
    }
}

