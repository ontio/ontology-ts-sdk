import Transaction, {TxType} from '../src/transaction/transaction'
import DeployCode from '../src/transaction/payload/DeployCode'

import {getHash} from '../src/core'
import {ab2hexstring, ab2str,str2hexstr , reverseHex} from '../src/utils'
import {Default_params, parseEventNotify, makeInvokeTransaction, makeDeployTransaction, buildTxParam} from '../src/transaction/makeTransactions'
import FunctionCode  from '../src/transaction/FunctionCode';
import  { ContractParameterType } from '../src/transaction/FunctionCode';
import AbiInfo from '../src/Abi/AbiInfo'
import AbiFunction from '../src/Abi/AbiFunction'
import Parameter from '../src/Abi/parameter'
import { tx_url, socket_url , ONT_NETWORK} from '../src/consts'

import TxSender from '../src/transaction/TxSender'

import json from '../src/smartcontract/data/IdContract.abi'

var fs = require('fs')
let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract_v0.2.avm')
var code = ab2hexstring(avm)
var codehash = getHash(code)
console.log('code hash: '+codehash)

var privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
var ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'


// var contract = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/IdContract.abi.json')

// console.log('contract: '+contract)
// var abiInfo = AbiInfo.parseJson(contract.toString())
var abiInfo = AbiInfo.parseJson(JSON.stringify(json))

var serialized

const WebSocket = require('ws');

var txSender = new TxSender(ONT_NETWORK.TEST)


const testDeployCodeTx = () => {
    var fc = new FunctionCode()
    fc.code = code
    fc.parameterTypes = [ContractParameterType.String, ContractParameterType.Array]
    fc.returnType = ContractParameterType.Array

    var dc = new DeployCode()
    dc.author = 'mickey10'
    dc.code = fc
    dc.codeVersion = '1.0'
    dc.description = 'test'
    dc.email = ''
    dc.name = 'test'
    dc.needStorage = true
    dc.vmType = 0

    var tx = makeDeployTransaction(dc, privateKey)
    
    var param = buildTxParam(tx)

    const callback =  function(res, socket) {
        console.log('send tx response: ' + JSON.stringify(res))
        socket.close()
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