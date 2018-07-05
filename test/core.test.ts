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
import { Claim, Metadata } from '../src/claim';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey } from '../src/crypto';
import * as utils from '../src/utils';
import { Signature } from './../src/crypto/Signature';
import { SignatureScheme } from './../src/crypto/SignatureScheme';
import { randomBytes, sha256, StringReader } from './../src/utils';
// tslint:disable : no-console
describe('test core', () => {

    let privateKey: PrivateKey;
    let wifKey: string;

    beforeAll(() => {
        privateKey = PrivateKey.random();
    });

    test('test getWIFFromPrivateKey', () => {
        const pri = new PrivateKey('e467a2a9c9f56b012c71cf2270df42843a9d7ff181934068b4a62bcdd570e8be');
        wifKey = pri.serializeWIF();
        // expect(wifKey).toBeDefined();
        expect(wifKey).toEqual('L4shZ7B4NFQw2eqKncuUViJdFRq6uk1QUb6HjiuedxN4Q2CaRQKW');
    });

    test('test getPrivateKeyFromWIF', () => {
        const wif = 'L4shZ7B4NFQw2eqKncuUViJdFRq6uk1QUb6HjiuedxN4Q2CaRQKW';
        const key = PrivateKey.deserializeWIF(wif);
        expect(key.key).toEqual('e467a2a9c9f56b012c71cf2270df42843a9d7ff181934068b4a62bcdd570e8be');
    });

    test('get public key', () => {
        const pk = privateKey.getPublicKey().serializeHex();
        console.log('get pk: ' + pk);
        expect(pk).toBeDefined();
    });

    test('encrypt private key', () => {
        // tslint:disable-next-line:no-shadowed-variable
        const privateKey = new PrivateKey('b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9');
        const address = Address.fromPubKey(privateKey.getPublicKey());
        const encrypt = privateKey.encrypt('123456', address, randomBytes(16));
        console.log('encrypt: ' + encrypt.key);
    });

    test('sign and verify', () => {
        // tslint:disable-next-line:no-shadowed-variable
        const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
        const data = 'helloworld';
        const msg = utils.str2hexstr('helloworld');
        console.log('msg: ' + msg);
        const signed = privateKey.sign(msg);
        console.log('signed: ' + signed.serializeHex());
        console.log('base64: ' + new Buffer(signed.serializeHex(), 'hex').toString('base64'));
        const pk = privateKey.getPublicKey();
        console.log('pub: ' + pk.serializeHex());
        const verifyResult = pk.verify(msg, signed);
        console.log('verifyResult: ' + verifyResult);
        expect(verifyResult).toBeTruthy();
    });
});
