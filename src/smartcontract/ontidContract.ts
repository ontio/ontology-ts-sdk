
import AbiInfo from '../smartcontract/abi/abiInfo'
import AbiFunction from "../smartcontract/abi/abiFunction";
import { Parameter, ParameterType } from '../smartcontract/abi/parameter'

import {TEST_ONT_URL} from '../consts'
import { sendRawTxRestfulUrl } from '../transaction/transactionBuilder';
import axios from 'axios'
import * as core from '../core'
import {ab2hexstring, str2hexstr} from '../utils'
import {Transaction} from '../transaction/transaction'
import {makeInvokeTransaction} from '../transaction/transactionBuilder'
 
import abiJson from '../smartcontract/data/IdContract.abi'
const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson))


export function getPublicKeyStatus(ontid : string, pkId : string, url ?: string) {
    url = url || TEST_ONT_URL.REST_URL
    let requestUrl = sendRawTxRestfulUrl(url, true)
    let param = ''
    return axios.post(url, param).then(res => {
        return res.data
    })
}

export function buildGetPublicKeyStatusTx(ontid : string, pkId : string) {

}

export function buildRegisterOntidTx(ontid: string, privateKey: string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    if (ontid.substr(0, 3) == 'did') {
        ontid = str2hexstr(ontid)
    }
    console.log("Register ", ontid)
    let f = abiInfo.getFunction('RegIdWithPublicKey')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, ontid)


    let name2 = f.parameters[1].getName(),
        type2 = ParameterType.ByteArray
    //algorithm&curve
    publicKey = '1202' + publicKey

    let p2 = new Parameter(name2, type2, publicKey)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)

    return tx
}

//all parameters shuld be hex string
export function buildAddAttributeTx(path: string, value: string, type: string, ontid: string, privateKey: string) {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    //algorithm&curve
    publicKey = '1202' + publicKey
    let f = abiInfo.getFunction('AddAttribute')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, path)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, type)
    let p4 = new Parameter(f.parameters[3].getName(), ParameterType.ByteArray, value)
    let p5 = new Parameter(f.parameters[4].getName(), ParameterType.ByteArray, publicKey)

    f.setParamsValue(p1, p2, p3, p4, p5)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}

export function buildGetDDOTx(ontid: string) {
    let f = abiInfo.getFunction('GetDDO')
    if (ontid.substr(0, 3) == 'did') {
        ontid = str2hexstr(ontid)
    }

    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let nonce = ab2hexstring(core.generateRandomArray(10))
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, nonce)
    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f, abiInfo.getHash())

    return tx
}

export function buildAddPKTx(ontid : string, newPk : string, sender : string, privateKey : string) {
    let f = abiInfo.getFunction('AddKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    newPk = '1202' + newPk
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newPk)
    sender = '1202' + sender
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}

export function buildGetPublicKeysTx(ontid : string, privateKey : string) {
    let f = abiInfo.getFunction('GetPublicKeys')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}

export function buildRemovePkTx(ontid : string, pk2Remove : string, sender : string, privateKey : string) {
    let f = abiInfo.getFunction('RemoveKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    pk2Remove = '1202' + pk2Remove
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk2Remove)
    sender = '1202' + sender
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}

export function buildAddRecoveryTx(ontid : string, recovery : string, publicKey : string, privateKey : string) {
    let f = abiInfo.getFunction('AddRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, recovery)
    publicKey = '1202' + publicKey
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}

export function buildChangeRecoveryTx(ontid : string, newrecovery : string, oldrecovery : string, privateKey : string) {
    let f = abiInfo.getFunction('ChangeRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newrecovery)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, oldrecovery)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f, abiInfo.getHash(), privateKey)
    return tx
}