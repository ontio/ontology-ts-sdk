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
import { Address, PrivateKey } from '../src/crypto';
// tslint:disable-next-line:no-var-requires
const HDKey = require('@ont-community/hdkey-secp256r1');

// tslint:disable:no-console
describe('test bip44', () => {
    test('test_24', () => {
        // tslint:disable-next-line:max-line-length
        const mnemonic = 'hill ready family useful detect bacon visit canoe recall circle topple claw sheriff universe robust lounge cluster duty vast excuse weasel grunt junk actor';

        const seed = bip39.mnemonicToSeedHex(mnemonic);
        console.log('seed:', seed);

        const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        console.log('root:', hdkey.privateExtendedKey);

        // tslint:disable-next-line:quotemark
        const path = "m/44'/1024'/0'/0/0";

        const leaf = hdkey.derive(path);
        console.log('leaf:', leaf.privateExtendedKey);

        const privateKey = new PrivateKey(Buffer.from(leaf.privateKey).toString('hex'));
        console.log('private key:',  privateKey.key);

        console.log('WIF key:', privateKey.serializeWIF());

        const publicKey = privateKey.getPublicKey();
        console.log('public key:', publicKey.key);

        const address = Address.fromPubKey(publicKey);
        console.log('address', address.toBase58());

        expect(address.toBase58()).toBe('AM57cppabEf4JeBXXGAPvRSLmYpqTmQ3sS');
    });
});
