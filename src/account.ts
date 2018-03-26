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
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'
import {DEFAULT_ALGORITHM, Algorithm} from './consts'
import {ERROR_CODE} from './error'
import { addressToU160 } from './core';
export class Contract {
    script : string
    parameters : Array<string>
    deployed : boolean
}

export class Account {
    address: string;
    label: string;
    lock: boolean;
    algorithm: string;
    parameters: {};
    key: string;
    // contract: Contract
    extra: null;

    constructor() {
    }

    create( privateKey: string, password: string, label: string, algorithmObj ?: Algorithm ): Account {
        
        // let contract = {
        //     script : '',
        //     parameters : [],
        //     deployed : false
        // }

        this.address = "";
        this.label = label;
        this.lock = false;

        if(algorithmObj) {
            this.algorithm = algorithmObj.algorithm
            this.parameters = algorithmObj.parameters
        } else {
            this.algorithm = DEFAULT_ALGORITHM.algorithm
            this.parameters = DEFAULT_ALGORITHM.parameters
        }
        
        this.key = scrypt.encrypt( privateKey, password );

        let publickeyEncode = core.getPublicKey(privateKey, true).toString('hex');
        
        let programHash = core.getSingleSigUInt160(publickeyEncode);

        this.address = core.u160ToAddress(programHash);

        return this;
    }



    static importAccount(label : string ,encryptedPrivateKey : string, password : string ) : Account {
        let account = new Account()
        let  privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        // let contract = {
        //     script: '',
        //     parameters: [],
        //     deployed: false
        // }

        account.address = "";
        account.label = label;
        account.lock = false;


        account.algorithm = DEFAULT_ALGORITHM.algorithm
        account.parameters = DEFAULT_ALGORITHM.parameters

        account.key = encryptedPrivateKey

        // let publicKeyEncoded = ab2hexstring(core.getPublicKey(privateKey, true));
        // contract.script = core.createSignatureScript(publicKeyEncoded);
        // account.contract = contract


        let publickeyEncode = core.getPublicKey(privateKey, true).toString('hex');

        let programHash = core.getSingleSigUInt160(publickeyEncode);

        let address = core.u160ToAddress(programHash);

        account.address = address
    
        return account
    }

    toJson() : string {
        let obj = {
            address: this.address,
            label: this.label,
            lock: this.lock,
            algorithm: this.algorithm,
            parameters: this.parameters,
            key: this.key,
            // contract: this.contract,
            extra: this.extra
        }
        return JSON.stringify(obj)
    }

    static parseJson( json : string ) : Account {
        let obj = JSON.parse(json)
        let account = new Account()
        account.address = obj.address
        account.label = obj.label
        account.lock = obj.lock
        account.algorithm = obj.algorithm
        account.parameters = obj.parameters
        account.key = obj.key
        // account.contract = obj.contract
        account.extra = obj.extra
        return account;
    }

}

