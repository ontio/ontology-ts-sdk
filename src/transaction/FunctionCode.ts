import {num2VarInt, num2hexstring, hex2VarBytes, StringReader} from '../utils'

export enum ContractParameterType {
    Signature  = 0      ,          
	Boolean             ,
	Integer             ,
	Hash160             ,
	Hash256             ,
	ByteArray           ,
	PublicKey           ,
	String              ,
	Object              ,
	Array = 0x10        , 
	Void = 0xff         
}

class FunctionCode {
    code : string

    parameterTypes : Array<ContractParameterType>

    returnType : ContractParameterType

    codeHash : string

    serialize() : string {
        let result = ''
    
        //code
        result += hex2VarBytes(this.code)

        //parameterTypes
        result += num2VarInt(this.parameterTypes.length)
        for( let v of this.parameterTypes) {
            result += num2VarInt(v)
        }

        //returnType
        result += num2VarInt(this.returnType)
    
        return result
    }

    static deserialize(sr : StringReader) {
        let fc = new FunctionCode()
        fc.code = sr.readNextBytes()
        
        const paramLen = sr.readNextLen()
        let parameterTypes = []
        for(let i=0; i< paramLen; i++) {
            parameterTypes.push(sr.readNextLen())
        }
        fc.parameterTypes = parameterTypes

        const returnType = sr.readNextLen()
        fc.returnType = returnType
        
        return fc
    }
}

export default FunctionCode