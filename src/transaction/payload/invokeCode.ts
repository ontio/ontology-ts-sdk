/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */
import { hex2VarBytes, StringReader } from '../../utils';
import Payload from './payload';

export default class InvokeCode extends Payload {
    // the length is of bytes 20
    /*
    scriptHash : string
    parameters : Array<Parameter> = []
    functionName : string
     */

    /**
     * Hex encoed string
     */
    code: string;

    constructor() {
        super();
        // this.gasLimit = new Fixed64()
    }

/*     serialize() : string {
        let payloadLength
        let paramsLength = num2hexstring( 0x50 + this.parameters.length) //start from '0x50'
        const paramsEnd = 'c1'
        let funcNameHex = str2hexstr(this.functionName)
        const funcNameLength = num2hexstring(funcNameHex.length/2)

        let params = []
        for(let i = this.parameters.length-1; i > -1; i--) {
            let p = this.parameters[i]
            let hexP = p.getValue()
            let hexPLength = num2VarInt( hexP.length / 2)
            let opcode = ''
            if( hexP.length/2 < OPCODE.PUSHBYTES75) {

            } else if (hexP.length / 2 < 0x100) {
                opcode = num2VarInt( OPCODE.PUSHDATA1 )
            } else if( hexP.length/2 < 0x1000 ) {
                opcode = num2hexstring( OPCODE.PUSHDATA2, 2, true)
            } else {
                opcode = num2hexstring( OPCODE.PUSHDATA4, 4, true)
            }
            params.push ({
                hexPLength,
                hexP,
                opcode
            })
        }

        let result = ''
        //scripthash
        // result += this.scriptHash
        //params
        for(let v of params) {
            if(v.opcode) {
                result += v.opcode
            }
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
        //result = this.scriptHash + totalParamsLength + result

        console.log('invode serialze: '+ result)

        return result
    }  */

    serialize() {
        let result = '';
        // if(this.gasLimit) {
        //     result += this.gasLimit.serialize()
        // }
        // result += this.code.serialize();
        result += hex2VarBytes(this.code);
        return result;
    }

    /* deserialize(ss : StringReader) : void {
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

    }  */

    deserialize(sr: StringReader) {
        // let gasLimit = Fixed64.deserialize(sr);
        // const code = VmCode.deserialize(sr);
        const code = sr.readNextBytes();
        // this.gasLimit = gasLimit;
        this.code = code;
        return this;
    }
}
