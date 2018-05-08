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

import { makeInvokeTransaction , parseEventNotify, 
    buildRpcParam, buildTxParam, buildRestfulParam, sendRawTxRestfulUrl } from '../src/transaction/transactionBuilder'
import {buildAddAttributeTx, buildGetDDOTx, buildRegisterOntidTx, buildAddPKTx, buildGetPublicKeysTx, buildRemovePkTx, buildAddRecoveryTx, buildChangeRecoveryTx, buildGetPublicKeyIdTx, buildGetPublicKeyStatusTx} from '../src/smartcontract/ontidContract'
import {Transaction} from '../src/transaction/transaction'
import InvokeCode from '../src/transaction/payload/invokeCode'
import { Identity } from '../src/identity'
import * as core from '../src/core'
import AbiInfo from '../src/smartcontract/abi/abiInfo'
import AbiFunction from '../src/smartcontract/abi/abiFunction'
import {Parameter, ParameterType } from '../src/smartcontract/abi/parameter'
import json2 from '../src/smartcontract/data/idContract.abi'
import { ab2hexstring, str2hexstr, StringReader } from '../src/utils'
import { DEFAULT_ALGORITHM, ONT_NETWORK, TEST_NODE } from '../src/consts';
import { DDO } from '../src/transaction/ddo'
import { TEST_ONT_URL} from '../src/consts'
import { getHash, generateOntid } from '../src/core';
import TxSender from '../src/transaction/txSender'
import axios from 'axios'
import { PublicKeyStatus, PrivateKey, KeyType, CurveLabel, KeyParameters, PublicKey } from '../src/crypto';
import WebsocketClientApi from '../src/network/websocket/websocketClient';
import { VmType } from '../src/transaction/vmcode';
import { RestClient, WebSocketClientApi } from '../src/index';


const codeHash = '80e7d2fc22c24c466f44c7688569cc6e6d6c6f92'

var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)

// const SOCKET_URL = 'ws://52.80.115.91:20335'
const Default_params = {
    "Action": "sendrawtransaction",
    "Version": "1.0.0",
    "Type": "",
    "Op": "exec"
}
const WebSocket = require('ws');

var privateKey: PrivateKey
var publicKey: PublicKey
var pk2: PublicKey
var ontid: string
var oldrecovery : string
var newrecovery : string
var pkId : string

var abiInfo: AbiInfo
var identity: Identity

abiInfo = AbiInfo.parseJson(JSON.stringify(json2))
// privateKey = core.generatePrivateKeyStr()
// console.log('privatekey: ' + privateKey)
// console.log('publick key: ' + publicKey)

privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
publicKey = privateKey.getPublicKey()
pkId = ''
// let publicKey2 = ab2hexstring(core.getPublicKey(privateKey, true))

// var pkPoint = core.getPublicKeyPoint(privateKey)
// console.log('pk false: '+ publicKey)
// console.log('pk true: ' + publicKey2)



// privateKey = 'cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406'
// ontid = '6469643a6f6e743a626f626162636465636465666768c'
// ontid = generateOntid(privateKey)
ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW'
pk2 = new PublicKey('035096277bd28ee25aad489a83ca91cfda1f59f2668f95869e3f7de0af0f07fc5c');

// recovery = ab2hexstring(core.generateRandomArray(20))

newrecovery = '8143c0070b7bea4895dbe9078abdf655047b5949'
oldrecovery = '8143c0070b7bea4895dbe9078abdf655047b5950'


// var invoke = new InvokeCode();
// var sr = new StringReader('5999efd79e56f5b4edc78ba2bafae3cd2c3bb68dfd030121023ed0ac36b2222e47f4997e58e420b6e29cf8b7f2d540fce9ec92ebbdf1c72cbe5e7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e34222c224f6e746964223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f44227d06537472696e6740623561383762656139326435323532356236656261336236373035393563663862396362623531653937326635636266663439396434383637376464656538612a6469643a6f6e743a544146593162684c446b685a706b4e47685335664775425935474c544d416256584e55c10c416464417474726962757465')
// invoke.deserialize(sr)
// console.log('invoke:'+JSON.stringify(invoke))

