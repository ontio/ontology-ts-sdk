import AbiInfo from '../Abi/AbiInfo'
import AbiFunction from "../Abi/AbiFunction";
import Parameter from '../Abi/parameter'
import InvokeCode from './payload/InvokeCode'
import DeployCode from './payload/DeployCode'
import FunctionCode from './FunctionCode'
import {Transaction, TxType, Sig, PubKey} from './transaction'
import {Transfers, TokenTransfer, State} from '../smartcontract/token'
import {TransactionAttribute, TransactionAttributeUsage} from './txAttribute'
import {DDO} from './DDO'
import {createSignatureScript, getHash } from '../core'
import Program from './Program'
import * as core from '../core'
import { ab2hexstring, axiosPost, str2hexstr, hexstr2str , reverseHex, num2hexstring, str2VarBytes} from '../utils'
import json from '../smartcontract/data/IdContract.abi'
import {ERROR_CODE} from '../error'
import { reverse } from 'dns';
import {tx_url, socket_url} from '../consts'
import axios from 'axios'
import { VmCode, VmType } from './vmcode';
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

const contract = "ff00000000000000000000000000000000000001"
export const makeTransferTransaction = (from : string, to : string, value : string,  privateKey : string)=> {
    let state = new State()
    state.from = from
    state.to = to
    state.value = value
    let tf = new TokenTransfer()
    tf.contract = contract
    tf.states = [state]
    let transfer = new Transfers()
    transfer.params = [tf]
    
    let tx = new Transaction()
    tx.version = 0x00
    tx.type = TxType.Invoke
    tx.nonce = ab2hexstring(core.generateRandomArray(4))
    
    //inovke
    let code = ''
    let flag = str2hexstr('Token.Common.Transfer')
    code += str2VarBytes(flag)
    code += transfer.serialize()
    let vmcode = new VmCode()
    vmcode.code = code
    vmcode.vmType = VmType.NativeVM
    let invokeCode = new InvokeCode()
    invokeCode.code = vmcode
    
    signTransaction(tx, privateKey)

    return tx
}

export const signTransaction = (tx : Transaction, privateKey : string) => {
    let pkPoint = core.getPublicKeyPoint(privateKey)
    
    let hash = tx.getHash()
    let signed = core.signatureData(hash, privateKey)
    let sig = new Sig()
    sig.M = 1
    sig.pubKeys = [new PubKey(pkPoint.x, pkPoint.y)]
    sig.sigData = [signed]

    tx.sigs = [sig]
}


export const makeInvokeTransaction = (func : AbiFunction, privateKey : string) => {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    let pkPoint = core.getPublicKeyPoint(privateKey)
    let tx = new Transaction()
    tx.type = TxType.Invoke
    tx.version = 0x00

    tx.nonce = ab2hexstring(core.generateRandomArray(4))

    let payload = new InvokeCode()
    let scriptHash = abiInfo.getHash()
    if(scriptHash.substr(0,2) === '0x'){
        scriptHash = scriptHash.substring(2)
        scriptHash = reverseHex(scriptHash)
    }
    console.log('codehash: '+scriptHash)
    payload.scriptHash = scriptHash 
    payload.parameters = func.parameters
    payload.functionName = func.name
    tx.payload = payload

    let attr = new TransactionAttribute()
    let hash = ''
    // //get publicKey
    // let parameter = func.getParameter('publicKey')
    // //compute signature with pk
    // if(parameter) {
    //     let signatureScript = createSignatureScript(parameter.getValue())
    //     hash = getHash(signatureScript)
    // } else {
    //     console.log('No such parameter: publicKey');
    // }

    let signatureScript = createSignatureScript(publicKey)
    hash = getHash(signatureScript)

    attr.usage = 0x20
    attr.data = hash
    tx.txAttributes = [attr]

    //sig
    let unsignedData = tx.serializeUnsignedData()
    let sig = new Sig()
    let signed = core.signatureData(unsignedData, privateKey)
    sig.M = 1
    let pk = new PubKey(pkPoint.x, pkPoint.y)
    sig.pubKeys = [pk]
    sig.sigData = [signed]
    tx.sigs = [sig]

    return tx
}

export function makeFunctionCode(avmCode : string, parameterTypes:[any], returnType: any) {
    let fc = new FunctionCode()
    fc.code = avmCode
    fc.parameterTypes = parameterTypes || []
    fc.returnType = returnType || 0xff
    return fc
}

export function makeDeployCode(fc : FunctionCode, obj : any) {
    let dc = new DeployCode()
    dc.author = obj.author || ''
    dc.code = fc
    dc.codeVersion = obj.codeVersion || '1.0'
    dc.description = obj.description || ''
    dc.email = obj.email || ''
    dc.name = obj.name || ''
    dc.needStorage = obj.needStorage || true
    dc.vmType = obj.vmType || 0
    return dc
}

export function makeDeployTransaction (dc : DeployCode, privateKey : string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))

    let tx = new Transaction()
    tx.version = 0x00

    tx.payload = dc
    tx.type = TxType.DeployCode

    //program
    let unsignedData = tx.serializeUnsignedData()
    let program = new Program()
    let signed = core.signatureData(unsignedData, privateKey)
    program.code = signed
    program.parameter = publicKey
    tx.programs = [program]
    
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

//TODO : cors problem
export function checkOntid(ontid: string) {
   let param = buildRpcParam(ontid)
    console.log('param: '+JSON.stringify(param))
    return axios.post(tx_url, param).then((res:any) => {
        console.log('post response:'+JSON.stringify(res.data))

        if(typeof res == 'string') {
            res = JSON.parse(res)
        }
        res = res.data
        if(res.result == '01') {
            return ERROR_CODE.SUCCESS
        } else {
            return  Promise.reject(ERROR_CODE.UNKNOWN_ONTID)
        }
    }, (err:any) => {
        console.log('err:'+err)
        return Promise.reject(err)
    })
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