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
// tslint:disable-next-line:no-var-requires
const HDKey = require('@ont-community/hdkey-secp256r1');

// tslint:disable:quotemark
describe('hd key tests', () => {
    test('simple test', () => {
        const seed = '000102030405060708090a0b0c0d0e0f';

        const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        const pubStr = hdkey.derive("m/0/0/176").publicKey.toString('hex');

        const hdkey2 = HDKey.fromExtendedKey(hdkey.publicExtendedKey);
        const pubStr2 = hdkey2.derive("m/0/0/176").publicKey.toString('hex');

        expect(pubStr2).toBe(pubStr);
    });
});
