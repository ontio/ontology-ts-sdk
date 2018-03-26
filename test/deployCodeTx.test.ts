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

import {Transaction, TxType} from '../src/transaction/transaction'
import DeployCode from '../src/transaction/payload/DeployCode'

import {getHash} from '../src/core'
import {ab2hexstring, ab2str,str2hexstr , reverseHex} from '../src/utils'
import {Default_params, parseEventNotify, makeInvokeTransaction, makeDeployTransaction, buildTxParam} from '../src/transaction/transactionBuilder'

import AbiInfo from '../src/smartcontract/abi/AbiInfo'
import AbiFunction from '../src/smartcontract/abi/AbiFunction'
import Parameter from '../src/smartcontract/abi/parameter'
import { tx_url, socket_url , ONT_NETWORK} from '../src/consts'

import TxSender from '../src/transaction/TxSender'

import json from '../src/smartcontract/data/IdContract.abi'

var fs = require('fs')
let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract_v0.2.avm')
var code = ab2hexstring(avm)
var codehash = getHash(code)
console.log('code hash: '+codehash)

var privateKey = '7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93'
var ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'


// var contract = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract.abi.json')

// console.log('contract: '+contract)
// var abiInfo = AbiInfo.parseJson(contract.toString())
var abiInfo = AbiInfo.parseJson(JSON.stringify(json))

var serialized

const WebSocket = require('ws');

var txSender = new TxSender(ONT_NETWORK.TEST)


const testDeployCodeTx = () => {
    var dc = (<any> {})
    dc.author = 'mickey10'
    dc.code = fc
    dc.codeVersion = '1.0'
    dc.description = 'test'
    dc.email = ''
    dc.name = 'test2'
    dc.needStorage = true
    dc.vmType = 0


    var tx = makeDeployTransaction(code, dc, privateKey)
    
    var param = buildTxParam(tx)
    console.log('param: '+ param)

    const callback =  function(res, socket) {
        console.log('send tx response: ' + JSON.stringify(res))
        // socket.close()
    }

    txSender.sendTxWithSocket(param, callback)
}


const testDeserialize = () => {
    let tx = Transaction.deserialize(serialized)
    console.log('deserialized: '+ JSON.stringify(tx))
}




testDeployCodeTx()
// testDeserialize()

/* 
describe('test tx serialize and deserialize', ()=> {    
    var serialized

    test('test deployCode ', ()=> {
         serialized = tx.serialize()

        expect(serialized).toBeDefined()
    })

    test('test deployCode deserialize', () => {
        let tx = Transaction.deserialize(serialized)
        // console.log(JSON.stringify(tx))
        expect(tx.type).toEqual(TxType.DeployCode)
    })





    // test('', ()=> {
    //     let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/ClearingContract.avm')
       
    //     console.log(getHash( ab2hexstring(avm)))
    // })
}) */