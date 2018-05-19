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
import { PrivateKey } from '../src/crypto';
describe('test account', ()=>{
  
    var privateKey:PrivateKey,
        accountDataStr:string,
        account:Account,
        encryptedPrivateKey : PrivateKey

    beforeAll(()=>{
        privateKey = PrivateKey.random();    
    })

    test('test create', ()=>{
        account = new Account()
        account.create(privateKey, '123456', 'mickey')
        encryptedPrivateKey = account.encryptedKey
        accountDataStr = account.toJson()
        expect(accountDataStr).toBeDefined()
        console.log('address: '+account.address.toBase58)
        console.log('privateKey: '+privateKey)
        console.log('addressU160: '+ account.address.toHexString())
    })
    test('test import account with correct password', () => {
        let a
        try {
           a = Account.importAccount('mickey', encryptedPrivateKey, '123456', account.address.toBase58())
        } catch(err) {}

        expect(a.label).toBe('mickey')

    })

    

    test('test import  with incorrect password', () => {
        try {
            let a = Account.importAccount('mickey',encryptedPrivateKey, '1234567',account.address.toBase58())
        } catch(err) {
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }

    })
})