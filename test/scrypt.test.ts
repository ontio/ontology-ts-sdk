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

import * as scrypt from '../src/scrypt'
import * as core from '../src/core'
import { ERROR_CODE } from '../src/error';
import { ab2hexstring } from '../src/utils';
import { PrivateKey, KeyType, KeyParameters, CurveLabel } from '../src/crypto';

describe('test scrypt', () => {
    it('test encrypt and decrypt', () => {
        let privateKey = PrivateKey.random();
        let encrypt = scrypt.encrypt(privateKey.key, privateKey.getPublicKey().key, '123456')
        expect(encrypt).toBeDefined()

        let result = scrypt.decrypt(encrypt, '123456')
        scrypt.checkDecrypted(encrypt, result, new PrivateKey(result).getPublicKey().key);
        expect(result).toEqual(privateKey.key)

        try {
            result = scrypt.decrypt(encrypt, '1234567')
            scrypt.checkDecrypted(encrypt, result, new PrivateKey(result).getPublicKey().key);
        } catch(err) {
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }

        // const key = '6PYReg3c35DGiwKvfTCKSFHEUv9imMoLNXu5RWsYi3Y9C8EQzTDKfWvLzv';
        // let pass = 'passwordtest'
        // let pri = scrypt.decrypt(key, pass)
        // scrypt.checkDecrypted(key, pri, new PrivateKey(pri).getPublicKey().key);
        // console.log(pri)
    })

})

