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

import { signTransaction, signTx } from './../src/transaction/transactionBuilder';
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
import { PrivateKey, KeyType, KeyParameters, CurveLabel } from "../src/crypto";
import { makeClaimOngTx, makeTransferTx, makeTransferFromManyTx, makeTransferToMany } from "../src/smartcontract/ontAssetTxBuilder";
import { addressToU160, u160ToAddress } from '../src/helpers';
import RestClient from '../src/network/rest/restClient';
import RpcClient from '../src/network/rpc/rpcClient'
import { getSingleSigUInt160 } from '../src/core';
import { Address } from '../src/crypto';
var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)

var restClient = new RestClient()

var accountFrom = {
    //testnet
    // hexAddress: '018f0dcf09ec2f0040e6e8d7e54635dba40f7d63',
    // address: 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE',
    // privateKey: '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'

    //local
    hexAddress: '013c7fd22a239be26196629ec9f4185c18ddc9f7',
    address: 'TA5k9pH3HopmscvgQYx8ptfCAPuj9u2HxG',
    privateKey: new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67318f')
    // address: 'TA98LCZuzins3mUPfDyNRirpQ4YoeRNBan',
    // privateKey: '6248eefef096ec2eebdff7179a59cc36b5c632720e40fb7e9770dc11024543be'
}

var accPrivateKey = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419')
var accAddress = 'TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf'
var accHexAddress = '012845c2ed3b508d135066dba00f850a82b192fd'


const  testTransferTx = () => {

    var pri1 = new PrivateKey('c19f16785b8f3543bbaf5e1dbb5d398dfa6c85aaad54fc9d71203ce83e505c07'),
        address1 = 'TA4WVfUB1ipHL8s3PRSYgeV1HhAU3KcKTq',
        address2 = 'TA5kdiHgtYP2x781hw8JbvNxxUujPiBobY'
    address1 = addressToU160(address1)
    address2 = addressToU160(address2)
    let tx = makeTransferTx('ONT', new Address(address1), new Address(address2), '20')
    signTransaction(tx, pri1)
    // var tx = makeTransferTransaction('ONT', accountFrom.hexAddress, '01716379e393d1a540615e022ede47b97e0577c6', value, 
    // accountFrom.privateKey)
    // var tx = makeTransferTransaction('ONT', accHexAddress, accountToHexAddress, value, accPrivateKey)
    let param = buildTxParam(tx)
    var callback = function (err, res, socket) {
        console.log('res : ' + JSON.stringify(res))
    }
    txSender.sendTxWithSocket(param, callback)

    // let param = buildTxParam(tx)
    // var callback = function(err, res, socket) {
    //     console.log('res : '+JSON.stringify(res))
    // }
    // txSender.sendTxWithSocket(param, callback)

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


//1202023cd636327150065fb4d3b354bd48ace5e402904f6f28f39f2fe22cd642986d9c
//c62bbce37fc96c90e2eea6de474b0031e560ef3630d2f6efe275f16f85ed1543

const testClaimOng = () => {
    let pri = new PrivateKey('a53213c27eb1de0796b9d0b44c96e7e30228f1466d8657c47b471a4700777c0c')
    let hexAddress = '01716379e393d1a540615e022ede47b97e0577c6'
    console.log(hexAddress)

    // let pri = new PrivateKey('c62bbce37fc96c90e2eea6de474b0031e560ef3630d2f6efe275f16f85ed1543')
    // let address = 'TA9VgmPJcok9cBBLwcLqwhRAfD45vtWa5i'
    // let hexAddress = addressToU160(address)
    // let from = hexAddress
    // let to = from
    // let to = accountFrom.hexAddress
    let tx = makeClaimOngTx(new Address(hexAddress), new Address(hexAddress), '1')
    signTransaction(tx, pri)

    console.log(tx.serialize())
    let restClient = new RestClient()
    restClient.sendRawTransaction(tx.serialize()).then(res => {
        console.log(res)
    })
}

var pri1 = new PrivateKey('c19f16785b8f3543bbaf5e1dbb5d398dfa6c85aaad54fc9d71203ce83e505c07'),
    address1 = new Address('TA4WVfUB1ipHL8s3PRSYgeV1HhAU3KcKTq')
var pri2 = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419'),
    address2 = new Address('TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf',)
    
var pri3 = new PrivateKey('a53213c27eb1de0796b9d0b44c96e7e30228f1466d8657c47b471a4700777c0c'),
    address3 = new Address('01716379e393d1a540615e022ede47b97e0577c6')
    
const testTransferFromMany = () => {
    
    let tx = makeTransferFromManyTx('ONT', [address1, address2], address3, ['100', '200'])
    let pris = [ [pri1], [pri2]]
    signTx(tx, pris)
    let param = buildTxParam(tx)
    var callback = function(err, res, socket) {
        console.log('res : '+JSON.stringify(res))
    }
    txSender.sendTxWithSocket(param, callback)
}

const testTransferToMany = () => {
    let tx = makeTransferToMany('ONT', address1, [address2, address3], ['100', '200'])
    signTransaction(tx, pri1)
    let param = buildTxParam(tx)
    var callback = function (err, res, socket) {
        console.log('res : ' + JSON.stringify(res))
    }
    txSender.sendTxWithSocket(param, callback)
}

// testTransferTx() 
let add = u160ToAddress('01716379e393d1a540615e022ede47b97e0577c6')
// testGetBalance(address3.toBase58(), '')

// testClaimOng()

// testTransferFromMany()

testTransferToMany()