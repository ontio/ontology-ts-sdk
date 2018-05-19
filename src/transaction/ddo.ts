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

import {StringReader, hexstr2str, str2VarBytes} from '../utils'
import {PublicKey} from '../crypto'

/**
 * Public key representation with recorded id from blockchain.
 * 
 */
export class PublicKeyWithId {
    /**
     * Id of the public key.
     * 
     * Only numeric part is recorded. Full PublicKeyId will be constucted as follows:
     * <ONTID>#keys-<id>
     */
    id: number
    pk: PublicKey

    static deserialize(hexstr: string): Array<PublicKeyWithId> {
        const sr = new StringReader(hexstr)
        let result = new Array<PublicKeyWithId>()
        while (!sr.isEmpty()) {
            const index = sr.readUint32()
            const data = sr.readNextBytes()
            let p = new PublicKeyWithId()
            p.id = index
            p.pk = PublicKey.deserializeHex(new StringReader(data))
            result.push(p)
        }
        return result
    }
}

export class DDOAttribute {
    key : string
    type : string
    value : string
    constructor() {}

    serialize() : string {
        let result = ''
        result += str2VarBytes(this.key)
        result += str2VarBytes(this.type)
        result += str2VarBytes(this.value)
        return result
    }

    static deserialize(hexstr : string) {
        const sr = new StringReader(hexstr)
        let result = new Array<DDOAttribute>()
        while (!sr.isEmpty()) {
            const key = hexstr2str(sr.readNextBytes())
            const type = hexstr2str(sr.readNextBytes())
            const value = hexstr2str(sr.readNextBytes())
            let d = new DDOAttribute()
            d.key = key
            d.type = type
            d.value = value
            result.push(d)
        }
        return result
    }
}
export class DDO {
    publicKeys : Array<PublicKeyWithId> = []
    attributes : Array<DDOAttribute> = []
    recovery : string = ''

    constructor() {}

    static deserialize(hexstr: string): DDO {
        const ss = new StringReader(hexstr)
        let ddo = new DDO()
        const pkLen = ss.readNextLen()
        if(pkLen > 0) {
            ddo.publicKeys = PublicKeyWithId.deserialize(ss.read(pkLen))
        }

        const attrLen = ss.readNextLen()
        if(attrLen > 0) {
            ddo.attributes = DDOAttribute.deserialize(ss.read(attrLen))
        }

        const recoveryLen = ss.readNextLen()
        if(recoveryLen > 0) {
            ddo.recovery = ss.read(recoveryLen)
        }
        return ddo
    }
}