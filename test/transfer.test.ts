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

import { Account } from "../src/account";
import * as core from '../src/core'
import {Transaction} from '../src/transaction/transaction'
import { makeTransferTransaction, buildRpcParam, buildRestfulParam } from "../src/transaction/transactionBuilder";
import TxSender from "../src/transaction/txSender";
import axios from 'axios'
import { ab2hexstring, StringReader } from "../src/utils";
import {State} from '../src/smartcontract/token'
import * as scrypt from '../src/scrypt'
import {TEST_NODE, HTTP_REST_PORT, REST_API} from '../src/consts'
import {BigNumber} from 'bignumber.js'

var accountFrom = {
    address: '012ad54766b0563e87fbf9ddc178fa924e05bb46',
    base58Address: 'TA5NzM9iE3VT9X8SGk5h3dii6GPFQh2vme',
    privateKey: '2ff1de0e26990385c5b7aa580e8516de20c95ac77a794e296be9e6fe005d6ed8'
}

var encrypted  = scrypt.encrypt(accountFrom.privateKey, '123456')
console.log('encrypted：'+ encrypted)

console.log('from base58: '+ core.addressToU160(accountFrom.base58Address))


var url = 'http://192.168.3.141',
    restPort = '20384',
    rpcPort = '20386',
    balanceApi = '/api/v1/balance'

const  testTransferTx = () => {
    var accountTo = ab2hexstring(core.generateRandomArray(20))
    let base58AccountTo = core.u160ToAddress(accountTo)
    console.log('account to: ' + base58AccountTo)

    var value = '3.5'

    var tx = makeTransferTransaction('ONT',accountFrom.address, accountTo, value, accountFrom.privateKey)
    var param = buildRestfulParam(tx)
    console.log('param : ' + JSON.stringify(param))

    // var temp = Transaction.deserialize(tx.serialize())
    // console.log('deserialzied: ' + JSON.stringify(temp))

    let request = `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.sendRawTx}`

    axios.post(request, param).then(res => {
        console.log('transfer response: ' + JSON.stringify(res.data))
        setTimeout( function(){
            testGetBalance(base58AccountTo)
        }, 5000)
    }).catch(err => {
        console.log(err)
    })


}

const testGetBalance = (address) => {
    let request = `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.getBalance}/${address}`
    axios.get(request).then((res) => {
        let result = res.data.Result
        console.log(result)
        result.ont = new BigNumber(result.ont).multipliedBy(1e-8).toNumber()
        result.ong = new BigNumber(result.ong).multipliedBy(1e-8).toNumber()

        console.log(result)
    }).catch(err => {
        console.log(err)
    })
}

testTransferTx()

// testGetBalance(accountFrom.base58Address)

// var state = new State()
// state.from = ab2hexstring(core.generateRandomArray(20))
// state.to = ab2hexstring(core.generateRandomArray(20))
// state.value = '1234567234567893456789823456789345678'
// var stateSerialized = state.serialize()
// console.log('state serialized: '+ stateSerialized)

// console.log('state deserialized: ' + JSON.stringify(State.deserialize(new StringReader(stateSerialized))))


// var p = '760bb46952845a4b91b1df447c2f2d15bb40ab1d9a368d9f0ee4bf0d67500160'
var p = core.generatePrivateKeyStr()
var password = '123456'
var key = scrypt.encrypt(p, password)
console.log(key)

// var key = '6PYWwoCjeMgk9n91KDVEvFx3YtxGajtSVjsuVF4fdapiqdfApaT8tXFbau'
// var password = '123456'


console.log(scrypt.decrypt(key, password))
