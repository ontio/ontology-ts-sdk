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

// tslint:disable:no-console
import { Ecies } from '../src/crypto';

describe('test ECIES', () => {

    // const case = {
    const seed =  Buffer.from('0102', 'hex');
    const bitlen = 512;

    // tslint:disable:variable-name
    const supposed_output = [
        '27704664b7e8ba3c36199f581fa3023f49fd90af918444e2d9477e82565f868a',
        '5dbee0a29283512256238cd05870a61c81ccea8a245c8973abc0618df4d3471f'
    ];

    const test_case = [
        '',
        '12345',
        'hello world',
        'qwertyuiopasdfghjklzxcvbnm1234567890',
        '一去二三里'
    ];

    const curvename = 'secp256k1';
    const ins = new Ecies(curvename, new Buffer(''));

    beforeAll(() => {
        // console.log( crypto.getCurves() );
    });

    // tslint:disable-next-line:no-empty
    test('test kdf', () => {

        const key = ins.kdf2(seed, bitlen, ins.DigestSize, ins.hash);

        console.log('************************************');
        console.log('key: ', key[0].toString('hex'));
        console.log('key: ', key[1].toString('hex'));

        expect(
            key[0].toString('hex')
            === supposed_output[0]
            ).toBeTruthy();
        expect(
            key[1].toString('hex')
            === supposed_output[1]
            ).toBeTruthy();

    });

    // tslint:disable-next-line:no-empty
    test('test enc & dec', () => {
        let i = 0;
        for (const msg of test_case) {
            const keyB = ins.generateKeyPair();
            const keyA = ins.generateKeyPair();
            const iv = '';

            ins.setKeyPair(keyA.priv);
            const cipher = ins.enc(keyB.pub, msg, iv);

            ins.setKeyPair(keyB.priv);
            const plain = ins.dec(cipher.msgCipher, cipher.out,  cipher.iv);

            console.log(`************** ${i++} *******************`);
            console.log('msg: ', msg);
            console.log('cipher: ', cipher);
            console.log('plain: ', plain);

            expect(plain  === msg).toBeTruthy();
        }

    });
});
