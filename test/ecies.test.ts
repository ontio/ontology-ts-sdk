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

// tslint:disable:variable-name
// tslint:disable:no-empty
import { Ecies } from '../src/crypto';

describe('test ECIES', () => {
    const test_case = [
        '',
        '12345',
        'hello world',
        'qwertyuiopasdfghjklzxcvbnm1234567890',
        '一去二三里',
        'Attack!'
    ];

    const python_sdk_case = {
        priv:
            '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3',
        pub:
            '021401156f187ec23ce631a489c3fa17f292171009c6c3162ef642406d3d09c74d',
        cipher: {
            iv: '577b04f22c6edcc67c0a864a8d9ba4ee',
            out:
                '0468d87653b57c6e39a66442d7b64fbae5d3fd49ce81858b8107cf' +
                'ddf0152a7e9c4a04fe6207891b64af9036674a7723f22c002a7b12443bcc12f8b2b6ad1bafc4',
            msgCipher: 'fed0f33ba2d90062d6dc9310ad65d4ac'
        },
        msg: 'Attack!'
    };

    const curvename = 'p256';

    beforeAll(() => {});

    test('test kdf()', () => {
        const supposed_output = [
            // java sdk & python sdk
            '27704664b7e8ba3c36199f581fa3023f49fd90af918444e2d9477e82565f868a',
            '5dbee0a29283512256238cd05870a61c81ccea8a245c8973abc0618df4d3471f'
        ];
        const seed = Buffer.from('0102', 'hex');
        const bitlen = 512;
        const ins = new Ecies(curvename);
        const key = ins.kdf2(seed, bitlen, ins.digestSize, ins.hashAlg);

        expect(key[0].toString('hex') === supposed_output[0]).toBeTruthy();
        expect(key[1].toString('hex') === supposed_output[1]).toBeTruthy();
    });

    test('test enc() then dec()', () => {
        for (const msg of test_case) {
            const insA = new Ecies(curvename);
            const insB = new Ecies(curvename);
            insA.generateKeyPair();
            insB.generateKeyPair();

            const keyB = insB.getKeyPair();

            // tslint:disable:no-console
            // console.log(keyB.pub);

            const cipher = insA.enc(keyB.pub, Buffer.from(msg, 'utf8'), 32);

            const plainBuffer = insB.dec(
                cipher.msgCipher,
                cipher.out,
                cipher.iv,
                32
            );

            const plain = plainBuffer.toString('utf8');

            expect(plain === msg).toBeTruthy();
        }
    });

    test('test decrypt cipher from python sdk', () => {
        const insA = new Ecies(curvename);
        const insB = new Ecies(curvename);
        insA.generateKeyPair();

        insB.setKeyPair(python_sdk_case.priv);

        expect(insB.getKeyPair().pub === python_sdk_case.pub).toBeTruthy();

        const plainBuffer = insB.dec(
            python_sdk_case.cipher.msgCipher,
            python_sdk_case.cipher.out,
            python_sdk_case.cipher.iv,
            32
        );

        const plain = plainBuffer.toString('utf8');

        expect(plain === python_sdk_case.msg).toBeTruthy();
    });
});
