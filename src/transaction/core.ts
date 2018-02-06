import { num2VarInt, num2hexstring, StringStream, reverseHex, hash256, Fixed8 } from '../utils'
import * as comp from './components'
import  Transaction  from './transaction';

export function serializeTransaction(tx, signed = true): string {
    let out = ''
    out += num2hexstring(tx.type)
    out += num2hexstring(tx.version)
    // out += serializeExclusive[tx.type](tx)
    //serialize payload
    out += comp.serializePayload(tx.payload)
    out += num2VarInt(tx.txAttributes.length)
    for (const attribute of tx.txAttributes) {
        out += comp.serializeTransactionAttribute(attribute)
    }
    out += num2VarInt(tx.UTXOInputs.length)
    for (const input of tx.UTXOInputs) {
        out += comp.serializeTransactionInput(input)
    }
    out += num2VarInt(tx.outputs.length)
    for (const output of tx.outputs) {
        out += comp.serializeTransactionOutput(output)
    }
    out += num2VarInt(tx.balanceInputs.length)
    for (const balance of tx.balanceInputs) {
        out += comp.serializeBalanceInput(balance)
    }
    out += num2VarInt(tx.programs.length)
    for (const program of tx.programs) {
        out += comp.serializeProgram(program)
    }
    return out
}

/**
 * Deserializes a given string into a Transaction object
 * @param {string} data - Serialized string
 * @returns {Transaction} Transaction object
 */
export const deserializeTransaction = (data) => {
    const ss = new StringStream(data)
    let tx = {}
    tx.type = parseInt(ss.read(1), 16)
    tx.version = parseInt(ss.read(1), 16)
    // const exclusiveData = deserializeExclusive[tx.type](ss)
    tx.payload = comp.deserializePayload(ss)
    tx.txAttributes = []
    tx.UTXOInputs = []
    tx.outputs = []
    tx.programs = []
    const attrLength = ss.readVarInt()
    for (let i = 0; i < attrLength; i++) {
        tx.txAttributes.push(comp.deserializeTransactionAttribute(ss))
    }
    const inputLength = ss.readVarInt()
    for (let i = 0; i < inputLength; i++) {
        tx.UTXOInputs.push(comp.deserializeTransactionInput(ss))
    }
    const outputLength = ss.readVarInt()
    for (let i = 0; i < outputLength; i++) {
        tx.outputs.push(comp.deserializeTransactionOutput(ss))
    }
    const balanceInputsLength = ss.readVarInt()
    for (let i = 0; i < balanceInputsLength; i++) {
        tx.balanceInputsl.push(comp.deserializeBalanceInput(ss))
    }
    if (!ss.isEmpty()) {
        const scriptLength = ss.readVarInt()
        for (let i = 0; i < scriptLength; i++) {
            tx.programs.push(comp.deserializeProgram(ss))
        }
    }
    // return Object.assign(tx, exclusiveData)
    return new Transaction(tx)
}
