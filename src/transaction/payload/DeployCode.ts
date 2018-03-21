
import Payload from './payload'
import FunctionCode from '../FunctionCode'
import {LangType, VmType} from '../../smartcontract/types'
import {str2VarBytes, hex2VarBytes, num2VarInt, bool2VarByte, StringReader, hexstr2str} from '../../utils'

export default class DeployCode extends Payload {
    code : FunctionCode
    //hex string
    vmType : VmType
    needStorage : boolean
    name : string
    codeVersion : string
    author : string
    email : string
    description : string

    constructor() {
        super()
    }


    serialize() : string {
        let result = ''
        result += this.code.serialize()
        result += num2VarInt(this.vmType)

        result += bool2VarByte(this.needStorage)

        result += str2VarBytes(this.name)

        result += str2VarBytes(this.codeVersion)

        result += str2VarBytes(this.author)

        result += str2VarBytes(this.email)

        result += str2VarBytes(this.description)

        return result
    }

    deserialize(sr : StringReader) : void {

        let fc = FunctionCode.deserialize(sr)
        this.code = fc

        const vmType = sr.readNextLen()
        this.vmType = vmType

        const boolValue = sr.read(1)
        this.needStorage = boolValue == '00'? false : true

        const name = sr.readNextBytes()
        this.name = hexstr2str(name)

        const codeVersion = sr.readNextBytes()
        this.codeVersion = hexstr2str(codeVersion)

        const author = sr.readNextBytes()
        this.author = hexstr2str(author)

        const email = sr.readNextBytes()
        this.email = hexstr2str(email)

        const description = sr.readNextBytes()
        this.description = hexstr2str(description)
    }
}