// identity = new Identity()
// identity.create(privateKey, '123456', 'mickey')
// ontid = str2hexstr(identity.ontid)

ontid = core.generateOntid(privateKey.key)
console.log('ontid: ' + ontid)

const sendTx = (param, callback = null) => {
    const socket = new WebSocket(TEST_ONT_URL.SOCKET_URL)
    socket.onopen = () => {
        console.log('connected')
        // let wsapi = new WebSocketClientApi()
        // let subscribe = wsapi.sendSubscribe(true)
        // socket.send(subscribe)
        // setTimeout(()=>{
        // },2000)
        socket.send(param)
        
    }
    socket.onmessage = (event) => {
        let res 
        if(typeof event.data === 'string') {
            res = JSON.parse(event.data)
        }
        console.log('response for send tx: ' + JSON.stringify(res))
        if (callback) {
            if (res.Result && res.Action != 'sendrawtransaction') {
                callback(event.data)
                socket.close()
            }
        }
        if(res.Action === 'Notify'){
            let result = parseEventNotify(res)
            console.log('paresed event notify: '+JSON.stringify(result))
            socket.close()
        }
        // socket.close()
    }
    socket.onerror = (event) => {
        //no server or server is stopped
        console.log(event)
        socket.close()
    }
}

const callback = function (res, socket) {
    console.log('response: '+ JSON.stringify(res))

    // parseDDO(res.Result)
    // if (res.Action === 'Notify') {

    //     let result = parseEventNotify(res)
    //     console.log('paresed event notify: ' + JSON.stringify(result))
    // }
    
}

const testDDOTx = () => {
    let tx = buildGetDDOTx(ontid)

    // let param = buildTxParam(tx, true)

    // console.log('param: '+param)
    
    // txSender.sendTxWithSocket(param, callback)

    let param = buildRestfulParam(tx)
    console.log('param: '+JSON.stringify(param))
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    console.log(url)
    axios.post(url, param).then((res) => {
        console.log(res.data)
        if(res.data.Result && res.data.Result.length > 0) {
            const ddo = DDO.deserialize(res.data.Result[0])
            console.log('ddo: '+JSON.stringify(ddo))
        }
    }).catch(err => {
        console.log(err)
    })
    
}

// const testDDOByRpc = () => {
//     let tx = buildGetDDOTx(ontid, privateKey)
//     let param = buildRpcParam(tx)
//     txSender.sendWithRpc(param).then( res => {
//         console.log('rpc response: '+ JSON.stringify(res))
//     })
// }

const parseDDO = (result) => {
    let ddo = DDO.deserialize(result)
    console.log("parse DDO : " + JSON.stringify(ddo))
}


const testRegisterOntid = () => {
    let tx = buildRegisterOntidTx(str2hexstr(ontid), privateKey)
    let serialized = tx.serialize()
    console.log('tx serialized: '+serialized)

    let param = buildTxParam(tx)
    sendTx(param)
    // console.log('param : '+param)
    // txSender.sendTxWithSocket(param, callback)

    // let param = buildRestfulParam(tx)
    // let url = TEST_ONT_URL.sendRawTxByRestful
    // axios.post(url, param).then((res)=>{
    //     console.log(res.data)
    // })
}

