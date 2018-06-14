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
import { Address, JsonKey, PrivateKey } from './crypto';
import { ScryptParams } from './scrypt';
import { ab2hexstring, generateRandomArray, randomBytes } from './utils';

export class ControlData {
    static fromJson(json: any): ControlData {
        return new ControlData(json.id, PrivateKey.deserializeJson(json as JsonKey));
    }

    id: string;
    encryptedKey: PrivateKey;
    address: Address;
    salt: string;

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
            ...this.encryptedKey.serializeJson(),
            address: this.address.toBase58(),
            salt: this.salt,
            ['enc-alg']: 'aes-256-gcm'
        };
    }
}

export class Identity {
    static importIdentity(
        label: string,
        encryptedPrivateKey: PrivateKey,
        password: string,
        address: Address,
        saltBase64: string,
        params?: ScryptParams
    ): Identity {
        // create identity
        const identity = new Identity();
        const salt = Buffer.from(saltBase64, 'base64').toString('hex');
        const privateKey = encryptedPrivateKey.decrypt(password, address, salt, params);
        if (!label) {
            label = ab2hexstring (generateRandomArray(4));
        }

        // generate ontid from p
        const publicKey = privateKey.getPublicKey();
        identity.ontid = Address.generateOntid(publicKey);
        identity.label = label;
        identity.lock = false;

        // control
        const control = new ControlData();

        // start from 1
        control.id = '1';
        control.encryptedKey = encryptedPrivateKey;
        control.salt = salt;
        control.address = Address.fromOntid(identity.ontid);

        identity.controls.push(control);

        return identity;
    }

    /**
     * Creates Identity object encrypting specified private key.
     *
     * The identity is not registered on the blockchain. Caller needs to register it.
     *
     * @param privateKey Private key associated with the identity
     * @param keyphrase Password use to encrypt the private key
     * @param label Custom label
     * @param params Optional scrypt params
     */
    static create(privateKey: PrivateKey, keyphrase: string, label: string, params?: ScryptParams) {
        const identity = new Identity();
        identity.ontid = '';
        identity.label = label;
        identity.lock = false;

        // ontid
        const publicKey = privateKey.getPublicKey();
        identity.ontid = Address.generateOntid(publicKey);
        const address = Address.fromOntid(identity.ontid);
        const salt = randomBytes(16);
        const encryptedPrivateKey = privateKey.encrypt(keyphrase, address, salt, params);
        // start from 1
        const control = new ControlData('1', encryptedPrivateKey);
        control.salt = Buffer.from(salt, 'hex').toString('base64');
        control.address = address;
        identity.controls.push(control);

        return identity;
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
        const id = new Identity();
        id.ontid = obj.ontid;
        id.label = obj.label;
        id.lock = obj.lock;
        id.controls = (obj.controls as any[]).map((c) => ControlData.fromJson(c));
        id.extra = obj.extra;
        return id;
    }

    ontid: string;
    label: string;
    lock: boolean;
    controls: ControlData[] = [];
    extra: null;

    addControl(control: ControlData) {
        for (const c of this.controls) {
            if (c.encryptedKey.key === control.encryptedKey.key) {
                return;
            }
        }
        control.id = (this.controls.length + 1).toString();
        this.controls.push(control);
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
        const obj = {
            ontid: this.ontid,
            label: this.label,
            lock: this.lock,
            controls: this.controls.map((c) => c.toJson()),
            extra: this.extra
        };
        return obj;
    }
}
