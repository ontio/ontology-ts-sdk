/* 
@codeHash : Unit160
@code : byte
@programHash : Unit160
*/
import Payload from './payload'
import Parameter from '../../Abi/parameter'
import { num2VarInt, num2hexstring, StringReader, str2hexstr, hexstr2str } from '../../utils'

export default class InvokeCode extends Payload {
    //the length is of bytes 20
    scriptHash : string
    parameters : Array<Parameter> = []
    functionName : string

    constructor() {
        super()
    }

    serialize() : string {
        let payloadLength 
        let paramsLength = num2hexstring( 0x50 + this.parameters.length) //start from '0x50'
        const paramsEnd = 'c1'
        let funcNameHex = str2hexstr(this.functionName)  
        const funcNameLength = num2hexstring(funcNameHex.length/2) 
       
        //parameters
        let params = this.parameters.map((p)=>{
            let hexP = p.getValue()
            let hexPLength = num2hexstring( hexP.length/2) 
            return {
                hexPLength,
                hexP
            }
        })
        let result = ''
        //scripthash
        // result += this.scriptHash
        //params
        for(let v of params) {
            result += v.hexPLength
            result += v.hexP
        }
        result += paramsLength
        //end
        result += paramsEnd
        //function
        result += funcNameLength
        result += funcNameHex
        let totalParamsLength = num2VarInt(result.length / 2)
        result = this.scriptHash + totalParamsLength + result
        return result
    }

    deserialize(ss : StringReader) : void {
        //scriptHash, fixed langth
        this.scriptHash = ss.read(20)
        //payload total lenght
        const payloadLen = ss.readNextLen()
        
        //read params start
        let params = []
        let nextByte = ss.readNextLen()
        //params's length start from 0x50
        while(nextByte < 0x50) {
            let p = ss.read(nextByte)
            params.push(p)
            nextByte = ss.readNextLen()
        }
        //params end
        let end = ss.read(1)
        console.log('end :' + end)
        if(end === 'c1') {
            for(let i=0; i< params.length; i++) {
                //TODO can only get value
                this.parameters.push(new Parameter('','',params[i]))
            }
        }
        //function name
        let funNameLen = ss.readNextLen()
        let func = ss.read(funNameLen)
        func = hexstr2str(func)
        //payload end
        this.functionName = func

    }

}
