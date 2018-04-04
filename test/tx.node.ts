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

import { makeInvokeTransaction , parseEventNotify, buildAddAttributeTx, buildGetDDOTx,
    buildRpcParam, buildRegisterOntidTx, buildTxParam, buildRestfulParam, sendRawTxRestfulUrl } from '../src/transaction/transactionBuilder'
import {Transaction} from '../src/transaction/transaction'
import InvokeCode from '../src/transaction/payload/InvokeCode'
import { Identity } from '../src/identity'
import * as core from '../src/core'
import AbiInfo from '../src/smartcontract/abi/abiInfo'
import AbiFunction from '../src/smartcontract/abi/abiFunction'
import {Parameter, ParameterType } from '../src/smartcontract/abi/parameter'
import json2 from '../src/smartcontract/data/IdContract.abi'
import { ab2hexstring, str2hexstr, StringReader } from '../src/utils'
import { DEFAULT_ALGORITHM, ONT_NETWORK, TEST_NODE } from '../src/consts';
import { DDO } from '../src/transaction/ddo'
import { TEST_ONT_URL} from '../src/consts'
import { getHash } from '../src/core';
import TxSender from '../src/transaction/txSender'
import axios from 'axios'

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

var privateKey: string
var publicKey: string
var pk2: string
var ontid: string
var oldrecovery : string
var newrecovery : string

var abiInfo: AbiInfo
var identity: Identity

abiInfo = AbiInfo.parseJson(JSON.stringify(json2))
// privateKey = core.generatePrivateKeyStr()
// console.log('privatekey: ' + privateKey)
// console.log('publick key: ' + publicKey)

privateKey = '7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93'
publicKey = ab2hexstring(core.getPublicKey(privateKey, false))
let publicKey2 = ab2hexstring(core.getPublicKey(privateKey, true))

var pkPoint = core.getPublicKeyPoint(privateKey)
console.log('pk false: '+ publicKey)
console.log('pk true: ' + publicKey2)



// privateKey = 'cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406'
// ontid = '6469643a6f6e743a626f626162636465636465666768c'
ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJA'
pk2 = '035096277bd28ee25aad489a83ca91cfda1f59f2668f95869e3f7de0af0f07fc5c'

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

ontid = core.generateOntid(privateKey)
console.log('ontid: ' + ontid)

