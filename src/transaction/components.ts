import { num2hexstring, num2VarInt, reverseHex, Fixed8 } from '../utils'

/**
 * @typedef TransactionInput
 * @property {string} prevHash - Transaction hash, Uint256
 * @property {number} prevIndex - Index of the coin in the previous transaction, Uint16
 */


/**
 * Serializes a TransactionInput.
 * @param {TransactionInput} input
 * @return {string}
 */
export const serializeTransactionInput = (input) => {
    return reverseHex(input.prevHash) + reverseHex(num2hexstring(input.prevIndex, 2))
}

/**
 * Deserializes a stream of hexstring into a TransactionInput.
 * @param {StringStream} stream
 * @return {TransactionInput}
 */
export const deserializeTransactionInput = (stream) => {
    const prevHash = reverseHex(stream.read(32))
    const prevIndex = parseInt(reverseHex(stream.read(2)), 16)
    return { prevHash, prevIndex }
}

/**
 * @typedef TransactionOutput
 * @property {string} assetId - assetId, Uint256
 * @property {number|Fixed8} value - value of output, Fixed8
 * @property {string} scriptHash - Uint160
 */
export const TransactionOutput = (input) => {
    return {
        assetId: input.assetId,
        value: new Fixed8(input.value),
        scriptHash: input.scriptHash
    }
}
/**
 * Serializes a TransactionOutput.
 * @param {TransactionOutput} output
 * @return {string}
 */
export const serializeTransactionOutput = (output) => {
    const value = new Fixed8(output.value).toReverseHex()
    return reverseHex(output.assetId) + value + reverseHex(output.scriptHash)
}

/**
 * Deserializes a stream into a TransactionOutput.
 * @param {StringStream} stream
 * @return {TransactionOutput}
 */
export const deserializeTransactionOutput = (stream) => {
    const assetId = reverseHex(stream.read(32))
    const value = Fixed8.fromReverseHex(stream.read(8))
    const scriptHash = reverseHex(stream.read(20))
    return { assetId, value, scriptHash }
}


/**
 * @typedef BalanceInput
 * @property {string} assetId - assetId, Uint256
 * @property {number|Fixed8} value - value of output, Fixed8
 * @property {string} scriptHash - Uint160
 */
export const BalanceInput = (input) => {
    return {
        assetId: input.assetId,
        value: new Fixed8(input.value),
        scriptHash: input.scriptHash
    }
}
/**
 * Serializes a BalanceInput.
 * @param {BalanceInput} output
 * @return {string}
 */
export const serializeBalanceInput = (output) => {
    const value = new Fixed8(output.value).toReverseHex()
    return reverseHex(output.assetId) + value + reverseHex(output.scriptHash)
}

/**
 * Deserializes a stream into a BalanceInput.
 * @param {StringStream} stream
 * @return {BalanceInput}
 */
export const deserializeBalanceInput = (stream) => {
    const assetId = reverseHex(stream.read(32))
    const value = Fixed8.fromReverseHex(stream.read(8))
    const scriptHash = reverseHex(stream.read(20))
    return { assetId, value, scriptHash }
}

/**
 * @typedef TransactionAttribute
 * @property {number} usage - Identifying byte
 * @property {string} data - Data
 */
const maxTransactionAttributeSize = 65535

/**
 * Serializes a TransactionAttribute.
 * @param {TransactionAttribute} attr
 * @return {string}
 */
export const serializeTransactionAttribute = (attr) => {
    if (attr.data.length > maxTransactionAttributeSize) throw new Error()
    let out = num2hexstring(attr.usage)
    if (attr.usage === 0x81) {
        out += num2hexstring(attr.data.length / 2)
    } else if (attr.usage === 0x90 || attr.usage >= 0xf0) {
        out += num2VarInt(attr.data.length / 2)
    }
    if (attr.usage === 0x02 || attr.usage === 0x03) {
        out += attr.data.substr(2, 64)
    } else {
        out += attr.data
    }
    return out
}

/**
 * Deserializes a stream into a TransactionAttribute
 * @param {StringStream} stream
 * @return {TransactionAttribute}
 */
export const deserializeTransactionAttribute = (stream) => {
    const attr = {
        usage: parseInt(stream.read(1), 16)
    }
    if (attr.usage === 0x00 || attr.usage === 0x30 || (attr.usage >= 0xa1 && attr.usage <= 0xaf)) {
        attr.data = stream.read(32)
    } else if (attr.usage === 0x02 || attr.usage === 0x03) {
        attr.data = num2hexstring(attr.usage) + stream.read(32)
    } else if (attr.usage === 0x20) {
        attr.data = stream.read(20)
    } else if (attr.usage === 0x81) {
        attr.data = stream.read(parseInt(stream.read(1), 16))
    } else if (attr.usage === 0x90 || attr.usage >= 0xf0) {
        attr.data = stream.readVarBytes()
    } else {
        throw new Error()
    }
    return attr
}

/**
 * @typedef Program
 * @property {string} code - This data is stored as is (Little Endian)
 * @property {string} parameter - This data is stored as is (Little Endian)
 */
export class Program {
    constructor(public code:string, public parameter:string){
        this.code = code
        this.parameter = parameter
    }
}

export const serializeProgram = (program:Program) => {
    const codeLength = num2VarInt(program.code.length / 2)
    const parameterLength = num2VarInt(program.parameter.length / 2)
    return codeLength + program.code + parameterLength + program.parameter
}

export const deserializeProgram = (stream) => {
    const code = stream.readVarBytes()
    const parameter = stream.readVarBytes()
    return new Program( code, parameter )
}


/* 
@codeHash : Unit160
@code : byte
@programHash : Unit160
*/
export class InvokeCode {
    constructor(public codeHash : string, public code : string, public programHash : string){
    }
}

export const serializePayload = (payload) => {
    const codeHash = reverseHex(payload.codeHash)
    const codeLength = reverseHex(payload.length / 2)
    const programHash = reverseHex(payload.programHash)
    return codeHash + codeLength + payload.code + programHash
}

export const deserializePayload = (stream) => {
    const codeHash = reverseHex(stream.read(20))
    const code = stream.readVarBytes()
    const programHash = reverseHex(stream.read(20))
    return new InvokeCode( codeHash, code, programHash )
}