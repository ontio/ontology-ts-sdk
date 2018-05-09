import { VmType } from './../transaction/vmcode';

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


export function buildRegisterOntidTx(ontid: string, publicKey: PublicKey) {
    if (ontid.substr(0, 3) == 'did') {
        ontid = str2hexstr(ontid)
    }
    console.log("Register ", ontid)
    let f = abiInfo.getFunction('regIDWithPublicKey')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, ontid)

    let name2 = f.parameters[1].getName(),
        type2 = ParameterType.ByteArray

    let p2 = new Parameter(name2, type2, publicKey.serializeHex())

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.hash, VmType.NativeVM)
    return tx
}

/**
 * 
 * @param ontid user's ONT ID
 * @param attributes user's serialized attributes
 * @param publicKey user's public key
 */
export function buildRegIdWithAttributes(ontid : string, attributes : string, publicKey : PublicKey) {
    let f = abiInfo.getFunction('regIDWithAttributes')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, publicKey)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, attributes)
    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)

    return tx    
}

/**
 * 
 * @param path key of the attribute, hex string
 * @param value value of the attribute, hex string
 * @param type type of the attribute, hex string
 * @param ontid user's ONT ID
 * @param privateKey use to sign transaction
 */
export function buildAddAttributeTx(key: string, value: string, type: string, ontid: string, publicKey: PublicKey) {    
    let f = abiInfo.getFunction('addAttribute')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, key)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, type)
    let p4 = new Parameter(f.parameters[3].getName(), ParameterType.ByteArray, value)
    let p5 = new Parameter(f.parameters[4].getName(), ParameterType.ByteArray, publicKey.serializeHex())

    f.setParamsValue(p1, p2, p3, p4, p5)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}

/**
 * @param ontid user's ONT ID
 * @param key key of attribute to be remove
 * @param publicKey user's publicKey
 */
export function buildRemoveAttributeTx(ontid : string, key : string, publicKey : PublicKey) {
    let f = abiInfo.getFunction('addAttribute')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, key)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex())
    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
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

/**
 * @param ontid user's ONT ID
 * @param newPk new public key to be added
 * @param publicKey user's public key
 */
export function buildAddControlKeyTx(ontid : string, newPk : PublicKey,  publicKey : PublicKey) {
    let f = abiInfo.getFunction('addKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newPk.serializeHex())
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}

/**
 * 
 * @param ontid user's ONT ID
 * @param pk2Remove public key to be removed
 * @param sender user's public key 
 */
export function buildRemoveControlKeyTx(ontid : string, pk2Remove : PublicKey, sender : PublicKey) {
    let f = abiInfo.getFunction('removeKey')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk2Remove.serializeHex())
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}

export function buildGetPublicKeysTx(ontid: string, publicKey: PublicKey) {
    let f = abiInfo.getFunction('GetPublicKeys')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}

/**
 * 
 * @param ontid user's ONT ID
 * @param recovery recovery address, must have not be set
 * @param publicKey user's public key, must be user's existing public key
 */
export function buildAddRecoveryTx(ontid : string, recovery : string, publicKey : PublicKey) {
    let f = abiInfo.getFunction('addRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, recovery)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex())

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}

/**
 * 
 * @param ontid user's ONT ID
 * @param newrecovery new recovery address
 * @param oldrecovery original recoevery address
 * @param privateKey use to sign transaction
 */
export function buildChangeRecoveryTx(ontid : string, newrecovery : string, oldrecovery : string) {
    let f = abiInfo.getFunction('changeRecovery')
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid)
    }
    let p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid)
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newrecovery)
    let p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, oldrecovery)

    f.setParamsValue(p1, p2, p3)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
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
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
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
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM)
    return tx
}