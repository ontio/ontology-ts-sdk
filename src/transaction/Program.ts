import {num2VarInt, num2hexstring, StringReader, hex2VarBytes} from '../utils'
import OPCODE from './opcode'

export default class Program {
    code : string // signed data
    parameter : string // encoded public key
    constructor() {
    }

    serialize() : string {
        let result = ''
        let sigLen = num2VarInt( this.code.length/ 2 )
        let sigTotal = sigLen + this.code 
        let sigTotalLen = sigTotal.length / 2
        result += num2VarInt(sigTotalLen)
        result += sigTotal

        const opcode = OPCODE.CHECKSIG

        let pkLen = num2VarInt(this.parameter.length / 2 )
        let pkTotal = pkLen + this.parameter + opcode.toString(16)
        let pkTotalLen = pkTotal.length / 2
        result += num2VarInt(pkTotalLen)
        result += pkTotal
        // let result = ''
        // result += hex2VarBytes(this.parameter)
        // result += hex2VarBytes(this.code)

        return result
    }

    static deserialize(ss : StringReader) : Program {
        let p = new Program()
        const sigTotalLen = ss.readNextLen()
        const sigLen = ss.readNextLen()
        const sig = ss.read(sigLen)

        const pkTotalLen = ss.readNextLen()
        const pkLen = ss.readNextLen()
        const pk = ss.read(pkLen)
        p.code = sig
        p.parameter = pk
        return p
    }
}
