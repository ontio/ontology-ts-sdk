import { makeInvokeTransaction , parseEventNotify, checkOntid, buildAddAttributeTx, buildGetDDOTx,
    buildRpcParam, buildRegisterOntidTx, buildTxParam } from '../src/transaction/makeTransactions'
import Transaction from '../src/transaction/transaction'
import InvokeCode from '../src/transaction/payload/InvokeCode'
import Program from '../src/transaction/Program'
import { Identity } from '../src/identity'
import * as core from '../src/core'
import AbiInfo from '../src/Abi/AbiInfo'
import AbiFunction from '../src/Abi/AbiFunction'
import Parameter from '../src/Abi/parameter'
import json2 from '../src/smartcontract/data/IdContract.abi'
import { ab2hexstring, str2hexstr, StringReader } from '../src/utils'
import { DEFAULT_ALGORITHM, ONT_NETWORK } from '../src/consts';
import { DDO } from '../src/transaction/DDO'
import {tx_url, socket_url} from '../src/consts'
import { checkOntidOnChain, getHash } from '../src/core';
import TxSender from '../src/transaction/TxSender'
import axios from 'axios'

var txSender = new TxSender(ONT_NETWORK.TEST)

// const socket_url = 'ws://52.80.115.91:20335'
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
publicKey = ab2hexstring(core.getPublicKey(privateKey, true))


// privateKey = 'cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406'
// ontid = '6469643a6f6e743a626f626162636465636465666768c'
ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW'
pk2 = '035096277bd28ee25aad489a83ca91cfda1f59f2668f95869e3f7de0af0f07fc5c'

// recovery = ab2hexstring(core.generateRandomArray(20))

newrecovery = '8143c0070b7bea4895dbe9078abdf655047b5949'
oldrecovery = '8143c0070b7bea4895dbe9078abdf655047b5950'


var invoke = new InvokeCode();
var sr = new StringReader('5999efd79e56f5b4edc78ba2bafae3cd2c3bb68dfd030121023ed0ac36b2222e47f4997e58e420b6e29cf8b7f2d540fce9ec92ebbdf1c72cbe5e7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e34222c224f6e746964223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f44227d06537472696e6740623561383762656139326435323532356236656261336236373035393563663862396362623531653937326635636266663439396434383637376464656538612a6469643a6f6e743a544146593162684c446b685a706b4e47685335664775425935474c544d416256584e55c10c416464417474726962757465')
invoke.deserialize(sr)
console.log('invoke:'+JSON.stringify(invoke))

// identity = new Identity()
// identity.create(privateKey, '123456', 'mickey')
// ontid = str2hexstr(identity.ontid)

ontid = core.generateOntid(privateKey)
console.log('ontid: ' + ontid)

const sendTx = (param, callback = null) => {
    const socket = new WebSocket(socket_url)
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
    let tx = buildGetDDOTx(ontid, privateKey)

    let param = buildTxParam(tx, true)

    console.log('param: '+param)
    
    txSender.sendTxWithSocket(param, callback)
}

const testDDOByRpc = () => {
    let tx = buildGetDDOTx(ontid, privateKey)
    let param = buildRpcParam(tx)
    txSender.sendWithRpc(param).then( res => {
        console.log('rpc response: '+ JSON.stringify(res))
    })
}

const parseDDO = (result) => {
    let ddo = DDO.deserialize(result)
    console.log("parse DDO : " + JSON.stringify(ddo))
}

const testRegisterOntid = () => {
    let tx = buildRegisterOntidTx(str2hexstr(ontid), privateKey)
    let param = buildTxParam(tx)
    
    txSender.sendTxWithSocket(param, callback)
}

const testAddAttribute = () => {

    // var claimId = 'b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a',
    //     context = 'claim:staff_authentication8',
    //     issuer = 'did:ont:TVuF6FH1PskzWJAFhWAFg17NSitMDEBNoa'
    //     let path = claimId
    //     let type = str2hexstr('String')
    //     let data = {
    //         Context : context,
    //         Ontid : issuer
    //     }
    //     let value = JSON.stringify(data)
    //     value = str2hexstr(value)
    //     console.log('value: '+value.length)
        // let value = str2hexstr(issuer)
    
    let path = str2hexstr('Claim:twitter')
    // let type = str2hexstr('String')
    let value = str2hexstr('wang17@twitter')


    let tx = buildAddAttributeTx(path, value, ontid, privateKey )
    console.log('path: '+ path)
    console.log('value: ' + value)
    console.log('ontid: ' + ontid)
    console.log('type: '+ str2hexstr('String'))
    console.log('privateKey: ' + privateKey)
    console.log('publick: '+publicKey)
    
    let param = buildTxParam(tx)
    sendTx(param)
}


const testAddPK = () => {
    let f = abiInfo.getFunction('AddKey')

    let p1 = new Parameter('id', 'ByteArray', ontid)
    let p2 = new Parameter('newpubkey', 'ByteArray', pk2)
    let p3 = new Parameter('sender', 'ByteArray', publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction( f, privateKey)

    let serialized = tx.serialize()
    // console.log('add pk tx: ' + serialized)
    
    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('add pk param: ' + param)
    sendTx(param)
}

const testGetPublicKeys = () => {
    let f = abiInfo.getFunction('GetPublicKeys')
    let p1 = new Parameter('id', 'ByteArray', ontid)
    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f, privateKey)
    let serialized = tx.serialize()

    let param = JSON.stringify(Object.assign({}, Default_params, {Data : serialized}))
    sendTx(param)
}

const testRemovePK = () => {
    let f = abiInfo.getFunction('RemoveKey')

    let p1 = new Parameter('id', 'ByteArray', ontid)
    let p2 = new Parameter('oldpubkey', 'ByteArray', pk2)
    let p3 = new Parameter('sender', 'ByteArray', publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, privateKey)

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

    let p1 = new Parameter('id', 'ByteArray', ontid)
    let p2 = new Parameter('recovery', 'ByteArray', oldrecovery)
    let p3 = new Parameter('pk', 'ByteArray', publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, privateKey)

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

    let p1 = new Parameter('id', 'ByteArray', ontid)
    let p2 = new Parameter('newrecovery', 'ByteArray', newrecovery)
    let p3 = new Parameter('recovery', 'ByteArray', oldrecovery)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction( f, privateKey)

    let serialized = tx.serialize()

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    console.log('change recovery param: ' + param)
    sendTx(param)
}


const testCheckOntid = () => {
    checkOntid(ontid).then((res :any) => {
        console.log('checkontid res:'+res)
    }, (err:any)=>{
        console.log('checkontid err:'+err)
    })
    
}

//uncomment one line to test one tx each time.

// testRegisterOntid()

// testAddAttribute()

// testDDOTx()

testDDOByRpc()

// testGetPublicKeys()

// testCheckOntid()

// testAddPK()

// testRemovePK()

// testAddRecovery()

// testChangeRecovery()


