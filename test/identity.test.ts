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
import * as utils from '../src/utils'
import {ERROR_CODE} from '../src/error'
import { PrivateKey, Address } from '../src/crypto';
import {buildRegisterOntidTx} from '../src/smartcontract/ontidContractTxBuilder'
import { signTransaction } from './../src/transaction/transactionBuilder';
import axios from 'axios'
import * as core from './../src/core'

describe('test identity', () => {

    var privateKey: PrivateKey,
        identityDataStr: string,
        identity: Identity,
        encryptedPrivateKey: PrivateKey,
        checksum:string

    beforeAll(() => {
        privateKey = PrivateKey.random();
    })

    test('test create', () => {
        identity = new Identity()
        identity.create(privateKey, '123456', 'mickey')
        let ontid = identity.ontid
        checksum = core.getChecksumFromOntid(ontid)
        encryptedPrivateKey = identity.controls[0].encryptedKey
        identityDataStr = identity.toJson()
        expect(identityDataStr).toBeDefined()
    })

    test('test import with correct password', () => {
        console.log('encryptedkey: ' + encryptedPrivateKey.key)
        let a: Identity 
        let encrypt = new PrivateKey('Eg3FtGvUSbSb8S4JNYG1vxPcwTJBgMVhBkPuinA0F6A='),
            ontid = 'did:ont:TA9WVH2J7nCksYjvzhs3eWjaUFAE3Tr8at',
            password = '111111'
        try {
         a = Identity.importIdentity('mickey', encrypt, '111111',core.getChecksumFromOntid(ontid))
        } catch(err) {
            console.log(err)
        }
        expect(a.label).toBe('mickey')
    })

    test('test import with incorrect password', () => {
        try {
            let a = Identity.importIdentity('', encryptedPrivateKey, '123457', checksum)
        } catch (err) {
            console.log(err)
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }
    })

    test('test_create_with_userAgent', () => {
        let a = new Identity()
        let pri = PrivateKey.random()
        a.create(pri, '123456', 'test')
        let tx = buildRegisterOntidTx(a.ontid, pri.getPublicKey(), '0')
        //user agent address
        tx.payer = new Address('TA4pCAb4zUifHyxSx32dZRjTrnXtxEWKZr')
        signTransaction(tx, pri)
        const userAgent = 'http://192.168.50.121:9099/api/v1/ontpass/ontid/register'
        axios.post(userAgent, {
            "OwnerOntId": a.ontid,
            "TxnStr": tx.serialize()
        }).then( res=>{
            console.log(res.data)
        })
    })

})