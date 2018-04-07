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

import { Identity } from '../src/identity'
import * as core from '../src/core'
import * as utils from '../src/utils'
import {ERROR_CODE} from '../src/error'

describe('test identity', () => {

    var privateKey: string,
        identityDataStr: string,
        identity: Identity,
        encryptedPrivateKey

    beforeAll(() => {
        privateKey = utils.ab2hexstring(core.generatePrivateKey());
    })

    test('test create', () => {
        identity = new Identity()
        identity.create(privateKey, '123456', 'mickey')
        encryptedPrivateKey = identity.controls[0].key
        identityDataStr = identity.toJson()
        expect(identityDataStr).toBeDefined()
    })

    test('test import with correct password', () => {
        console.log('encryptedkey: ' + encryptedPrivateKey)
        let a 
        try {
         a = Identity.importIdentity('', encryptedPrivateKey, '123456')
        } catch(err) {
            console.log(err)
        }
        expect(a.label).toBe('mickey')
    })

    test('test import with incorrect password', () => {
        try {
            let a = Identity.importIdentity('', encryptedPrivateKey, '123457')
        } catch (err) {
            console.log(err)
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }
    })

})