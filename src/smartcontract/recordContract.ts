
import AbiInfo from '../smartcontract/abi/abiInfo'
import AbiFunction from "../smartcontract/abi/abiFunction";
import { Parameter, ParameterType } from '../smartcontract/abi/parameter'

import abiJson from '../smartcontract/data/recordContract'
import { str2hexstr } from '../utils';
import { sendRawTxRestfulUrl, signTransaction, makeInvokeTransaction } from '../transaction/transactionBuilder';

const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson))

export function buildRecordPutTx(key : string, value : string) {
    let f = abiInfo.getFunction('Put')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, str2hexstr(key))


    let name2 = f.parameters[1].getName(),
        type2 = ParameterType.ByteArray

    let p2 = new Parameter(name2, type2, str2hexstr(value))

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    return tx
}

export function buildRecordGetTx(key: string) {
    let f = abiInfo.getFunction('Get')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, str2hexstr(key))


    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    return tx
}