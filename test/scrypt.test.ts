import * as CryptoJS from 'crypto-js';
import { Account } from '../src/account';
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
import * as core from '../src/core';
import { u160ToAddress } from '../src/core';
import { Address, CurveLabel, KeyParameters, KeyType , PrivateKey } from '../src/crypto';
import { ERROR_CODE } from '../src/error';
import * as scrypt from '../src/scrypt';
import { ab2hexstring, str2hexstr } from '../src/utils';
import { PublicKey } from './../src/crypto/PublicKey';

describe('test scrypt', () => {
    it('test encrypt and decrypt', () => {
        // const privateKey = PrivateKey.random();
        const privateKey = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07');
        const publicKey = privateKey.getPublicKey().serializeHex();
        const address = Address.addressFromPubKey(privateKey.getPublicKey());
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

        // const checksum = core.getChecksumFromAddress(address)

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
        const address = Address.addressFromPubKey(pub);
        // tslint:disable-next-line:no-console
        console.log('address: ' + address.toBase58());
        // tslint:disable-next-line:no-console
        console.log('enc2: ' + enc2.key);
    });

});
