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
import { ab2hexstring } from './utils'
import { PrivateKey } from './crypto';
import { SignatureScheme } from './crypto'

export class Account {
    address: string;
    label: string;
    lock: boolean;
    encryptedKey: PrivateKey;
    extra: null;

    //to compatible with cli wallet
    "enc-alg": string = "aes-256-ctr";
    hash : string = 'sha256';
    passwordHash : string;
    publicKey : string;
    signatureScheme : string;
    isDefault : boolean;

    constructor() {
    }

    create( privateKey: PrivateKey, password: string, label: string, signatureScheme ?: SignatureScheme  ): Account {
        
        this.address = "";
        this.label = label;
        this.lock = false;
        this.passwordHash = core.sha256(password)
        this.isDefault = false;

        if(signatureScheme) {
            this.signatureScheme = signatureScheme.label
        } else {
            this.signatureScheme = privateKey.algorithm.defaultSchema.label
        }

        this.encryptedKey = privateKey.encrypt(password); 
        
        
        const publicKey = privateKey.getPublicKey();
        
        this.publicKey = publicKey.serializeHex();
        
        let programHash = core.getSingleSigUInt160(publicKey.serializeHex());

        this.address = core.u160ToAddress(programHash);

        return this;
    }



    static importAccount(label : string ,encryptedPrivateKey : PrivateKey, password : string ) : Account {
        let account = new Account()
        const privateKey = encryptedPrivateKey.decrypt(password);
        // let contract = {
        //     script: '',
        //     parameters: [],
        //     deployed: false
        // }
        if (!label) {
            label = ab2hexstring(core.generateRandomArray(4))
        }
        account.address = "";
        account.label = label;
        account.lock = false;
        account.isDefault = false;
        account.passwordHash = core.sha256(password)

        account.encryptedKey = encryptedPrivateKey;

        const publicKey = privateKey.getPublicKey();
        account.publicKey = publicKey.key;
        account.signatureScheme = privateKey.algorithm.defaultSchema.label;

        let programHash = core.getSingleSigUInt160(publicKey.serializeHex());

        let address = core.u160ToAddress(programHash);

        account.address = address
    
        return account
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
            address: this.address,
            label: this.label,
            lock: this.lock,
            algorithm: this.encryptedKey.algorithm.label,
            parameters: this.encryptedKey.parameters.serializeJson(),
            key: this.encryptedKey.key,
            "enc-alg": this['enc-alg'],
            hash: this.hash,
            passwordHash: this.passwordHash,
            signatureScheme : this.signatureScheme,
            isDefault : this.isDefault,
            publicKey : this.publicKey,
            extra: this.extra
        }
        return obj;
    }

    static parseJson( json : string ) : Account {
        return Account.parseJsonObj(JSON.parse(json));
    }

    /**
     * Deserializes JSON object.
     * 
     * Object should be real object, not stringified.
     * 
     * @param obj JSON object
     */
    static parseJsonObj( obj : any ) : Account {
        let account = new Account()
        account.address = obj.address
        account.label = obj.label
        account.lock = obj.lock
        account.isDefault = obj.isDefault
        account.passwordHash = obj.passwordHash
        account.publicKey = obj.publicKey
        account.signatureScheme = obj.SignatureScheme

        account.encryptedKey = PrivateKey.deserializeJson({
            algorithm: obj.algorithm,
            parameters: obj.parameters,
            key: obj.key
        });
        // account.contract = obj.contract
        account.extra = obj.extra
        return account;
    }

}

