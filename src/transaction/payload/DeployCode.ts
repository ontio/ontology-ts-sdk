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


import Payload from './payload'
import {VmType, VmCode} from '../vmcode'
import {str2VarBytes, hex2VarBytes, num2VarInt, bool2VarByte, StringReader, hexstr2str, num2hexstring} from '../../utils'

export default class DeployCode extends Payload {
    //hex string
    code : VmCode
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