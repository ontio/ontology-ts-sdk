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

import {ab2hexstring, hexstring2ab, num2VarInt, hex2VarBytes, StringReader} from '../utils'

const UINT256SIZE = 32
export default class Uint256 {
    value : Uint8Array

    //lettle endian
    compareTo( o : Uint256) {
        let x = this.value
        let y = o.value
        for(let i=UINT256SIZE -1; i >=0; i--) {
            if(x[i] > y[i]) {
                return 1
            }
            if(x[i] < y[i]) {
                return -1
            }
        }
        return 0
    }

    serialize() {
        const hex = ab2hexstring(this.value)
        return hex2VarBytes(hex)
    }

    static deserialize(sr:StringReader) {
        let result = new Uint256()
        const hex = sr.readNextBytes()
        let v = hexstring2ab(hex)
        //little endian
        v = v.reverse()
        let value = new Uint8Array(v)
        result.value = value
        return result
    }
}