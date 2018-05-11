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
import { Parameter, ParameterType } from '../smartcontract/abi/parameter'

import {TEST_ONT_URL} from '../consts'
import { sendRawTxRestfulUrl, signTransaction, makeInvokeTransaction } from '../transaction/transactionBuilder';
import axios from 'axios'
import * as core from '../core'
import {ab2hexstring, str2hexstr} from '../utils'
import {Transaction} from '../transaction/transaction'
import { PrivateKey, PublicKey } from '../crypto'; 
import abiJson from '../smartcontract/data/idContract.abi'
const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson))


export function buildRegisterOntidTx(ontid: string, privateKey: PrivateKey) {
    const publicKey = privateKey.getPublicKey();
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

    let p2 = new Parameter(name2, type2, publicKey.serializeHex())

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.hash)
    signTransaction(tx, privateKey)

    return tx
}

//all parameters shuld be hex string
export function buildAddAttributeTx(path: string, value: string, type: string, ontid: string, privateKey: PrivateKey) {
    const publicKey = privateKey.getPublicKey();
    
    let f = abiInfo.getFunction('AddAttribute')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, path)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, type)
    let p4 = new Parameter(f.parameters[3].getName(), ParameterType.ByteArray, value)
    let p5 = new Parameter(f.parameters[4].getName(), ParameterType.ByteArray, publicKey.serializeHex())

    f.setParamsValue(p1, p2, p3, p4, p5)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
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
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())

    return tx
}

export function buildAddPKTx(ontid : string, newPk : PublicKey, sender : PublicKey, privateKey : PrivateKey) {
    let f = abiInfo.getFunction('AddKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newPk.serializeHex())
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildGetPublicKeysTx(ontid : string, privateKey : PrivateKey) {
    let f = abiInfo.getFunction('GetPublicKeys')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildRemovePkTx(ontid : string, pk2Remove : PublicKey, sender : PublicKey, privateKey : PrivateKey) {
    let f = abiInfo.getFunction('RemoveKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk2Remove.serializeHex())
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildAddRecoveryTx(ontid : string, recovery : string, publicKey : PublicKey, privateKey : PrivateKey) {
    let f = abiInfo.getFunction('AddRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, recovery)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildChangeRecoveryTx(ontid : string, newrecovery : string, oldrecovery : string, privateKey : PrivateKey) {
    let f = abiInfo.getFunction('ChangeRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newrecovery)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, oldrecovery)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildGetPublicKeyStatusTx(ontid: string, pkId: string) {
    let f = abiInfo.getFunction('GetPublicKeyStatus')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pkId)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    return tx
}

export function buildGetPublicKeyIdTx(ontid: string, pk: PublicKey) {
    let f = abiInfo.getFunction('GetPublicKeyId')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk.serializeHex())

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    return tx
}