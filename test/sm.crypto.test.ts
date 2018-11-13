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

import { sm2 } from 'sm.js';
import { CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey, Signature, SignatureScheme } from '../src/crypto';
import { ab2hexstring, ab2str, str2ab, str2hexstr } from '../src/utils';
import { Address } from '../src/crypto/address';

describe('SM2 and SM3 cryptographics functions tests', () => {
    test('test SM3 hash', () => {
        const key: PrivateKey = PrivateKey.random(KeyType.SM2);

        const msg = 'test';
        const encoded = str2hexstr(msg);

        const hash = key.computeHash(encoded, SignatureScheme.SM2withSM3);

        expect(hash).toEqual('55e12e91650d2fec56ec74e1d3e4ddbfce2ef3a65890c2a19ecf88a307e76a23');
    });

    test('test SM2 sign and verify', () => {
        const msg = 'test';
        const encoded = str2hexstr(msg);

        const pk = 'ab80a7ad086249c01e65c4d9bb6ce18de259dcfc218cd49f2455c539e9112ca3';
        const privateKey = new PrivateKey(pk, KeyType.SM2, new KeyParameters(CurveLabel.SM2P256V1));

        const signature = privateKey.sign(encoded, SignatureScheme.SM2withSM3);
        // tslint:disable-next-line:no-console
        console.log('signature', signature.value);

        const publicKey = privateKey.getPublicKey();

        const result = publicKey.verify(encoded, signature);
        expect(result).toBeTruthy();
    });

    test('test SM2 verify java SDK generated signature', () => {
        const msg = 'test';
        const encoded = str2hexstr(msg);

        const signature = new Signature(
            SignatureScheme.SM2withSM3,
            // tslint:disable-next-line:max-line-length
            '3132333435363738313233343536373800bc1d431f932afb7b809627f051c1b5c10ee22e470aea4623c3281231dd513779ca1171f4f3bbf414f089e8c963f715b3376007008206a2b9ebb252dd6883dbce'
        );

        const publicKey = new PublicKey(
            '031220580679fda524f575ac48b39b9f74cb0a97993df4fac5798b04c702d07a39',
            KeyType.SM2,
            new KeyParameters(CurveLabel.SM2P256V1)
        );

        const result = publicKey.verify(encoded, signature);
        expect(result).toBeTruthy();
    });

    test('verifySSS', () => {
        const signature = Signature.deserializeHex('01cf157a48216bfcd455a97a39c0ad65bd1b27d1da07965b19848146045c9f2e5a12f905a5ee0923412d589e615a5d6954c58cade367dce67fcf13eaa82c12e87a')
        const msg = str2hexstr('sss');
        const pk = new PublicKey('035384561673e76c7e3003e705e4aa7aee67714c8b68d62dd1fb3221f48c5d3da0');
        const result = pk.verify(msg, signature);
        console.log(result);
    });
});
