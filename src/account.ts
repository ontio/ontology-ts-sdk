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
import * as bip39 from 'bip39';
import { ONT_BIP44_PATH } from './consts';
import { Address, PrivateKey } from './crypto';
import { deserializeFromJson } from './crypto/PrivateKeyFactory';
import { ERROR_CODE } from './error';
import { ScryptParams } from './scrypt';
import { Transaction } from './transaction/transaction';
import { signTransaction } from './transaction/transactionBuilder';
import { ab2hexstring, generateRandomArray, randomBytes } from './utils';

// tslint:disable-next-line:no-var-requires
const HDKey = require('@ont-community/hdkey-secp256r1');

export class Account {
    /**
     * Import account
     * @param label Account's label
     * @param encryptedPrivateKey Encrypted private key
     * @param password User's password to decrypt private key
     * @param address Account's address
     * @param saltBase64 Salt to decrypt
     * @param params Params used to decrypt
     */
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
     * Import account with mnemonic
     * @param label Account's label
     * @param mnemonic User's mnemonic
     * @param password user's password to encrypt the private key
     * @param params Params used to encrypt the private key.
     */
    static importWithMnemonic(
        label: string,
        mnemonic: string,
        password: string,
        params?: ScryptParams
    ): Account {
        mnemonic = mnemonic.trim();
        if (!bip39.validateMnemonic(mnemonic)) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        const seed = bip39.mnemonicToSeedHex(mnemonic);
        const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        const pri = hdkey.derive(ONT_BIP44_PATH);
        const key = Buffer.from(pri.privateKey).toString('hex');
        const privateKey = new PrivateKey(key);
        const account = Account.create(privateKey, password, label, params);
        return account;
    }

    /**
     * Creates Account object encrypting specified private key.
     *
     * The account does not need to be registered on blockchain.
     *
     * @param privateKey Private key associated with the account
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
        account.hash = obj.hash;
        account.salt = obj.salt;
        account.encryptedKey = deserializeFromJson({
            algorithm: obj.algorithm,
            parameters: obj.parameters,
            key: obj.key,
            external: obj.external
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
    hash: string = 'sha256';
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
            ...this.encryptedKey.serializeJson(),
            'enc-alg': this['enc-alg'],
            'hash': this.hash,
            'salt': this.salt,
            'isDefault': this.isDefault,
            'publicKey': this.publicKey,
            'signatureScheme': this.encryptedKey.algorithm.defaultSchema.label
        };
        return obj;
    }

    exportPrivateKey(password: string, params?: ScryptParams) {
        return this.encryptedKey.decrypt(password, this.address, this.salt, params);
    }

    signTransaction(password: string, tx: Transaction, params?: ScryptParams) {
        const pri = this.exportPrivateKey(password, params);
        signTransaction(tx, pri, pri.algorithm.defaultSchema);
        return tx;
    }
}
