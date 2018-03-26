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

import AbiInfo from '../smartcontract/abi/abiInfo'
import AbiFunction from "../smartcontract/abi/abiFunction";
import Parameter from '../smartcontract/abi/parameter'
import InvokeCode from './payload/invokeCode'
import DeployCode from './payload/deployCode'
import {Transaction, TxType, Sig, PubKey} from './transaction'
import {Transfers, Contract, State} from '../smartcontract/token'
import {TransactionAttribute, TransactionAttributeUsage} from './txAttribute'
import {createSignatureScript, getHash } from '../core'
import * as core from '../core'
import { ab2hexstring, axiosPost, str2hexstr, hexstr2str , reverseHex, num2hexstring, str2VarBytes, hex2VarBytes, num2VarInt} from '../utils'
import json from '../smartcontract/data/IdContract.abi'
import {ERROR_CODE} from '../error'
import { reverse } from 'dns';
import {tx_url, socket_url, TOKEN_TYPE} from '../consts'
import axios from 'axios'
import { VmCode, VmType } from './vmcode';
import * as cryptoJS from 'crypto-js'
import opcode from './opcode';

const WebSocket = require('ws');


const abiInfo = AbiInfo.parseJson(JSON.stringify(json))


export const Default_params = {
    "Action": "sendrawtransaction",
    "Version": "1.0.0",
    "Type": "",
    "Op": "test"
}
// export const socket_url = 'ws://192.168.3.128:20335'
// export const net_url = 'http://192.168.3.128:20335/api/v1/transaction'

const ONT_CONTRACT = "ff00000000000000000000000000000000000001"
export const makeTransferTransaction = (tokenType:string, from : string, to : string, value : string,  privateKey : string)=> {
    let state = new State()
    state.from = from
    state.to = to
    state.value = value
    let transfer = new Transfers()
    transfer.states = [state]

    let contract = new Contract()
    contract.address = ONT_CONTRACT
    contract.method = 'transfer'
    contract.args = transfer.serialize()
    
    let tx = new Transaction()
    tx.version = 0x00
    tx.type = TxType.Invoke
    tx.nonce = ab2hexstring(core.generateRandomArray(4))
    
    //inovke
    let code = ''
    //TODO: change with token type
    
    code += contract.serialize()
    let vmcode = new VmCode()
    vmcode.code = code
    vmcode.vmType = VmType.NativeVM
    let invokeCode = new InvokeCode()
    invokeCode.code = vmcode
    tx.payload = invokeCode
    signTransaction(tx, privateKey)

    return tx
}

export const signTransaction = (tx : Transaction, privateKey : string) => {
    let pkPoint = core.getPublicKeyPoint(privateKey)
    
    let hash = tx.getHash()
    // var ProgramHexString = cryptoJS.enc.Hex.parse(SignatureScript);
    // var ProgramSha256 = cryptoJS.SHA256(hash).toString();

    let signed = core.signatureData(hash, privateKey)
    let sig = new Sig()
    sig.M = 1   
    sig.pubKeys = [new PubKey(pkPoint.x, pkPoint.y)]
    sig.sigData = [signed]

    tx.sigs = [sig]
}

export const pushBool = (param : boolean) => {
    let result = ''
    if(param) {
        result += opcode.PUSHT
    } else {
        result += opcode.PUSHF
    }
    return result
}

export const pushInt = (param : number) => {
    let result = ''
    if(param == -1) {
        result += opcode.PUSHM1
    }
    else if(param == 0) {
        result += opcode.PUSH0
    } 
    else if(param > 0 && param < 16) {
        let num = opcode.PUSH1 - 1 + param
        result += num2hexstring(num)
    }  
    else {
        result += num2VarInt(param)
    } 
    return result
}

export const pushHexString = (param : string) => {
    let result = ''
    let len = param.length/2
    if(len < opcode.PUSHBYTES75) {
        result += num2hexstring(len)
    } 
    else if(len < 0x100) {
        result += opcode.PUSHDATA1
        result += num2hexstring(len)
    } 
    else if(len < 0x10000) {
        result += opcode.PUSHDATA2
        result += num2hexstring(len, 2, true)
    } else {
        result += opcode.PUSHDATA4
        result += num2hexstring(len, 4, true)
    }
    result += hex2VarBytes(param)
    return result
}


