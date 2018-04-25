
import AbiInfo from '../smartcontract/abi/abiInfo'
import AbiFunction from "../smartcontract/abi/abiFunction";
import { Parameter, ParameterType } from '../smartcontract/abi/parameter'
import { Transaction } from '../transaction/transaction'


import abiJson from '../smartcontract/data/recordContract'
import { str2hexstr } from '../utils';
import { sendRawTxRestfulUrl, signTransaction, makeInvokeTransaction } from '../transaction/transactionBuilder';

const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson))

export function buildCommitRecordTx(claimId : string, issuer : string, privateKey : string) {
    let f = abiInfo.getFunction('Commit')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, str2hexstr(claimId))


    let name2 = f.parameters[1].getName(),
        type2 = ParameterType.ByteArray
    if (issuer.substr(0, 3) === 'did') {
        issuer = str2hexstr(issuer)
    }
    let p2 = new Parameter(name2, type2, issuer)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildRevokeRecordTx(claimId : string, revokerOntid : string, privateKey : string) {
    let f = abiInfo.getFunction('Revoke')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, str2hexstr(claimId))

    if (revokerOntid.substr(0, 3) === 'did') {
        revokerOntid = str2hexstr(revokerOntid)
    }
    let p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, revokerOntid)

    f.setParamsValue(p1, p2)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    signTransaction(tx, privateKey)
    return tx
}

export function buildGetRecordStatusTx(claimId: string) {
    let f = abiInfo.getFunction('GetStatus')

    let name1 = f.parameters[0].getName(),
        type1 = ParameterType.ByteArray
    let p1 = new Parameter(name1, type1, str2hexstr(claimId))

    f.setParamsValue(p1)
    let tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash())
    return tx
}
