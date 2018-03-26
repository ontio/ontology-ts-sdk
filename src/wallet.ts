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
            "n": 4096,
            "r": 8,
            "p": 8
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
        let privateKey = core.generatePrivateKeyStr()
        identity.create(privateKey, password, name)

        wallet.defaultOntid = identity.ontid
        wallet.addIdentity(identity)
        return wallet
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


    

    setDefaultAccount(address : string) : void {
        this.defaultAccountAddress = address
    }

    setDefaultIdentity(ontid : string) : void {
        this.defaultOntid = ontid
    }


    toJson() : string {
        let obj = {
            name: this.name,
            defaultOntid: this.defaultOntid,
            defaultAccountAddress : this.defaultAccountAddress,
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
        wallet.defaultAccountAddress = obj.defaultAccountAddress
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