//params is like [functionName, param1, param2...]
export const buildSmartContractParam = (params : [any]) => {
    let result = ''
    for (let i= params.length -1; i > -1; i--) {
        const type = Object.prototype.toString.call(params[i])
        switch (type) {
            case "[object Boolean]":
                result += pushBool(params[i])
                break;

            case "[object Number]":
                result += pushInt(params[i])
                break;

            case "[object String]":
                result += pushHexString(params[i])
                break;

            /* case "[object Object]":
                let temp = []
                let keys = Object.keys(params[i])
                for(let k of keys) {
                    temp.push( params[i][k])
                }
                result += buildSmartContractParam(temp)
                break; */
        
            default:
                throw new Error('Unsupported param type: '+params[i])
        }
    }

    return result
}

export const makeInvokeCode = (params : [any], codeHash : string, vmType : VmType = VmType.NativeVM) => {
    let invokeCode = new InvokeCode()
    let vmCode = new VmCode()
    let code = buildSmartContractParam(params)
    code += opcode.APPCALL
    code += hex2VarBytes(codeHash)
    vmCode.code = code
    vmCode.vmType = vmType

    invokeCode.code = vmCode
    return invokeCode
}


export const makeInvokeTransaction = (func : AbiFunction, privateKey : string) => {
    let tx = new Transaction()
    tx.type = TxType.Invoke
    tx.version = 0x00
    tx.nonce = ab2hexstring(core.generateRandomArray(4))

    let scriptHash = abiInfo.getHash()
    if(scriptHash.substr(0,2) === '0x'){
        scriptHash = scriptHash.substring(2)
        scriptHash = reverseHex(scriptHash)
    }
    console.log('codehash: '+scriptHash)

    let params = []
    params.push(func.name)
    for(let v of func.parameters) {
        params.push(v.getValue())
    }

    let payload = makeInvokeCode(param, scriptHash)

    tx.payload = payload

    //sig
    signTransaction(tx, privateKey)

    return tx
}


// TODO need update
export function makeDeployCode(avmcode : string, obj : any) {
    let dc = new DeployCode()
    dc.author = obj.author || ''
    dc.code = avmcode
    dc.version = obj.version || '1.0'
    dc.description = obj.description || ''
    dc.email = obj.email || ''
    dc.name = obj.name || ''
    dc.needStorage = obj.needStorage || true
    dc.vmType = obj.vmType || VmType.NativeVM
    return dc
}

export function makeDeployTransaction (avmcode : string, deployObj : any, privateKey : string) {
    let tx = new Transaction()
    tx.version = 0x00

    let deployCode = makeDeployCode(avmcode, deployObj)
    tx.payload = deployCode
    
    tx.type = TxType.Deploy
    tx.nonce = ab2hexstring(core.generateRandomArray(4))

    //program
    signTransaction(tx, privateKey)
    
    return tx
}

export function buildTxParam (tx : Transaction, is_pre_exec : boolean = false) {
    let op = is_pre_exec ? { Op:'PreExec'} : {}
    let serialized = tx.serialize()
    return JSON.stringify(Object.assign({}, Default_params, { Data: serialized }, op))
}

//all parameters shuld be hex string
export function buildAddAttributeTx (path : string, value : string, ontid : string, privateKey : string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    let f = abiInfo.getFunction('AddAttribute')
    if(ontid.substr(0,3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), 'ByteArray', ontid)
    let p2 = new Parameter(f.parameters[1].getName(), 'ByteArray', path)
    let p3 = new Parameter(f.parameters[2].getName(), 'ByteArray', str2hexstr('String'))
    let p4 = new Parameter(f.parameters[3].getName(), 'ByteArray', value)
    let p5 = new Parameter(f.parameters[4].getName(), 'ByteArray', publicKey)

    f.setParamsValue(p1, p2, p3, p4, p5)
    let tx = makeInvokeTransaction( f, privateKey)
    return tx
}

