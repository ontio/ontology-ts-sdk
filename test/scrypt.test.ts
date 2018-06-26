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

        const encrypt = scrypt.encrypt(privateKey.key, publicKey, '123456');
        // tslint:disable-next-line:no-console
        console.log('encrypt: ' + encrypt);
        expect(encrypt).toBeDefined();

        const encryptPri = privateKey.encrypt('123456');

        const decryptPri =  encryptPri.decrypt('123456', address);

        expect(decryptPri.key).toEqual(privateKey.key);

        // console.log('encrypt : '+ encrypt)

        // const checksum = address.getB58Checksum();

        // const decrypt = scrypt.decrypt(encrypt, '123456', checksum)
        // expect(decrypt).toEqual(privateKey.key)

        // const key = '6PYReg3c35DGiwKvfTCKSFHEUv9imMoLNXu5RWsYi3Y9C8EQzTDKfWvLzv';
        // const pass = 'passwordtest'
        // const pri = scrypt.decrypt(key, pass)
        // scrypt.checkDecrypted(key, pri, new PrivateKey(pri).getPublicKey().key);
        // console.log(pri)
    });

    test('encrypt_with16384', () => {
        const params = {
            cost: 16384,
            blockSize: 8,
            parallel: 8,
            size: 64
        };

        const enc = new PrivateKey('lZSpCtGa0VtEUPXr27xSKAg+I4hIucDeOIidbN1AyXE=');
        const pri = enc.decrypt('111111', new Address('TA7WWJ4FqyADWDrU7ZLhYX2woFoFvDfw8P'), params);
        expect(pri).toBeDefined();

        const pri2 = PrivateKey.random();
        const enc2 = pri2.encrypt('111111', params);
        const pub = pri2.getPublicKey();
        const address = Address.fromPubKey(pub);
        // tslint:disable:no-console
        console.log('address: ' + address.toBase58());
        // tslint:disable-next-line:no-console
        console.log('enc2: ' + enc2.key);
    });

    test('test_enc_mnemonic', () => {
        // const password = '123456';
        // const account = new Account();
        // // generate mnemnic
        // const mnemonic = bip39.generateMnemonic();
        // const mneHex = utils.str2hexstr(mnemonic.split(' ').join('0'));
        // console.log('mne: ' + mnemonic);
        // // generate seed
        // const seed = bip39.mnemonicToSeedHex(mnemonic);
        // // generate privateKey
        // const pri = seed.substr(0, 64);
        // const privateKey = new PrivateKey(pri);
        // account.create(privateKey, password, '');
        // const encMne = scrypt.encrypt(mneHex, account.publicKey, password);
        // console.log('encMne: ' + encMne);

        // const decMneHex = scrypt.decrypt(encMne, '123456', account.address);
        // const decMne = utils.hexstr2str(decMneHex);
        // const decMneStr = decMne.split('0').join(' ');
        // console.log('decMne: ' + decMne );
        // expect(decMneStr).toEqual(mnemonic);

        // console.log(bip39.entropyToMnemonic('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07'))
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

    test('test_ecb', () => {
        const enc = '6PYNHtaZ5aNhq8JXhnhMg9qtyfdauGLqftxDz1o6RiSTPWYhHTAFkiVXKR';
        const dec = scrypt.decryptWithEcb(enc, '123456');
        const decPri = new PrivateKey(dec);
        const decPub = decPri.getPublicKey();
        scrypt.checkEcbDecrypted(enc, dec, decPub.serializeHex());
    });

    test('test_gcm', () => {
        // const salt = ab2hexstring(secureRandom(16));
        // const pri = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07');
        // const pub = pri.getPublicKey();
        // const address = Address.fromPubKey(pub);

        // const enc = scrypt.encryptWithGcm(pri.key, address, salt, '123456');
        // console.log('enc: ' + JSON.stringify(enc));

        // const dec = scrypt.decryptWithGcm(enc, address, salt,  '123456');
        // console.log('dec: ' + dec);
        // expect(dec).toEqual(pri.key);
        const params = {
            cost: 16384,
            blockSize: 8,
            parallel: 8,
            size: 64
        };
        const saltBase64 = 'q0uJFA3mLo0g0VMH9r1fFA==';
        const salt = Buffer.from(saltBase64, 'base64').toString('base64');

        console.log('salt: ' + salt);
        // const address = new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP');
        // const key = 'S5Y5DnUF4YB+pMBswO/NEQcguBwoBXjL/N9179rvahvYSfYD7EgNYjmro0vI3L6y';
        // const dec = scrypt.decryptWithGcm(key, address, salt, '123456', params);
        // console.log('hex ' + salt);
        // console.log('dec ' + dec);

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

        // const key = 'dRiHlKa16kKGuWEYWhXUxvHcPlLiJcorAN3ocZ9fQ8p832p4OdIIiy+kR6eImjYd'
        // const decrypt = scrypt.decryptWithGcm(key, address, salt, '11111111');
        // console.log('decrypt: ' + decrypt);
    });

});
