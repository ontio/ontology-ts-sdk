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

import AbiInfo from '../src/smartcontract/abi/abiInfo'
import AbiFunction from '../src/smartcontract/abi/abiFunction'
import {Parameter} from '../src/smartcontract/abi/parameter'

import json from '../src/smartcontract/data/idContract.abi'
import {Transaction} from '../src/transaction/transaction'

import { makeInvokeTransaction} from '../src/transaction/transactionBuilder'
import { Account } from '../src/account';
import { generatePrivateKeyStr, signatureData, getPublicKey } from '../src/core'
import {ab2hexstring, str2hexstr} from '../src/utils'

describe('test AbiInfo', () => {

    var a : AbiInfo,
        f : AbiFunction,
        tx : Transaction,
        serialized : string

    test('test read json', () => {
         a = AbiInfo.parseJson(JSON.stringify(json))
        f = a.getFunction('RegIdByPublicKey')

        expect(f.parameters.length).toEqual(2)

        let ontidhex = str2hexstr('did:ont:TQLASLtT6pWbThcSCYU1biVqhMnzhTgLFq')
        let p1 = new Parameter('id', 'ByteArray',ontidhex)
        let p2 = new Parameter('pk', 'ByteArray', '039fbb47841f7338c0c654addd6225995642b5b6d492413563f7f8755ba83c0ecd')

        f.setParamsValue(p1,p2)

        console.log(f)


    })

    test('test make invokecode tx', () => {
        let privateKey = generatePrivateKeyStr()
        tx = makeInvokeTransaction(  f, privateKey )
        console.log(tx)
        
        serialized = tx.serialize()
        console.log('serialize: '+serialized)
        expect(serialized).toBeDefined()
    })

    test('test deserialize', () => {

        let t = Transaction.deserialize(serialized)
        console.log('deserialized: '+ t.toString())
        expect(t.txAttributes.length).toEqual(1)
    }) 

    test('test deserialize with given string', ()=> {
        let str = 'd100eacecb46f117f55c80147a9d391c7c65af10bd366921039fbb47841f7338c0c654addd6225995642b5b6d492413563f7f8755ba83c0ecd2a2a6469643a6f6e743a41526a42735a32546e6f336345384e3132706631454b6a67464c37646a4247573452c1194372656174654964656e7469747942795075626c69634b6579012014082e502f35ec5cf8cc1209d0de00c550578911a700000000000000000000014140e76b00f381f0b6a7cf9946a65d619c967e705ee94a58ac34c292bc4c238d53fffe9039c6fbfc9d9d08806d54ffe4e63d56cfd6a5acc903b9bff17c982347e4842321039fbb47841f7338c0c654addd6225995642b5b6d492413563f7f8755ba83c0ecdac'
        let t = Transaction.deserialize(str)
        console.log('deserialized str: '+JSON.stringify(t))
        expect(t.payload.parameters.length).toEqual(2)
    })


})
