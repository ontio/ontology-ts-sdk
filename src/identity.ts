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
import { PrivateKey, JsonKey, Address } from './crypto';
import { ab2hexstring } from './utils'
import {ERROR_CODE} from './error'
import { buildRestfulParam } from './transaction/transactionBuilder';

export class ControlData {
    id: string;
    encryptedKey: PrivateKey;

    constructor(id?: string, encryptedKey?: PrivateKey) {
        if (id !== undefined) {
            this.id = id;
        }

        if (encryptedKey !== undefined) {
            this.encryptedKey = encryptedKey;
        }
    }

    toJson(): object {
        return {
            id: this.id,
            ...this.encryptedKey.serializeJson()
        }
    }

    static fromJson(json: any): ControlData {
        return new ControlData(json.id, PrivateKey.deserializeJson(json as JsonKey));
    }
}

export class Identity {

    ontid: string;
    label: string;
    lock: boolean;
    controls: Array<ControlData> = [];
    extra: null;

    constructor() {
    }

    create( privateKey: PrivateKey, keyphrase: string, label: string ) {
        
        this.ontid = "";
        this.label = label;
        this.lock = false;

        const encryptedPrivateKey = privateKey.encrypt(keyphrase);

        //start from 1
        const control = new ControlData('1', encryptedPrivateKey);
        this.controls.push( control );

        // ontid
        let publicKey = privateKey.getPublicKey()
        this.ontid = core.generateOntid(publicKey.serializeHex())

        //TODO register ontid
        //调用方处理register和监听结果
        return this
    }
    
    static importIdentity(label : string ,encryptedPrivateKey : PrivateKey, password : string, checksum : string|Address): Identity {
        //create identity
        let identity = new Identity()
        const privateKey = encryptedPrivateKey.decrypt(password, checksum);
        if(!label) {
            label = ab2hexstring (core.generateRandomArray(4))
        }

        //generate ontid from p
        let publicKey = privateKey.getPublicKey()
        identity.ontid = core.generateOntid(publicKey.serializeHex())
        identity.label = label;
        identity.lock = false;

        // control
        let control = new ControlData()

        //start from 1
        control.id = "1";
        control.encryptedKey = encryptedPrivateKey;

        identity.controls.push(control);

        //check ontid on chain
        /* return checkOntid(identity.ontid).then((res:any)=>{
            let result
            if(res == ERROR_CODE.SUCCESS) {
                result = identity
            } else {
                result = null
            } 
            return {
                error : res,
                result : result,
                desc : ''
            }
        }, (error:any) => {
            return {
                error : ERROR_CODE.NETWORK_ERROR,
                result : null,
                desc : error
            }
        }) */

        return identity
    }

    addControl(control : ControlData) {
        for(let c of this.controls) {
            if(c.encryptedKey.key === control.encryptedKey.key) {
                return;
            }
        }
        control.id = (this.controls.length + 1).toString()
        this.controls.push(control)
    }


    toJson(): string {
        return JSON.stringify(this.toJsonObj());
    }

    /**
     * Serializes to JSON object.
     * 
     * Returned object will not be stringified.
     * 
     */
    toJsonObj(): any {
        let obj = {
            ontid: this.ontid,
            label: this.label,
            lock: this.lock,
            controls: this.controls.map(c => c.toJson()),
            extra: this.extra,
        }
        return obj;
    }

    static parseJson(json: string): Identity {
        return Identity.parseJsonObj(JSON.parse(json));
    }

    /**
     * Deserializes JSON object.
     * 
     * Object should be real object, not stringified.
     * 
     * @param obj JSON object
     */
    static parseJsonObj(obj: any): Identity {
        let id = new Identity()
        id.ontid = obj.ontid
        id.label = obj.label
        id.lock = obj.lock
        id.controls = (obj.controls as any[]).map(c => ControlData.fromJson(c))
        id.extra = obj.extra
        return id;
    }

}

