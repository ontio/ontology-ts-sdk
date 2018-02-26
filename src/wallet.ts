import * as core from './core'
import { Identity } from './identity'
import { Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { ab2hexstring, hexstring2ab } from './utils'
import { access } from 'fs';
import { format } from 'url';
import * as scrypt from './scrypt'

export class Wallet {
    name: string;
    defaultOntid: string;
    createTime: string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<Identity> = [];
    accounts: Array<Account> = [];
    extra: null;

    constructor() {
    }

    //create a empty wallet
     create(name: string): Wallet {
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
            defaultOntid: this.defaultOntid,
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
        wallet.defaultOntid = obj.defaultOntid
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

