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

import { Identity } from './identity'
import { Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { PrivateKey } from './crypto';
import * as CryptoJS from 'crypto-js'


export class Wallet {
    name: string;
    defaultOntid: string = '';
    defaultAccountAddress : string = '';
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
            "n": DEFAULT_SCRYPT.cost,
            "r": DEFAULT_SCRYPT.blockSize,
            "p": DEFAULT_SCRYPT.parallel
        };

        return this
    }

    static createIdentityWallet (password : string ,name ?: string) {
        let wallet = new Wallet()
        if(!name) {
            name = 'Default name'
        }
        wallet.create(name)
        let identity = new Identity()
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, name)

        wallet.defaultOntid = identity.ontid
        wallet.addIdentity(identity)
        return wallet
    }


    addAccount(account: Account) : void {
        for (let ac of this.accounts) {
            if(ac.encryptedKey.key === account.encryptedKey.key) {
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


    

    setDefaultAccount(address : string) : void {
        this.defaultAccountAddress = address
    }

    setDefaultIdentity(ontid : string) : void {
        this.defaultOntid = ontid
    }

    
    toJson() : string {
        return JSON.stringify(this.toJsonObj());
    }

    /**
     * Serializes to JSON object.
     * 
     * Returned object will not be stringified.
     * 
     */
    toJsonObj() : any {
        let obj = {
            name: this.name,
            defaultOntid: this.defaultOntid,
            defaultAccountAddress : this.defaultAccountAddress,
            createTime: this.createTime,
            version: this.version,
            scrypt: this.scrypt,
            identities: this.identities.map(i => i.toJsonObj()),
            accounts : this.accounts.map(a => a.toJsonObj()),
            extra: null
        }
    
        return obj;
    }

    static parseJson(json : string) : Wallet {
        return Wallet.parseJsonObj(JSON.parse(json));
    }

    /**
     * Deserializes JSON object.
     * 
     * Object should be real object, not stringified.
     * 
     * @param obj JSON object
     */
    static parseJsonObj(obj : any) : Wallet {
        let wallet = new Wallet()
        wallet.name = obj.name
        wallet.defaultOntid = obj.defaultOntid
        wallet.defaultAccountAddress = obj.defaultAccountAddress
        wallet.createTime = obj.createTime
        wallet.version = obj.version
        wallet.scrypt = obj.scrypt
        wallet.identities = (obj.identities as any[]).map(i => Identity.parseJsonObj(i))
        wallet.accounts = (obj.accounts as any[]).map(a => Account.parseJsonObj(a))
        wallet.extra = obj.extra 
        return wallet
    }

    signatureData() : string {
        return ''
    }

    /* 
    *generate a wallet file that is compatible with cli wallet.
    */
    toWalletFile() : any {
        let obj = this.toJsonObj()
        //remove addressHash of encryptedKey to compatible with cli wallet
        obj.accounts.forEach( (a:any) => {
            let encryptedKey = new Buffer(a.key, 'base64').toString('hex')
            a.key = new Buffer(encryptedKey.substring(8), 'hex').toString('base64')
        })
        return obj
    }

    static fromWalletFile(obj : any) : Wallet {
        let wallet = Wallet.parseJsonObj(obj)
        //restore encrypted private key to add addressHash    
        wallet.accounts.forEach(a => {
            let addressSha256 = CryptoJS.SHA256(a.address).toString();
            let addressSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
            let addresshash = addressSha256_2.slice(0, 8);
            let key = addresshash + a.encryptedKey.key
            a.encryptedKey.key = new Buffer(key, 'hex').toString('base64')
        })
        return wallet
    }
}

