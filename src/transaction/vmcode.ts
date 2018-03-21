import { num2hexstring, StringReader, num2VarInt, ab2hexstring, hex2VarBytes } from '../utils'

export enum VmType {
    NativeVM = 0xFF,
    NEOVM    = 0x80,
    WASMVM   = 0x90
}

export class VmCode {
    vmType : VmType
    code : string

    serialize() {
        let result = ''
        result += num2hexstring(this.vmType)
        result += hex2VarBytes(this.code)
        return result
    }

    static deserialize(sr : StringReader) : any {
        let vmcode = new VmCode()
        let type = parseInt(sr.read(1), 16)
        let code = sr.readNextBytes()
        vmcode.vmType = type
        vmcode.code = code
        return vmcode
    }


}