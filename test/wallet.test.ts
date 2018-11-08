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

import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto';
import { Address } from '../src/crypto/address';
import { Identity } from '../src/identity';
import * as scrypt from '../src/scrypt';
import * as utils from '../src/utils';
import { Wallet } from '../src/wallet';

// tslint:disable:no-console
describe('test wallet', () => {
    // tslint:disable-next-line:one-variable-per-declaration
    let wallet: Wallet,
        walletDataStr: string;
    beforeAll(() => {
        console.log(Wallet);
        const privateKey = PrivateKey.random();
        wallet = Wallet.create('mickey');
        walletDataStr = wallet.toJson();
    });

    it('test create wallet with name and password', () => {
        expect(walletDataStr).toBeDefined();
    });

    it('test add identity', () => {
        const privateKey = PrivateKey.random();

        const identity = Identity.create(privateKey, '123456', 'mickey');
        wallet.addIdentity(identity);
        expect(wallet.identities.length).toEqual(1);
    });

    it('test add account', () => {
        const privateKey = PrivateKey.random();
        const ac = Account.create(privateKey, '123456', 'mickey');
        wallet.addAccount(ac);
        const privateKey2 = PrivateKey.random();

        const identity = Identity.create(privateKey2, '123456', 'mickey');
        wallet.addIdentity(identity);
        expect(wallet.accounts.length).toEqual(1);
    });

    it('test parse json', () => {
        // tslint:disable-next-line:max-line-length
        const jsonStr = '{"name":"MyWallet","version":"1.1","scrypt":{"p":8,"n":16384,"r":8,"dkLen":64},"accounts":[{"address":"AUr5QUfeBADq6BMY6Tp5yuMsUNGpsD7nLZ","enc-alg":"aes-256-gcm","key":"VWLK6ToY2oLNIP+wCQJqDmvTeTO0zgnJeinOR11F9ZK3JcV4LJ5HOpTAUju5sZ4A","algorithm":"ECDSA","salt":"dg2t+nlEDEvhP52epby/gw==","parameters":{"curve":"P-256"},"label":"","publicKey":"03f631f975560afc7bf47902064838826ec67794ddcdbcc6f0a9c7b91fc8502583","signatureScheme":"SHA256withECDSA","isDefault":true,"lock":false}]}';
        const wallet = Wallet.parseJson(jsonStr);
        expect(wallet.accounts.length).toEqual(1);
        expect(wallet.identities).toBeUndefined();
    });
});
