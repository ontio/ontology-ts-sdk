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
import { Address, PrivateKey } from './crypto';
import { ScryptParams } from './scrypt';
import { ab2hexstring, generateRandomArray, randomBytes } from './utils';

export class Account {
    static importAccount(
        label: string ,
        encryptedPrivateKey: PrivateKey,
        password: string,
        address: Address,
        saltBase64: string,
        params?: ScryptParams
    ): Account {
        const account = new Account();
        const salt = Buffer.from(saltBase64, 'base64').toString('hex');
        const privateKey = encryptedPrivateKey.decrypt(password, address, salt, params);

        if (!label) {
            label = ab2hexstring(generateRandomArray(4));
        }
        account.label = label;
        account.lock = false;
        account.isDefault = false;
        account.salt = saltBase64;

        account.encryptedKey = encryptedPrivateKey;

        const publicKey = privateKey.getPublicKey();
        account.publicKey = publicKey.key;

        account.address = Address.fromPubKey(publicKey);

        return account;
    }

    /**
     * Creates Account object encrypting specified private key.
     *
     * The account does not need to be registered on blockchain.
     *
     * @param privateKey Private key associated with the identity
     * @param password Password use to encrypt the private key
     * @param label Custom label
     * @param params Optional scrypt params
     */
    static create(
        privateKey: PrivateKey,
        password: string,
        label?: string,
        params?: ScryptParams
    ): Account {
        const account = new Account();
        if (!label) {
            label = ab2hexstring(generateRandomArray(4));
        }
        account.label = label;
        account.lock = false;
        account.isDefault = false;

        const salt = randomBytes(16);
        const publicKey = privateKey.getPublicKey();
        const address = Address.fromPubKey(publicKey);
        account.publicKey = publicKey.serializeHex();
        account.address = address;
        account.encryptedKey = privateKey.encrypt(password, address, salt, params);
        account.salt = Buffer.from(salt, 'hex').toString('base64');
        return account;
    }

    static parseJson(json: string): Account {
        return Account.parseJsonObj(JSON.parse(json));
    }

    /**
     * Deserializes JSON object.
     *
     * Object should be real object, not stringified.
     *
     * @param obj JSON object
     */
    static parseJsonObj(obj: any): Account {
        const account = new Account();
        account.address = new Address(obj.address);
        account.label = obj.label;
        account.lock = obj.lock;
        account.isDefault = obj.isDefault;
        account.publicKey = obj.publicKey;
        account.salt = obj.salt;
        account.encryptedKey = PrivateKey.deserializeJson({
            algorithm: obj.algorithm,
            parameters: obj.parameters,
            key: obj.key
        });
        // account.contract = obj.contract
        account.extra = obj.extra;
        return account;
    }

    address: Address;
    label: string;
    lock: boolean;
    encryptedKey: PrivateKey;
    extra: null;

    // to compatible with cli wallet
    'enc-alg': string = 'aes-256-gcm';
    salt: string;

    publicKey: string;
    isDefault: boolean;

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
            'address': this.address.toBase58(),
            'label': this.label,
            'lock': this.lock,
            'algorithm': this.encryptedKey.algorithm.label,
            'parameters': this.encryptedKey.parameters.serializeJson(),
            'key': this.encryptedKey.key,
            'enc-alg': this['enc-alg'],
            'salt': this.salt,
            'isDefault': this.isDefault,
            'publicKey': this.publicKey,
            'signatureScheme': this.encryptedKey.algorithm.defaultSchema.label
        };
        return obj;
    }
}
