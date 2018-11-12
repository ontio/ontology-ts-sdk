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
import * as CryptoJS from 'crypto-js';
import * as secureRandom from 'secure-random';
import { Account } from '../src/account';
import { Address, CurveLabel, KeyParameters, KeyType , PrivateKey } from '../src/crypto';
import { ERROR_CODE } from '../src/error';
import { utils } from '../src/index';
import * as scrypt from '../src/scrypt';
import { ab2hexstring, isBase64, str2hexstr } from '../src/utils';
import { PublicKey } from './../src/crypto/PublicKey';

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
        const pri = new PrivateKey('6717c0df45159d5b5ef383521e5d8ed8857a02cdbbfdefeeeb624f9418b0895e');
        // const key = 'dRiHlKa16kKGuWEYWhXUxvHcPlLiJcorAN3ocZ9fQ8p832p4OdIIiy+kR6eImjYd'
        const salt = Buffer.from('sJwpxe1zDsBt9hI2iA2zKQ==', 'base64').toString('hex');
        const address = new Address('AakBoSAJapitE4sMPmW7bs8tfT4YqPeZEU');
        const encrypt = pri.encrypt('11111111', address, salt);
        console.log('encrypt: ' + encrypt);
        const params = {
            
        }

        // const key = 'dRiHlKa16kKGuWEYWhXUxvHcPlLiJcorAN3ocZ9fQ8p832p4OdIIiy+kR6eImjYd'
        // const decrypt = scrypt.decryptWithGcm(key, address, salt, '11111111');
        // console.log('decrypt: ' + decrypt);
    });
});
