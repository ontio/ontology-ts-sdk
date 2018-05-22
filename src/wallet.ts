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

import * as CryptoJS from 'crypto-js';
import { Account } from './account';
import { DEFAULT_SCRYPT } from './consts';
import { PrivateKey } from './crypto';
import { Identity } from './identity';

export class Wallet {

    static createIdentityWallet(password: string, name?: string) {
        const wallet = new Wallet();
        if (!name) {
            name = 'Default name';
        }
        wallet.create(name);
        const identity = new Identity();
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, name);

        wallet.defaultOntid = identity.ontid;
        wallet.addIdentity(identity);
        return wallet;
    }

    static parseJson(json: string): Wallet {
        return Wallet.parseJsonObj(JSON.parse(json));
    }

    /**
     * Deserializes JSON object.
     *
     * Object should be real object, not stringified.
     *
     * @param obj JSON object
     */
    static parseJsonObj(obj: any): Wallet {
        const wallet = new Wallet();
        wallet.name = obj.name;
        wallet.defaultOntid = obj.defaultOntid;
        wallet.defaultAccountAddress = obj.defaultAccountAddress;
        wallet.createTime = obj.createTime;
        wallet.version = obj.version;
        wallet.scrypt = obj.scrypt;
        wallet.identities = (obj.identities as any[]).map((i) => Identity.parseJsonObj(i));
        wallet.accounts = (obj.accounts as any[]).map((a) => Account.parseJsonObj(a));
        wallet.extra = obj.extra;
        return wallet;
    }

    static fromWalletFile(obj: any): Wallet {
        const wallet = Wallet.parseJsonObj(obj);
        return wallet;
    }

    name: string;
    defaultOntid: string = '';
    defaultAccountAddress: string = '';
    createTime: string;
    version: string;
    scrypt: {
        n: number;
        r: number;
        p: number;
    };
    identities: Identity[] = [];
    accounts: Account[] = [];
    extra: null;

    // create a empty wallet
    create(name: string): Wallet {
        this.name = name;

        // createtime
        this.createTime = (new Date()).toISOString();
        this.version = '1.0';
        this.scrypt = {
            n: DEFAULT_SCRYPT.cost,
            r: DEFAULT_SCRYPT.blockSize,
            p: DEFAULT_SCRYPT.parallel
        };

        return this;
    }

    addAccount(account: Account): void {
        for (const ac of this.accounts) {
            if (ac.encryptedKey.key === account.encryptedKey.key) {
                return;
            }
        }
        this.accounts.push(account);
    }

    addIdentity(identity: Identity): void {
        for (const item of this.identities) {
            if (item.ontid === identity.ontid) {
                return;
            }
        }
        this.identities.push(identity);
    }

    setDefaultAccount(address: string): void {
        this.defaultAccountAddress = address;
    }

    setDefaultIdentity(ontid: string): void {
        this.defaultOntid = ontid;
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
            name: this.name,
            defaultOntid: this.defaultOntid,
            defaultAccountAddress: this.defaultAccountAddress,
            createTime: this.createTime,
            version: this.version,
            scrypt: this.scrypt,
            identities: this.identities.map((i) => i.toJsonObj()),
            accounts: this.accounts.map((a) => a.toJsonObj()),
            extra: null
        };

        return obj;
    }

    signatureData(): string {
        return '';
    }

    /*
    *generate a wallet file that is compatible with cli wallet.
    */
    toWalletFile(): any {
        const obj = this.toJsonObj();
        return obj;
    }
}
