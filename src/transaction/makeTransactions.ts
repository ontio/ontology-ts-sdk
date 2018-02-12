import AbiFunction from "../Abi/AbiFunction";
import InvokeCode from './InvokeCode'
import TransactionAttribute from './txAttribute'
import Transaction from './transaction'
import {createSignatureScript, getHash } from '../core'
import Parameter from '../Abi/parameter'
import Program from './Program'

export const makeInvokeTransaction = (scriptHash : string, func : AbiFunction) => {
    let tx = (<any>{})
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

    return new Transaction(tx)
}

export const deserializeDDO = (hexstr : string) => {
    
}