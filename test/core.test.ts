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

 
import * as core from '../src/core'
import * as utils from '../src/utils'
import * as scrypt from '../src/scrypt'
import { ab2hexstring } from '../src/utils';
import { verifySignature, getMerkleProof } from '../src/core';

describe('test core', ()=>{

    var privateKey:string,
        wifKey:string

    beforeAll(() => {
        privateKey = utils.ab2hexstring( core.generatePrivateKey() )
    })

    test('test getWIFFromPrivateKey', () => {
        wifKey = core.getWIFFromPrivateKey(privateKey)
        expect(wifKey).toBeDefined()
    })

    test('test getPrivateKeyFromWIF', () => {
        let key = core.getPrivateKeyFromWIF(wifKey)
        expect(key).toEqual(privateKey)
    })

    test('get public key', () => {
        let pkBuffer = core.getPublicKey(privateKey, true)
        let pk = utils.ab2hexstring(pkBuffer)
        console.log('get pk: ' + pk)
        expect(pk).toBeDefined()
    })

    test('encrypt private key', () => {
        let privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
        let wif = core.getWIFFromPrivateKey(privateKey)
        let encrypt = scrypt.encrypt(wif, '123456')
        console.log('encrypt: '+ encrypt)
    })

    test('sign and verify', () => {
        let privateKey = core.generatePrivateKeyStr()
        let data = 'hello world'
        let signed = core.signatureData(data, privateKey)
        console.log('signed: ' + signed)

        let pk = core.getPublicKey(privateKey, true)
        let verifyResult = core.verifySignature(data, signed, pk)
        console.log('verifyResult: ' + verifyResult)
        expect(verifyResult).toBeTruthy()
    })

})