export function buildRegisterOntidTx (ontid: string,  privateKey: string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    if (ontid.substr(0, 3) == 'did') {
        ontid = str2hexstr(ontid)
    }
    console.log("Register ", ontid)
    let f = abiInfo.getFunction('RegIdWithPublicKey')

    let name1 = f.parameters[0].getName(),
        type1 = f.parameters[0].getType()
    let p1 = new Parameter(name1, type1, ontid)


    let name2 = f.parameters[1].getName(),
        type2 = f.parameters[1].getType()
    let p2 = new Parameter(name2, type2, publicKey)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction( f, privateKey)

    return tx
}

export function buildGetDDOTx(ontid : string, privateKey : string) {
    let f = abiInfo.getFunction('GetDDO')
    if (ontid.substr(0, 3) == 'did') {
        ontid = str2hexstr(ontid)
    }

    let p1 = new Parameter(f.parameters[0].getName(), 'ByteArray', ontid)
    let nonce = ab2hexstring( core.generateRandomArray(10) )
    let p2 = new Parameter(f.parameters[1].getName(), 'ByteArray', nonce)
    f.setParamsValue(p1,p2)
    let tx = makeInvokeTransaction( f, privateKey)
    
    return tx
}
//{"jsonrpc": "2.0", "method": "sendrawtransaction", "params": ["raw transactioin in hex"], "id": 0}
export function buildRpcParam(tx : any) {
    let param = tx.serialize()
    let result = {
        "jsonrpc": "2.0",
        "method": "sendrawtransaction",
        "params": [param],
        "id": 10
    }
    return result
}

export function buildRestfulParam(tx : any) {
    let param = tx.serialize()
    return {
        "Action" : "sendrawtransaction",
        "Version" : "1.0.0",
        "Data" : param
    }
}



export function registerOntid(ontid : string, privateKey : string, callback : (result:any)=>{}) {
    let param = buildRegisterOntidTx(ontid, privateKey)
    //TODO websocket work with browser and node
    const socket = new WebSocket(socket_url)
    socket.onopen = () => {
        console.log('connected')
        socket.send(param)
    }
    socket.onmessage = (event:any) => {
        let res
        if (typeof event.data === 'string') {
            res = JSON.parse(event.data)
        }
        console.log('response for send tx: ' + JSON.stringify(res))

        if (res.Action === 'Notify') {
            let parsedRes = parseEventNotify(res)
            console.log('paresed event notify: ' + JSON.stringify(parsedRes))
            if (parsedRes.Error == 0 && parsedRes.Result.BlockHeight) {
                let result = {
                    error: ERROR_CODE.SUCCESS,
                    desc : parsedRes.Result
                }
                callback(result)
            } else {
                let errResult = {
                    error: parsedRes.Error,
                    desc: parsedRes.Result
                }
                callback(errResult)
            }

            socket.close()
        }
    }
    socket.onerror = (event: any) => {
        //no server or server is stopped
        let errResult = {
            error: event.data
        }
        callback(errResult)
        console.log(event)
        socket.close()
    }
}
/* {
    "Action": "Notify",
        "Desc": "SUCCESS",
            "Error": 0,
                "Result": {
        "Container": "ea02f7d3c828c79c65c198e016554d6c8ea7a7502dc164d649afe2c0059aa2b1",
            "CodeHash": "8665eebe481029ea4e1fcf32aad2edbbf1728beb",
                "State": [{
                    "Value": [{
                        "Value": "417474726962757465"
                    }, {
                        "Value": "757064617465"
                    }, {
                        "Value": "6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b"
                    }, {
                        "Value": "436c616d3a74776974746572"
                    }]
                }],
                    "BlockHeight": 37566
    },
    "Version": "1.0.0"
} */
const enum EventType {
    Attribute = 'Attribute',
    Register = 'Register',
    PublicKey = 'PublicKey'
}
export function parseEventNotify(result : any)  {
    //parse state
    let state = result.Result.State[0].Value
    let parsedState = <any>{}
    const type = hexstr2str(state[0].Value)
    parsedState.type = type
    parsedState.op = hexstr2str(state[1].Value)
    parsedState.id = hexstr2str(state[2].Value)
    if(type === EventType.Attribute && state.length == 4) {
        parsedState.attribute = hexstr2str(state[3].Value)
    } else if(type === EventType.PublicKey && state.length == 4) {
        parsedState.pubkey = hexstr2str(state[3].Value)
    }
    result.Result.State = parsedState
    return result
}