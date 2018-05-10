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

import { PrivateKey, KeyType, KeyParameters, CurveLabel, SignatureScheme, PublicKey, Signature } from '../src/crypto';
import { str2ab, ab2hexstring, str2hexstr, ab2str } from '../src/utils';
import { sm2 } from 'sm.js';

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

        const pk = '24cb29b451a688e73bb34841a6667a6c814ea4746139cc92abd5e0';
        const privateKey = new PrivateKey(pk, KeyType.SM2, new KeyParameters(CurveLabel.SM2P256V1));
        
        const signature = privateKey.sign(encoded, SignatureScheme.SM2withSM3);
        console.log('signature', signature);
        
        const publicKey = privateKey.getPublicKey();
        
        const result = publicKey.verify(encoded, signature);
        expect(result).toBeTruthy();
    });

    test('test SM2 verify java SDK generated signature', () => {
        const msg = 'test';
        const encoded = str2hexstr(msg);

        const signature = new Signature(
            SignatureScheme.SM2withSM3,
            '3132333435363738313233343536373800739a23d629d9e6c5a17aa03323dfce98b68753ab4715d0d80ef27a6f9d80a6dc80eb7b959d3afc64f41d92edd0df37bfaefcc8e52b9aeb0b2037159f8c1ab9bd'
        );
        
        const publicKey = new PublicKey(
            '03b8116ad47c29c22ba35d36f7352b667b7f5075c36523998e7e1ff2364e1de186',
            KeyType.SM2,
            new KeyParameters(CurveLabel.SM2P256V1)
        )
        
        const result = publicKey.verify(encoded, signature);
        expect(result).toBeTruthy();
    });
});
