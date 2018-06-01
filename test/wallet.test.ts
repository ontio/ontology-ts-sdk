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
import * as core from '../src/core';
import { PrivateKey } from '../src/crypto';
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
        expect(wallet.accounts.length).toEqual(1);
    });

});
