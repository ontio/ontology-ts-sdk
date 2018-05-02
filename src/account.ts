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

export class Contract {
    script : string
    parameters : Array<string>
    deployed : boolean
}

export class Account {
    address: string;
    label: string;
    lock: boolean;
    encryptedKey: PrivateKey;
    // contract: Contract
    extra: null;

    constructor() {
    }

    create( privateKey: PrivateKey, password: string, label: string ): Account {
        
        // let contract = {
        //     script : '',
        //     parameters : [],
        //     deployed : false
        // }

        this.address = "";
        this.label = label;
        this.lock = false;

        this.encryptedKey = privateKey.encrypt(password); 
        
        const publicKey = privateKey.getPublicKey();
        
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

        account.encryptedKey = encryptedPrivateKey;

        // let publicKeyEncoded = ab2hexstring(core.getPublicKey(privateKey, true));
        // contract.script = core.createSignatureScript(publicKeyEncoded);
        // account.contract = contract

        const publicKey = privateKey.getPublicKey();

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
            // contract: this.contract,
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

