
import Payload from './payload'
import FunctionCode from '../FunctionCode'
import {LangType} from '../../smartcontract/types'
import {VmType} from '../vmcode'
import {str2VarBytes, hex2VarBytes, num2VarInt, bool2VarByte, StringReader, hexstr2str, num2hexstring} from '../../utils'

export default class DeployCode extends Payload {
    //hex string
    code : string
    //hex string
    vmType : VmType
    needStorage : boolean
    name : string
    version : string
    author : string
    email : string
    description : string

    constructor() {
        super()
    }


    serialize() : string {
        let result = ''
        result += num2hexstring(this.vmType)

        result += hex2VarBytes(this.code)

        result += bool2VarByte(this.needStorage)

        result += str2VarBytes(this.name)

        result += str2VarBytes(this.version)

        result += str2VarBytes(this.author)

        result += str2VarBytes(this.email)

        result += str2VarBytes(this.description)

        return result
    }

    deserialize(sr : StringReader) : void {

        const vmType = sr.readNextLen()
        this.vmType = vmType

        const code = sr.readNextBytes()
        this.code = code

        const boolValue = sr.read(1)
        this.needStorage = boolValue == '00'? false : true

        const name = sr.readNextBytes()
        this.name = hexstr2str(name)

        const codeVersion = sr.readNextBytes()
        this.version = hexstr2str(codeVersion)

        const author = sr.readNextBytes()
        this.author = hexstr2str(author)

        const email = sr.readNextBytes()
        this.email = hexstr2str(email)

        const description = sr.readNextBytes()
        this.description = hexstr2str(description)
    }
}