const sendTx = (param, callback = null) => {
    const socket = new WebSocket(TEST_ONT_URL.SOCKET_URL)
    socket.onopen = () => {
        console.log('connected')
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
    if (res.Action === 'Notify') {

        let result = parseEventNotify(res)
        console.log('paresed event notify: ' + JSON.stringify(result))
    }
    
}

const testDDOTx = () => {
    let tx = buildGetDDOTx(ontid)

    // let param = buildTxParam(tx, false)

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
    console.log('serialized: '+serialized)

    // let param = buildTxParam(tx)
    // console.log('param : '+param)
    // txSender.sendTxWithSocket(param, callback)

    let param = buildRestfulParam(tx)
    let url = TEST_ONT_URL.sendRawTxByRestful
    axios.post(url, param).then((res)=>{
        console.log(res.data)
    })
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
    console.log('privateKey: ' + privateKey)
    console.log('publick: '+publicKey)
    
    // let param = buildTxParam(tx)
    // console.log('param: '+JSON.stringify(param))
    // sendTx(param)
    let param = buildRestfulParam(tx)
    console.log('param: '+JSON.stringify(param))

    axios.post(TEST_ONT_URL.sendRawTxByRestful, param).then((res)=>{
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
}


const testAddPK = () => {
    let f = abiInfo.getFunction('AddKey')

    let p1 = new Parameter('id', ParameterType.ByteArray, ontid)
    let p2 = new Parameter('newpubkey', ParameterType.ByteArray, pk2)
    let p3 = new Parameter('sender', ParameterType.ByteArray, publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction( f, abiInfo.getHash(), privateKey)

    let serialized = tx.serialize()
    // console.log('add pk tx: ' + serialized)
    
    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('add pk param: ' + param)
    sendTx(param)
}

const testGetPublicKeys = () => {
    let f = abiInfo.getFunction('GetPublicKeys')
    let p1 = new Parameter('id', ParameterType.ByteArray, ontid)
    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(),privateKey)
    let serialized = tx.serialize()

    let param = JSON.stringify(Object.assign({}, Default_params, {Data : serialized}))
    sendTx(param)
}

const testRemovePK = () => {
    let f = abiInfo.getFunction('RemoveKey')

    let p1 = new Parameter('id', ParameterType.ByteArray, ontid)
    let p2 = new Parameter('oldpubkey', ParameterType.ByteArray, pk2)
    let p3 = new Parameter('sender', ParameterType.ByteArray, publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)

    let serialized = tx.serialize()

    // let hashed = core.getHash(serialized)
    // console.log('remove pk tx: ' + serialized)
    // console.log('hashed:' + hashed)
    
    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('remove pk param: ' + param)
    sendTx(param)
}

const testAddRecovery = () => {
    let f = abiInfo.getFunction('AddRecovery')

    let p1 = new Parameter('id', ParameterType.ByteArray, ontid)
    let p2 = new Parameter('recovery', ParameterType.ByteArray, oldrecovery)
    let p3 = new Parameter('pk', ParameterType.ByteArray, publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(),privateKey)

    let serialized = tx.serialize()

    // let hashed = core.getHash(serialized)
    // console.log('remove pk tx: ' + serialized)
    // console.log('hashed:' + hashed)

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('change recovery param: ' + param)
    sendTx(param)
}

const testChangeRecovery = () => {
    let f = abiInfo.getFunction('ChangeRecovery')

    let p1 = new Parameter('id', ParameterType.ByteArray, ontid)
    let p2 = new Parameter('newrecovery', ParameterType.ByteArray, newrecovery)
    let p3 = new Parameter('recovery', ParameterType.ByteArray, oldrecovery)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)

    let serialized = tx.serialize()

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('change recovery param: ' + param)
    sendTx(param)
}

const testVerifyOntidClaim = () => {
    var claim = {
        "Context": "claim:github_authentication",
        "Content": {
            "GistCreateTime": "2018-02-28T03:24:48Z",
            "Company": "onchain",
            "Email": "leewi9@yahoo.com",
            "Alias": "leewi9",
            "Bio": "software engineer",
            "Id": "10832544",
            "GistUrl": "https://gist.github.com/42298ebb0c44054c43f48e1afd763ff6",
            "Avatar": "https://avatars2.githubusercontent.com/u/10832544?v=4",
            "Name": "zhouzhou",
            "Location": ""
        },
        "Signature": {
            "Format": "pgp",
            "Value": "rsjaenrxJm8qDmhtOHNBNOCOlvz/GC1c6CMnUb7KOb1jmHbMNGB63VXhtKflwSggyu1cVBK14/0t7qELqIrNmQ==",
            "Algorithm": "ECDSAwithSHA256"
        },
        "Metadata": {
            "Issuer": "did:ont:TVuF6FH1PskzWJAFhWAFg17NSitMDEBNoK",
            "CreateTime": "2018-03-07T16:06:21Z",
            "Subject": "did:ont:TKhyXw8o6Em5GjmJwiPT1oNXsy4p6fYZPB"
        },
        "Id": "111ab2f56d106dac92e891b6f7fc4d9546fdf2eb94a364208fa65a9996b03ba0"
    }
    core.verifyOntidClaim(claim).then(res =>{
        console.log('verify result : '+ res)
    })
}


//uncomment one line to test one tx each time.

// testRegisterOntid()

// testAddAttribute()

testDDOTx()

// testVerifyOntidClaim()

// testDDOByRpc()

// testGetPublicKeys()

// testCheckOntid()

// testAddPK()

// testRemovePK()

// testAddRecovery()

// testChangeRecovery()


