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
import * as secureRandom from 'secure-random';
import { Address, PrivateKey } from '../src/crypto';
import { utils } from '../src/index';
import * as scrypt from '../src/scrypt';
import { ab2hexstring, hexstr2str, isBase64, str2hexstr } from '../src/utils';

describe('test scrypt', () => {
    test('test_encryptCtr', () => {
        // const privateKey = PrivateKey.random();
        const privateKey = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07');
        const publicKey = privateKey.getPublicKey().serializeHex();
        const address = Address.fromPubKey(privateKey.getPublicKey());
        // tslint:disable-next-line:no-console
        console.log('add: ' + address.toBase58());

        const encrypt = scrypt.encryptWithCtr(privateKey.key, publicKey, '123456');
        // tslint:disable-next-line:no-console
        console.log('encrypt: ' + encrypt);
        expect(encrypt).toBeDefined();
        const decrypt = scrypt.decryptWithCtr(encrypt, '123456', address);
        expect(decrypt).toEqual(privateKey.key);
    });

    test('test_enc_mnemonic', () => {
        const salt = ab2hexstring(secureRandom(16));
        const mnemonic = 'doll remember harbor resource desert curious fatigue nature arrest fix nation rhythm';
        const mnemonicHex = utils.str2hexstr(mnemonic);
        // generate privateKey
        const password = '123456';
        const privateKey = PrivateKey.generateFromMnemonic(mnemonic);
        const pub = privateKey.getPublicKey();
        const address = Address.fromPubKey(pub);
        const encMne = scrypt.encryptWithGcm(
            mnemonicHex, address, salt, password);
        const decMneHex = scrypt.decryptWithGcm(encMne, address, salt, '123456');
        // tslint:disable:no-console
        console.log('privateKey: ' + privateKey.key);
        console.log('encMne: ' + encMne);

        const decMne = utils.hexstr2str(decMneHex);
        console.log('decMne: ' + decMne);
        expect(decMne).toEqual(mnemonic);

        // tslint:disable-next-line:no-console
        console.log('encMen: ' + encMne);
    });

    test('test_encWithEcb', () => {
        const pri = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07');
        const pub = pri.getPublicKey();

        const enc = scrypt.encryptWithEcb(pri.key, pub.serializeHex(), '123456');

        const dec = scrypt.decryptWithEcb(enc, '123456');
        expect(dec).toEqual(pri.key);
        const decPri = new PrivateKey(dec);
        const decPub = decPri.getPublicKey();
        scrypt.checkEcbDecrypted(enc, dec, decPub.serializeHex());

    });

    test('test_gcm', () => {
        const salt = ab2hexstring(secureRandom(16));
        const pri = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07');
        const pub = pri.getPublicKey();
        const address = Address.fromPubKey(pub);

        const enc = scrypt.encryptWithGcm(pri.key, address, salt, '123456');
        console.log('enc: ' + JSON.stringify(enc));

        const dec = scrypt.decryptWithGcm(enc, address, salt,  '123456');
        console.log('dec: ' + dec);
        expect(dec).toEqual(pri.key);

    });

    test('test_isBase64', () => {
        const salt = 'q0uJFA3mLo0g0VMH9r1fFA==';
        expect(isBase64(salt)).toBeTruthy();
        const str = '123';
        expect(isBase64(str)).toBeFalsy();
    });

    test('test_scrypt', () => {
        const pri = new PrivateKey('5v1oz5r2JoR9YP5BHeFEVKJM6Z2epPZbT5bu7gttbn48a1Z1XqpVaxaMiFSnwQ0A');
        // const key = 'dRiHlKa16kKGuWEYWhXUxvHcPlLiJcorAN3ocZ9fQ8p832p4OdIIiy+kR6eImjYd'
        const salt = Buffer.from('8HBtr187Xxp+4NszE3HemQ==', 'base64').toString('hex');
        const address = new Address('ASyPjn3xyGPMhHZqszd1aziAmU7b4859Nz');
        const decrypted = pri.decrypt('Nz8?DR_]aC,,z}Pj', address, salt, {
            cost: 16384, // 除以2时间减半
            blockSize: 8,
            parallel: 8,
            size: 64});
        console.log('decrypted: ' + decrypted.serializeWIF());
        const params = {

        };

        // const key = 'dRiHlKa16kKGuWEYWhXUxvHcPlLiJcorAN3ocZ9fQ8p832p4OdIIiy+kR6eImjYd'
        // const decrypt = scrypt.decryptWithGcm(key, address, salt, '11111111');
        // console.log('decrypt: ' + decrypt);
    });

    test('utf8', () => {
        const str1 = '你好';
        const hexstr1 = str2hexstr(str1);
        console.log(hexstr1);
        console.log(hexstr2str(hexstr1));

        function stringToHex(str: string) {
            const buf = Buffer.from(str, 'utf8');
            return buf.toString('hex');
        }

        function hexToString(str: string) {
            const buf = Buffer.from(str, 'hex');
            return buf.toString('utf8');
        }

        // const hex2 = stringToHex(str1);
        // console.log(hex2);
        // console.log(hexToString(hex2));
    });
});
