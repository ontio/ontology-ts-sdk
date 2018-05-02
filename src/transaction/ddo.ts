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
import {PublicKey} from '../crypto'

/**
 * Public key representation with recorded id from blockchain.
 * 
 */
export class PublicKeyWithId extends PublicKey {
    /**
     * Id of the public key.
     * 
     * Only numeric part is recorded. Full PublicKeyId will be constucted as follows:
     * <ONTID>#keys-<id>
     */
    id: number;

    constructor (key: PublicKey, id: number) {
        super(key.key, key.algorithm, key.parameters);   

        this.id = id;
    }
}

export class DDOAttribute {
    path : string
    type : string
    value : string
    constructor() {}
}
export class DDO {
    publicKeys : Array<PublicKeyWithId> = []
    attributes : Array<DDOAttribute> = []
    recovery : string

    constructor() {}

    static deserialize(hexstr: string): DDO {
        const ss = new StringReader(hexstr)
        let ddo = new DDO()
        //total length of public keys - 4 bytes
        const pkTotalLen = parseInt(ss.read(4),16)
        if(pkTotalLen > 0) {
            const pkNum = parseInt(ss.read(4), 16)
            for (let i = 0; i < pkNum; i++) {

                let pkIdLen = parseInt(ss.read(4), 16);
                const rawPkId = ss.read(pkIdLen);
                const pkId = parseInt(rawPkId, 16);
                
                //length of public key - 4 bytes
                let pkLen = parseInt(ss.read(4), 16)
                const rawPk = ss.read(pkLen);
                const pubKey = PublicKeyWithId.deserializeHex(new StringReader(rawPk), pkLen);
                const pubKeyWithId = new PublicKeyWithId(pubKey, pkId);
                ddo.publicKeys.push(pubKeyWithId);
            }
        }
        

        //attribute number - 4bytes
        const attrTotalLen = parseInt(ss.read(4),16)
        if(attrTotalLen > 0) {
            const attrNum = parseInt(ss.read(4), 16)
            for (let i = 0; i < attrNum; i++) {
                const totalLen = parseInt(ss.read(4), 16)

                let attr = new DDOAttribute()
                const pathLen = parseInt(ss.read(4), 16)
                attr.path = hexstr2str(ss.read(pathLen))

                const type_value_len = parseInt(ss.read(4), 16)
                const typeLen = parseInt(ss.read(1), 16)
                attr.type = hexstr2str(ss.read(typeLen))

                const valueLen = type_value_len - typeLen - 1
                attr.value = hexstr2str(ss.read(valueLen))
                ddo.attributes.push(attr)
            }
        }
        
        //recovery
        const recoveryTotalLen = parseInt(ss.read(4), 16)
        if(recoveryTotalLen > 0 ) {
            const recovery = ss.read(recoveryTotalLen)
            ddo.recovery = recovery
        }
        
        return ddo
    }
}