const testAddAttribute = () => {

    var claimId = 'claim:b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a',
        context = 'claim:staff_authentication8',
        issuer = 'did:ont:TVuF6FH1PskzWJAFhWAFg17NSitMDEBNoa'
        let path = str2hexstr(claimId)
        let type = str2hexstr('JSON')
        let data = {
            Type : 'JSON',
            Value : {
                Context: context,
                Issuer: issuer
            }
        }
        let value = JSON.stringify(data)
        console.log('value: '+value)
        value = str2hexstr(value)
        // let value = str2hexstr(issuer)
    
    // let path = str2hexstr('Claim:twitter')
    // let type = str2hexstr('String')
    // let value = str2hexstr('wang17@twitter')

    
    let tx = buildAddAttributeTx(path, value, type, ontid, privateKey )
    console.log('path: '+ path)
    console.log('value: ' + value)
    console.log('ontid: ' + ontid)
    console.log('type: '+ type)
    console.log('privateKey: ' + privateKey.key)
    console.log('publick: '+publicKey)
    
    let param = buildTxParam(tx)
    console.log('param: '+JSON.stringify(param))
    sendTx(param)
    // let param = buildRestfulParam(tx)
    // console.log('param: '+JSON.stringify(param))

    // axios.post(TEST_ONT_URL.sendRawTxByRestful, param).then((res)=>{
    //     console.log(res.data)
    // }).catch(err => {
    //     console.log(err)
    // })
}

const testGetPublicKeyId = () => {
    let tx = buildGetPublicKeyIdTx(ontid, publicKey)
    let param = buildRestfulParam(tx)
    console.log(param)
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    console.log(url)
    axios.post(url, param).then((res) => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
}

const testGetPublicKeyStatus = () => {
    let tx = buildGetPublicKeyStatusTx(ontid, '02')
    let param = buildRestfulParam(tx)
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    axios.post(url, param).then((res) => {
        console.log(res.data)
        let result = res.data.Result[0]
        let ps
        if(result && result.length > 0) {
             ps = PublicKeyStatus.deserialize(result)
        }
        console.log('ps :' + JSON.stringify(ps))
    }).catch(err => {
        console.log(err)
    })
}

const testAddPK = () => {
    let tx = buildAddPKTx(ontid, pk2, publicKey, privateKey)
    let param = buildTxParam(tx)
    console.log('add pk param: ' + param)
    sendTx(param)
}

const testGetPublicKeys = () => {
    let tx = buildGetPublicKeysTx(ontid, privateKey)
    // let param = buildTxParam(tx)
    // sendTx(param)
    let param = buildRestfulParam(tx)
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    axios.post(url, param).then(res => {
        console.log(res.data)
    })
}

const testRemovePK = () => {
    let tx = buildRemovePkTx(ontid, pk2, publicKey, privateKey)
    let param = buildTxParam(tx)
    console.log('remove pk param: ' + param)
    sendTx(param)
}

const testAddRecovery = () => {
    let tx = buildAddRecoveryTx(ontid, oldrecovery, publicKey, privateKey)
    let param = buildTxParam(tx)
    sendTx(param)
}

const testChangeRecovery = () => {
    let tx = buildChangeRecoveryTx(ontid, newrecovery, oldrecovery, privateKey)
    let param = buildTxParam(tx)
    console.log('change recovery param: ' + param)
    sendTx(param)
}

const testInvokeWasmContract = () => {
    const codeHash = '9007be541a1aef3d566aa219a74ef16e71644715'
    const params = [new Parameter('p1', ParameterType.Int, 20), new Parameter('p2', ParameterType.Int, 30)]
    const funcName = 'add'
    let tx = makeInvokeTransaction(funcName, params, codeHash, VmType.WASMVM)
    // let txParam = tx.serialize()
    // console.log('wasm param:' + txParam)
    // let restClient = new RestClient()
    // restClient.sendRawTransaction(txParam).then( res => {
    //     console.log(res)
    
    // })
    let param = buildTxParam(tx)
    console.log(param)
    sendTx(param)
}


//uncomment one line to test one tx each time.

testRegisterOntid()

// testAddAttribute()

// testDDOTx()

// testVerifyOntidClaim()

// testDDOByRpc()

// testGetPublicKeys()

// testCheckOntid()

// testAddPK()

// testRemovePK()

// testAddRecovery()

// testChangeRecovery()

// testGetPublicKeyId()

// testGetPublicKeyStatus()

// let txHash = '82c17d7430140a1f3863b8f6f03db07bbdfbdb7da22ffdb2358a1d2e185f8bf3'
// core.getMerkleProof(txHash).then( res => {
//     console.log(res)
// })

// testInvokeWasmContract()

// testRecordPutTx()

// testRecordGetTx()

