import { ParameterType } from './../smartcontract/abi/parameter';
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
import {Parameter,  ParameterType } from '../smartcontract/abi/parameter'
import InvokeCode from './payload/invokeCode'
import DeployCode from './payload/deployCode'
import {Transaction, TxType, Sig, Fee} from './transaction'
import {Transfers, Contract, State} from '../smartcontract/token'
import {TransactionAttribute, TransactionAttributeUsage} from './txAttribute'
import * as core from '../core'
import { ab2hexstring, axiosPost, str2hexstr, hexstr2str , reverseHex, num2hexstring, str2VarBytes, hex2VarBytes, num2VarInt} from '../utils'
import json from '../smartcontract/data/idContract.abi'
import {ERROR_CODE} from '../error'
import { reverse } from 'dns';
import {TOKEN_TYPE, HTTP_REST_PORT, TEST_NODE, REST_API} from '../consts'
import { VmCode, VmType } from './vmcode';
import * as cryptoJS from 'crypto-js'
import opcode from './opcode';
import {BigNumber} from 'bignumber.js'
import {SignatureScheme, PrivateKey, KeyType, CurveLabel, KeyParameters} from '../crypto';
import { PublicKey } from '../crypto/PublicKey';
import { Address } from '../crypto/address';

const WebSocket = require('ws');


const abiInfo = AbiInfo.parseJson(JSON.stringify(json))


export const Default_params = {
    "Action": "sendrawtransaction",
    "Version": "1.0.0",
    "Type": "",
    "Op": "test"
}


const ONT_CONTRACT = "ff00000000000000000000000000000000000001"
export const makeTransferTransaction = (tokenType:string, from : Address, to : Address, value : string,  privateKey : PrivateKey)=> {
    let state = new State()
    state.from = from
    state.to = to

    //multi 10^8 to keep precision
    let valueToSend = new BigNumber(Number(value)).toString()

    state.value = valueToSend
    let transfer = new Transfers()
    transfer.states = [state]

    let contract = new Contract()
    contract.address = ONT_CONTRACT
    contract.method = 'transfer'
    contract.args = transfer.serialize()
    
    let tx = new Transaction()
    tx.version = 0x00
    tx.type = TxType.Invoke
    
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

/**
 * Signs the transaction object.
 * 
 * If the signature schema is not provided, default schema for Private key type is used.
 * 
 * @param tx Transaction to sign
 * @param privateKey Private key to sign with
 * @param schema Signature Schema to use
 */
export const signTransaction = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const publicKey = privateKey.getPublicKey();

    if (schema === undefined) {
        schema = privateKey.algorithm.defaultSchema;
    }

    const signature = privateKey.sign(tx.getHash(), schema);
    let sig = new Sig()
    sig.M = 1   
    sig.pubKeys = [publicKey]
    sig.sigData = [signature.serializeHex()]
    tx.sigs = [sig]
}

/**
 * 
 * @param tx 
 * @param pris 
 * @param schema 
 */
export const signTx = (tx: Transaction, pris: PrivateKey[][], schema?: SignatureScheme) => {
    let sigs = new Array<Sig>(pris.length)
    for(let i = 0; i< pris.length; i++) {
        sigs[i] = new Sig()
        sigs[i].M = 0;
        sigs[i].pubKeys = new Array<PublicKey>(pris[i].length)
        sigs[i].sigData = new Array<string>(pris[i].length)
        for (let j = 0; j < pris[i].length; j++) {
            sigs[i].M++
            const signature = pris[i][j].sign(tx.getHash(), schema)
            const publicKey = pris[i][j].getPublicKey()
            sigs[i].pubKeys[j] = publicKey
            sigs[i].sigData[j] = signature.serializeHex()
        }
    }
    tx.sigs = sigs
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
        result += num2hexstring(opcode.PUSHDATA1)
        result += num2hexstring(len)
    } 
    else if(len < 0x10000) {
        result += num2hexstring(opcode.PUSHDATA2)
        result += num2hexstring(len, 2, true)
    } else {
        result += num2hexstring(opcode.PUSHDATA4)
        result += num2hexstring(len, 4, true)
    }
    result += param
    return result
}


