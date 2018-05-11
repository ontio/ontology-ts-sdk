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

 
import {str2hexstr, hexstr2str ,StringReader} from '../utils'
const Fixed64Len = 8
export default class Fixed64 {
    //8 bytes
    value : string
    constructor(value?:string) {
        if(value && value.length !== 16) {
            throw new Error('Invalid value.')
        }
        this.value = value || '0000000000000000'
    }

    serialize() {
        // return str2hexstr(this.value)
        return this.value
    }

    static deserialize(sr:StringReader) {
        let f = new Fixed64()
        const v = sr.read(8)
        // f.value = hexstr2str(v)
        f.value = v
        return f
    }
}