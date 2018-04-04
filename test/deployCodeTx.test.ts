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
import {ab2hexstring, ab2str,str2hexstr , reverseHex, num2hexstring} from '../src/utils'
import {Default_params, parseEventNotify, makeInvokeTransaction, makeDeployTransaction, buildTxParam, buildRestfulParam, makeDeployCode, buildRpcParam} from '../src/transaction/transactionBuilder'

import AbiInfo from '../src/smartcontract/abi/AbiInfo'
import AbiFunction from '../src/smartcontract/abi/AbiFunction'
import Parameter from '../src/smartcontract/abi/parameter'
import {ONT_NETWORK, TEST_NODE, TEST_ONT_URL} from '../src/consts'
import axios from 'axios' 
import TxSender from '../src/transaction/txSender'

import json from '../src/smartcontract/data/IdContract.abi'
import { VmCode, VmType } from '../src/transaction/vmcode';

var fs = require('fs')
let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract.avm')
var avmCode = ab2hexstring(avm)

var privateKey = '7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93'
var ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'


// var contract = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract.abi.json')

// console.log('contract: '+contract)
// var abiInfo = AbiInfo.parseJson(contract.toString())
var abiInfo = AbiInfo.parseJson(JSON.stringify(json))

var serialized

const WebSocket = require('ws');

var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)


const testDeployCodeTx = () => {
    
    // var code = new VmCode()
    // code.code = avmCode
    // code.vmType = VmType.NEOVM

    let dc = makeDeployCode(avmCode, VmType.NEOVM)
    var tx = makeDeployTransaction(dc, privateKey)
    
    // var param = buildRestfulParam(tx)

    // var url = TEST_ONT_URL.sendRawTxByRestful
    // axios.post(url, param).then((res:any)=> {
    //     console.log('deploy res: '+ JSON.stringify(res.data))
    // }).catch(err => {
    //     console.log('err: '+ err)
    // })
    // console.log('param: '+ param)

    var url = TEST_ONT_URL.RPC_URL
    let param = buildRpcParam(tx)
    console.log('param: '+JSON.stringify(param))
    axios.post(url, param).then((res)=>{
        console.log('deploy res: '+JSON.stringify(res.data))
        setTimeout(function() {
            getContract()
        }, 6000)
    }).catch(err => {
        console.log(err)
    })

    // var param = buildTxParam(tx)
    // var callback = function(res, socket) {
    //     console.log('res: '+ JSON.stringify(res))
    // }
    // txSender.sendTxWithSocket(param, callback)


}


const testDeserialize = () => {
    let tx = Transaction.deserialize(serialized)
    console.log('deserialized: '+ JSON.stringify(tx))
}

const getContract = () => {
    // let scriptHash = '0x926f6c6d6ecc698568c7446f464cc222fcd2e707'
    // scriptHash = scriptHash.substring(2)
    // scriptHash = reverseHex(scriptHash)

    let scriptHash = getHash(avmCode)
    scriptHash = num2hexstring(VmType.NEOVM) + scriptHash.substr(2)
    console.log('contract codehash : '+ scriptHash)

    // let scriptHash = '8046031450d43928654f50dcd50646331bb49e1a'
    
    let url = `${TEST_ONT_URL.REST_URL}api/v1/contract/${scriptHash}`
    axios.get(url).then((res)=>{
        console.log(res.data)
    })
}



testDeployCodeTx()

// getContract()
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