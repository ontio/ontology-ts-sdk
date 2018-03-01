import AbiInfo from '../Abi/AbiInfo'
import AbiFunction from "../Abi/AbiFunction";
import Parameter from '../Abi/parameter'
import InvokeCode from './payload/InvokeCode'
import TransactionAttribute from './txAttribute'
import Transaction from './transaction'
import {DDO} from './DDO'
import {createSignatureScript, getHash } from '../core'
import Program from './Program'
import * as core from '../core'
import { ab2hexstring, axiosPost, str2hexstr, hexstr2str , reverseHex} from '../utils'
import json2 from '../smartcontract/data/NeoContract2.abi'
import {ERROR_CODE} from '../error'
import { reverse } from 'dns';
const abiInfo = AbiInfo.parseJson(JSON.stringify(json2))

export const Default_params = {
    "Action": "sendrawtransaction",
    "Version": "1.0.0",
    "Type": "",
    "Op": "test"
}
export const socket_url = 'ws://192.168.3.128:20335'

export const net_url = 'http://192.168.3.128:20335/api/v1/transaction'

export const makeInvokeTransaction = (scriptHash : string, func : AbiFunction, privateKey : string) => {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    let tx = new Transaction()
    tx.type = 0xd1
    tx.version = 0x00

    let payload = new InvokeCode()
    if(scriptHash.startsWith('0x')){
        // scriptHash = scriptHash.substring(2)
        scriptHash = reverseHex(scriptHash.substring(2))
    }
    payload.scriptHash = scriptHash 
    payload.parameters = func.parameters
    payload.functionName = func.name
    tx.payload = payload

    let attr = new TransactionAttribute()
    let hash = ''
    //get publicKey
    let parameter = func.getParameter('pk')
    //compute signature with pk
    if(parameter) {
        let signatureScript = createSignatureScript(parameter.getValue())
        hash = getHash(signatureScript)
    }

    attr.usage = 0x20
    attr.data = hash
    tx.txAttributes = [attr]

    //program
    let unsignedData = tx.serializeUnsignedData()
    let program = new Program()
    let signed = core.signatureData(unsignedData, privateKey)
    program.code = signed
    program.parameter = publicKey
    tx.programs = [program]

    return tx
}

export function buildAddAttributeTxParam (path : string, value : string, ontid : string, privateKey : string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    let f = abiInfo.getFunction('AddAttribute')
    let p1 = new Parameter('id', 'ByteArray', ontid)
    let p2 = new Parameter('path', 'ByteArray', str2hexstr(path))
    let p3 = new Parameter('type', 'ByteArray', str2hexstr('String'))
    let p4 = new Parameter('value', 'ByteArray', str2hexstr(value))
    let p5 = new Parameter('pk', 'ByteArray', publicKey)

    f.setParamsValue(p1, p2, p3, p4, p5)
    let tx = makeInvokeTransaction(abiInfo.hash, f, privateKey)

    let serialized = tx.serialize()
    // console.log('addAddribute tx: ' + serialized)

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))
    return param
}

export function buildRegisterOntidTx (ontid: string,  privateKey: string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    
    let f = abiInfo.getFunction('RegIdByPublicKey')

    let p1 = new Parameter('id', 'ByteArray', str2hexstr(ontid))
    let p2 = new Parameter('pk', 'ByteArray', publicKey)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(abiInfo.hash, f, privateKey)

    let serialized = tx.serialize()
    console.log('register tx: ' + serialized)

    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))

    return param
}

export function buildGetDDOTx(ontid : string, privateKey : string) {
    let f = abiInfo.getFunction('GetDDO')

    let p1 = new Parameter('id', 'ByteArray', str2hexstr(ontid))
    f.setParamsValue(p1)

    let tx = makeInvokeTransaction(abiInfo.hash, f, privateKey)

    let serialized = tx.serialize()
    let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized, Op: "PreExec" }))
    return param
}

export function check(params:type) {
    
}

export function checkOntidOnChain(ontid: string, privateKey: string) {
   let param = buildGetDDOTx(ontid, privateKey)

    return axiosPost(net_url, param).then((res:any) => {
        let result = JSON.parse(res)
        if(result.Error == ERROR_CODE.SUCCESS) {
            let ddo = DDO.deserialize(result.Result[0])
            if(ddo.publicKeys && ddo.publicKeys.length > 0) {
                return ERROR_CODE.SUCCESS
            }
        } else {
            return  Promise.reject(result.ERROR)
        }
    }, (err:any) => {
        return Promise.reject(err)
    })
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