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

import {Account} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'
import {ERROR_CODE} from '../src/error'
import { addressToU160 } from '../src/core';
describe('test account', ()=>{
  
    var privateKey:string,
        accountDataStr:string,
        account:Account,
        encryptedPrivateKey : string

    beforeAll(()=>{
        privateKey = utils.ab2hexstring(core.generatePrivateKey());    
    })

    test('test create', ()=>{
        account = new Account()
        account.create(privateKey, '123456', 'mickey')
        encryptedPrivateKey = account.key
        accountDataStr = account.toJson()
        expect(accountDataStr).toBeDefined()
        console.log('address: '+account.address)
        console.log('privateKey: '+privateKey)
        console.log('addressU160: '+addressToU160(account.address))
    })
    test('test import account with correct password', () => {
        let a
        try {
           a = Account.importAccount('mickey', encryptedPrivateKey, '123456')
        } catch(err) {}

        expect(a.label).toBe('mickey')

    })

    

    test('test import  with incorrect password', () => {
        try {
            let a = Account.importAccount('mickey',encryptedPrivateKey, '1234567')
        } catch(err) {
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }

    })
})