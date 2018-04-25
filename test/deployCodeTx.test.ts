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
import DeployCode from '../src/transaction/payload/deployCode'

import {getHash, getContractHash} from '../src/core'
import {ab2hexstring, ab2str,str2hexstr , reverseHex, num2hexstring} from '../src/utils'
import {Default_params, parseEventNotify, makeInvokeTransaction, makeDeployCodeTransaction, buildTxParam, buildRestfulParam, buildRpcParam} from '../src/transaction/transactionBuilder'

import AbiInfo from '../src/smartcontract/abi/abiInfo'
import AbiFunction from '../src/smartcontract/abi/abiFunction'
import {Parameter} from '../src/smartcontract/abi/parameter'
import {ONT_NETWORK, TEST_NODE, TEST_ONT_URL} from '../src/consts'
import axios from 'axios' 
import TxSender from '../src/transaction/txSender'

import json from '../src/smartcontract/data/idContract.abi'
import { VmCode, VmType } from '../src/transaction/vmcode';

var fs = require('fs')
var path = require('path')
let idContractAvm = fs.readFileSync(path.join(__dirname, '../src/smartcontract/data/IdContract.avm'))
var idContractAvmCode = ab2hexstring(idContractAvm)


var privateKey = '7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93'
var ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'

const wasmCode = '0061736d0100000001250760017f0060017f017f60027f7f017f60037f7f7f0060027f7f0060037f7f7f017f60000002d0010c03656e76066d656d6f727902000103656e760a6d656d6f727942617365037f0003656e760d44656c65746553746f72616765000003656e760a47657453746f72616765000103656e76104a736f6e4d617368616c526573756c74000203656e76114a736f6e556e6d617368616c496e707574000303656e760a50757453746f72616765000403656e760d52756e74696d654e6f74696679000003656e760861727261794c656e000103656e76066d616c6c6f63000103656e76066d656d637079000503656e7606737472636d70000203050402020202060b027f0141000b7f0141000b070a0106696e766f6b65000d0afd03040700200120006a0b3e01037f20001006210220011006220320026a10072104200241004a044020042000200210081a0b200341004a0440200420036a2001200310081a0b20040b6d01047f200010062104200110062105200441004a04400340200020034102746a28020020026a2102200341016a22032004470d00200221000b05410021000b200541004a0440410021020340200120024102746a28020020006a2100200241016a22022005470d000b0b20000bc50201027f23012103230141106a240120032102024020002300100904402000230041136a1009450440200241082001100320022802002002280204100a230041176a1002220010050c020b20002300411b6a1009450440200241082001100320022802002002280204100b230041226a1002220010050c020b2000230041296a1009450440200241082001100320022802002002280204100c230041176a1002220010050c020b2000230041326a100945044020024108200110032002280200200228020410042300413d6a230041226a1002220010050c020b2000230041c2006a1009450440200241042001100320022802001001230041226a1002220010050c020b2000230041cd006a1009044041002100052002410420011003200228020010002300413d6a230041226a1002220010050b05230041056a21000b0b2003240120000b0b60010023000b5a696e697400696e69742073756363657373210061646400696e7400636f6e63617400737472696e670073756d41727261790061646453746f7261676500446f6e650067657453746f726167650064656c65746553746f72616765'

// var contract = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/idContract.abi.json')

// console.log('contract: '+contract)
// var abiInfo = AbiInfo.parseJson(contract.toString())
var abiInfo = AbiInfo.parseJson(JSON.stringify(json))

var serialized

const WebSocket = require('ws');

var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)


const testDeployCodeTx = (code, vmType = VmType.NEOVM) => {
    
    var tx = makeDeployCodeTransaction(code, vmType)
    
    var param = buildRestfulParam(tx)

    var url = TEST_ONT_URL.sendRawTxByRestful
    axios.post(url, param).then((res:any)=> {
        console.log('deploy res: '+ JSON.stringify(res.data))
    setTimeout(function () {
        getContract(code, vmType)
    }, 6000)
    }).catch(err => {
        console.log('err: '+ err)
    })
    // console.log('param: '+ param)

    // var url = TEST_ONT_URL.RPC_URL
    // let param = buildRpcParam(tx)
    // console.log('param: '+JSON.stringify(param))
    // axios.post(url, param).then((res)=>{
    //     console.log('deploy res: '+JSON.stringify(res.data))
    //     setTimeout(function() {
    //         getContract(code, vmType)
    //     }, 6000)
    // }).catch(err => {
    //     console.log(err)
    // })

    // var param = buildTxParam(tx)
    // var callback = function(err, res, socket) {
    //     console.log('res: '+ JSON.stringify(res))
    // }
    // txSender.sendTxWithSocket(param, callback)


}


const testDeserialize = () => {
    let tx = Transaction.deserialize(serialized)
    console.log('deserialized: '+ JSON.stringify(tx))
}

const getContract = (avmCode, vmType=VmType.NEOVM) => {
    const codeHash = getContractHash(avmCode,vmType)
    let url = `${TEST_ONT_URL.REST_URL}/api/v1/contract/${codeHash}`
    console.log('url : '+ url)
    axios.get(url).then((res)=>{
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
}



testDeployCodeTx(idContractAvmCode)

// testDeployCodeTx(recordContractAvmCode)

// testDeployCodeTx(wasmCode, VmType.WASMVM)


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