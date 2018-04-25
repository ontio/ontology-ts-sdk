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

// describe('test scrypt', () => {
//     // it('test encrypt and decrypt', () => {
//     //     let privateKey = core.generatePrivateKeyStr()
//     //     let encrypt = scrypt.encrypt(privateKey, '123456')
//     //     expect(encrypt).toBeDefined()

//     //     let result = scrypt.decrypt(encrypt, '123456')
//     //     expect(result).toEqual(privateKey)

//     //     try {
//     //         result = scrypt.decrypt(encrypt, '1234567')
//     //     } catch(err) {
//     //         expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
//     //     }
//     // })

//     test('test ecies encrypt', async () => {
        
//     })
// })


const data = 'hello world'
const privateKey = core.generatePrivateKeyStr()
const publicKey = ab2hexstring(core.getPublicKey(privateKey, false))
scrypt.ECIESencrypt(data, publicKey).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})