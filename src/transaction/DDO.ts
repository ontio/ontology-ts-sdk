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

import {StringReader, hexstr2str} from '../utils'

export class DDOAttribute {
    path : string
    type : string
    value : string
    constructor() {}
}
export class DDO {
    publicKeys : Array<string> = []
    attributes : Array<DDOAttribute> = []

    constructor() {}

    static deserialize(hexstr : string) : DDO {
        const ss = new StringReader(hexstr)
        let ddo = new DDO()
        //total length of public keys - 4 bytes
        const pkTotalLen = parseInt(ss.read(4), 16)
        const pkNum = ss.readNextLen()
        
        for(let i=0; i<pkNum; i++) {   
            //length of public key - 4 bytes
            let pkLen = parseInt(ss.read(4),16) 
            ddo.publicKeys.push(ss.read(pkLen))
        }

        //attribute number - 4bytes
        const attrTotalLen = parseInt(ss.read(4),16)
        const attrNum = ss.readNextLen()
        for(let i=0; i<attrNum;i++) {
            let attrLen = parseInt(ss.read(4),16)
            let attr = new DDOAttribute()
            const pathLen = parseInt(ss.read(4), 16)
            attr.path = hexstr2str(ss.read(pathLen))

            const type_value_len = parseInt(ss.read(4), 16)
            const typeLen = parseInt(ss.read(1), 16)
            attr.type = hexstr2str(ss.read(typeLen))

            const valueLen = type_value_len - typeLen
            attr.value = hexstr2str(ss.read(valueLen))
            ddo.attributes.push(attr)
        }
        return ddo
    }
}