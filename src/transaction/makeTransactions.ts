import AbiFunction from "../Abi/AbiFunction";
import InvokeCode from './InvokeCode'
import TransactionAttribute from './txAttribute'
import Transaction from './transaction'
import {createSignatureScript, getHash } from '../core'
import Parameter from '../Abi/parameter'
import Program from './Program'
import * as core from '../core'
import { ab2hexstring } from '../utils'

export const makeInvokeTransaction = (scriptHash : string, func : AbiFunction, privateKey : string) => {
    let publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    let tx = new Transaction()
    tx.type = 0xd1
    tx.version = 0x00

    let payload = new InvokeCode()
    if(scriptHash.startsWith('0x')){
        scriptHash = scriptHash.substring(2)
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