//params is like [param1, param2...]
export const buildSmartContractParam = (functionName : string, params : Array<Parameter>) => {
    let result = ''
    for (let i= params.length -1; i > -1; i--) {
        const type = params[i].getType()
        switch (type) {
            case ParameterType.Boolean:
                result += pushBool(params[i].getValue())
                break;

            case ParameterType.Number:
                result += pushInt(params[i].getValue())
                break;

            case ParameterType.String:
                let value = str2hexstr(params[i].getValue())
                result += pushHexString(value)
                break;

            case ParameterType.ByteArray:
                result += pushHexString(params[i].getValue())
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
    //to work with vm
    if (params.length === 0) {
        result += '00'
        params.length = 1
    }
    let paramsLen = num2hexstring(params.length + 0x50)
    result += paramsLen

    const paramsEnd = 'c1'
    result += paramsEnd

    result += hex2VarBytes(functionName)

    return result
}

export const buildWasmContractParam = (params : Array<Parameter>) => {
    let pList = new Array()
    for(let p of params) {
        let type = p.getType()
        let o
        switch (type) {
            case ParameterType.String:
                o = {
                    type: 'string',
                    value: p.getValue()
                }
                break;
            case ParameterType.Int:
                o = {
                    type : 'int',
                    value : p.getValue().toString()
                }
                break;
            case ParameterType.Long:
                o = {
                    type : 'int64',
                    value : p.getValue()
                }
                break;
            case ParameterType.IntArray:
                o = {
                    type : 'int_array',
                    value : p.getValue()
                }
                break;
            case ParameterType.LongArray:
                o = {
                    type : 'int_array',
                    value : p.getValue()
                }
                break;
            default:
                break;
        }
        pList.push(o)
    }
    let result = {
        "Params" : pList
    }
    return str2hexstr(JSON.stringify(result))
}

export const buildNativeContractParam = (params : Array<Parameter>) => {
    let result = ''
    for( let p of params) {
        const type = p.getType()
        switch (type) {
            case ParameterType.ByteArray:
                result += hex2VarBytes(p.value);
            break;
            case ParameterType.Int:
                result += p.value;
            default:
                break;
        }
    }

    return result
}

export const makeInvokeCode = (funcName : string,  params : Array<Parameter>, codeHash : string, vmType : VmType = VmType.NEOVM) => {
    let invokeCode = new InvokeCode()
    let vmCode = new VmCode()
    const funcNameHex = str2hexstr(funcName)
    if(vmType === VmType.NEOVM) {
        let args = buildSmartContractParam(funcNameHex, params)
        let contract = new Contract()
        contract.address = codeHash
        contract.args = args
        contract.method = ''
        let code = contract.serialize()
        code = num2hexstring(opcode.APPCALL) + code

        vmCode.code = code
        vmCode.vmType = vmType
    } else if(vmType === VmType.WASMVM) {
        let args = buildWasmContractParam(params)
        let contract = new Contract()
        contract.version = '01'
        contract.address = codeHash
        contract.method = funcName
        contract.args = args
        let code = contract.serialize()

        vmCode.code = code
        vmCode.vmType = vmType
    } else if(vmType === VmType.NativeVM) {
        let args = buildNativeContractParam(params)
        let contract = new Contract()
        contract.address = codeHash
        contract.args = args
        contract.method = funcName
        let code = contract.serialize()
        vmCode.code = code
        vmCode.vmType = vmType
    }
    
    invokeCode.code = vmCode
    return invokeCode
}

export const makeInvokeTransaction = (funcName : string, parameters : Array<Parameter>, scriptHash : string, vmType : VmType = VmType.NEOVM) => {
    let tx = new Transaction()
    tx.type = TxType.Invoke
    tx.version = 0x00

    // let scriptHash = abiInfo.getHash()
    if(scriptHash.substr(0,2) === '0x'){
        scriptHash = scriptHash.substring(2)
        scriptHash = reverseHex(scriptHash)
    }
    console.log('codehash: '+scriptHash)

    let payload = makeInvokeCode(funcName, parameters, scriptHash, vmType)

    tx.payload = payload

    //sig
    // if(privateKey) {
    //     signTransaction(tx, privateKey)
    // }

    return tx
}


// 
export function makeDeployCodeTransaction(code : string, vmType: VmType = VmType.NEOVM, name : string='' , codeVersion : string='1.0', author : string='', 
email : string='', desp:string='', needStorage : boolean=true) {
    let dc = new DeployCode()
    dc.author = author 
    let vmCode = new VmCode()
    vmCode.code = code
    vmCode.vmType = vmType
    dc.code = vmCode
    dc.version = codeVersion
    dc.description = desp
    dc.email = email
    dc.name = name
    dc.needStorage =needStorage

    let tx = new Transaction()
    tx.version = 0x00

    tx.payload = dc

    tx.type = TxType.Deploy

    //program
    // signTransaction(tx, privateKey)

    return tx

}

export function buildTxParam (tx : Transaction, is_pre_exec : boolean = false) {
    let op = is_pre_exec ? { 'PreExec':"1"} : {}
    let serialized = tx.serialize()
    return JSON.stringify(Object.assign({}, Default_params, { Data: serialized }, op))
}

//{"jsonrpc": "2.0", "method": "sendrawtransaction", "params": ["raw transactioin in hex"], "id": 0}
export function buildRpcParam(tx : any, method ?: string) {
    let param = tx.serialize()
    let result = {
        "jsonrpc": "2.0",
        "method": method || "sendrawtransaction",
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

export function sendRawTxRestfulUrl(url : string, preExec : boolean = false) {
    if(url.charAt(url.length - 1) === '/') {
        url = url.substring(0, url.length-1)
    }
    let restUrl = url + REST_API.sendRawTx
    if(preExec) {
        restUrl += '?preExec=1'
    }
    return restUrl
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

/**
 * @deprecated Use NotifyEvent.deserialize() instead.
 */
export function parseEventNotify(res : any)  {
    //parse state
    for(let r of res.Result) {
        let states = r.States
        let parsedStates = []
        if (states && states.length > 0) {
            for (let s of states) {
                parsedStates.push(hexstr2str(s))
            }
        }
        r.States = parsedStates
    }
    return res
}