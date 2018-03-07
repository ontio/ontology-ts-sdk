import Transaction, {TxType} from '../src/transaction/transaction'
import DeployCode from '../src/transaction/payload/DeployCode'

import {getHash} from '../src/core'
import {ab2hexstring, ab2str,str2hexstr , reverseHex} from '../src/utils'
import {Default_params, parseEventNotify, makeInvokeTransaction} from '../src/transaction/makeTransactions'
import FunctionCode  from '../src/transaction/FunctionCode';
import  { ContractParameterType } from '../src/transaction/FunctionCode';
import AbiInfo from '../src/Abi/AbiInfo'
import AbiFunction from '../src/Abi/AbiFunction'
import Parameter from '../src/Abi/parameter'
import { tx_url, socket_url } from '../src/consts'

var fs = require('fs')
let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract_v0.2.avm')
var code = ab2hexstring(avm)
code = getHash(code)
console.log('code hash: '+code)

var privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
var ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'


var contract = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/ClearingContract.abi.json')
// console.log('contract: '+contract)
var abiInfo = AbiInfo.parseJson(contract.toString())

var serialized

const WebSocket = require('ws');

    var tx = new Transaction()
    var fc = new FunctionCode()
    fc.code = code
    fc.parameterTypes = [ContractParameterType.String, ContractParameterType.Array]
    fc.returnType = ContractParameterType.Array

    var dc = new DeployCode()
    dc.author = 'mickey2'
    dc.code = fc
    dc.codeVersion = '1.0'
    dc.description = 'test'
    dc.email = 'mickey@wang.com'
    dc.name = 'test'
    dc.needStorage = false
    dc.vmType = 0

    tx.type = TxType.DeployCode
    tx.payload = dc

const sendTx = (param, callback = null) => {
    const socket = new WebSocket(socket_url)
    socket.onopen = () => {
        console.log('connected')
        socket.send(param)
    }
    socket.onmessage = (event) => {
        let res
        if (typeof event.data === 'string') {
            res = JSON.parse(event.data)
        }
        console.log('response for send tx: ' + JSON.stringify(res))
        if (callback) {
            callback(event.data)
            socket.close()
        }
        if (res.Action === 'Notify') {
            let result = parseEventNotify(res)
            console.log('paresed event notify: ' + JSON.stringify(result))
        }
        // socket.close()
    }
    socket.onerror = (event) => {
        //no server or server is stopped
        console.log(event)
        socket.close()
    }
}

const buildDeployCodeTx = () => {
    
    serialized = tx.serialize()
    console.log('tx serialized: ' + serialized)
    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))

    return param
}

const testDeployCodeTx = () => {
    let param = buildDeployCodeTx()
    sendTx(param)
}

const testContractMehod = () => {
    let f = abiInfo.getFunction('Deposit')
    let p1 = new Parameter('ontid', 'ByteArray', ontid)
    let p2 = new Parameter('asset_id', 'ByteArray', str2hexstr('asset_id'))
    let p3 = new Parameter('amount', 'Integer', '1004')

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, privateKey)
    
    let serialized = tx.serialize()
    // console.log('addAddribute tx: ' + serialized)

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized, Op: "Exec" }))
    sendTx(param)
}

const testDeserialize = () => {
    let tx = Transaction.deserialize(serialized)
    console.log('deserialized: '+ JSON.stringify(tx))
}




// testDeployCodeTx()
// testDeserialize()

testContractMehod()

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