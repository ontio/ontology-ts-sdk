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
import { makeTransferTransaction, buildRpcParam, buildRestfulParam, buildTxParam } from "../src/transaction/transactionBuilder";
import TxSender from "../src/transaction/txSender";
import axios from 'axios'
import { ab2hexstring, StringReader } from "../src/utils";
import {State} from '../src/smartcontract/token'
import * as scrypt from '../src/scrypt'
import {TEST_NODE, HTTP_REST_PORT, REST_API, ONT_NETWORK, TEST_ONT_URL} from '../src/consts'
import {BigNumber} from 'bignumber.js'
import { addressToU160 } from "../src/core";

var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)

var accountFrom = {
    hexAddress: '018f0dcf09ec2f0040e6e8d7e54635dba40f7d63',
    address: 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE',
    privateKey: '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'

    // address: 'TA98LCZuzins3mUPfDyNRirpQ4YoeRNBan',
    // privateKey: '6248eefef096ec2eebdff7179a59cc36b5c632720e40fb7e9770dc11024543be'
}

var accPrivateKey = 'b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419'
var accAddress = 'TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf'
var accHexAddress = '012845c2ed3b508d135066dba00f850a82b192fd'


const  testTransferTx = () => {
    
    var accountToHexAddress = ab2hexstring(core.generateRandomArray(20))
    let accountToAddress = core.u160ToAddress(accountToHexAddress)

    var value = '300'


    var tx = makeTransferTransaction('ONT', accountFrom.hexAddress, addressToU160('TA5uka5Y2PtuWvVRAdpEhddxCtPTpff847'), value, 
    accountFrom.privateKey)
    // var tx = makeTransferTransaction('ONT', accHexAddress, accountToHexAddress, value, accPrivateKey)
    
    // var param = buildRestfulParam(tx)
    // // console.log('param : ' + JSON.stringify(param))

    let request = `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.sendRawTx}`

    // axios.post(request, param).then(res => {
    //     console.log('transfer response: ' + JSON.stringify(res.data))
    //     setTimeout( function(){
    //         // testGetBalance(accountFrom.address, 'transfer 1 from')
    //         // testGetBalance(accAddress, 'transfer 1 to')

    //         testGetBalance(accountFrom.address, 'transfer 1 from')
    //         testGetBalance('TA5uka5Y2PtuWvVRAdpEhddxCtPTpff847', 'transfer 1 to')
    //     }, 8000)
    // }).catch(err => {
    //     console.log(err)
    // })

    let param = buildTxParam(tx)
    var callback = function(err, res, socket) {
        console.log('res : '+JSON.stringify(res))
    }
    txSender.sendTxWithSocket(param, callback)

}

const testGetBalance = (address, addressName) => {
    let request = `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.getBalance}/${address}`
    axios.get(request).then((res) => {
        let result = res.data.Result
        // console.log(result)
        // result.ont = new BigNumber(result.ont).multipliedBy(1e-8).toNumber()
        // result.ong = new BigNumber(result.ong).multipliedBy(1e-8).toNumber()

        console.log(addressName + ' Get balance:' + JSON.stringify(result))
    }).catch(err => {
        console.log(err)
    })
}

testTransferTx()

//需要 交易前加上预执行 rpc调用

// testGetBalance('TA5uka5Y2PtuWvVRAdpEhddxCtPTpff847','acc address')

// var state = new State()
// state.from = ab2hexstring(core.generateRandomArray(20))
// state.to = ab2hexstring(core.generateRandomArray(20))
// state.value = '1234567234567893456789823456789345678'
// var stateSerialized = state.serialize()
// console.log('state serialized: '+ stateSerialized)

// console.log('state deserialized: ' + JSON.stringify(State.deserialize(new StringReader(stateSerialized))))


var p = '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'
// var p = core.generatePrivateKeyStr()
var password = '123456'
var key = scrypt.encrypt(p, password)
console.log(key)

// var key = '6PYWwoCjeMgk9n91KDVEvFx3YtxGajtSVjsuVF4fdapiqdfApaT8tXFbau'
// var password = '123456'


// console.log(scrypt.decrypt(key, password))

// var key = ''
// var privateKey = scrypt.decrypt(key,'123123')

// let publickeyEncode = core.getPublicKey(privateKey, true).toString('hex');

// let programHash = core.getSingleSigUInt160(publickeyEncode);

// this.address = core.u160ToAddress(programHash);