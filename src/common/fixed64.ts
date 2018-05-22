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

import { BigNumber } from 'bignumber.js';
import { hexstr2str, reverseHex, str2hexstr, StringReader } from '../utils';

const Fixed64Size = 8;
export default class Fixed64 {
    static deserialize(sr: StringReader) {
        const f = new Fixed64();
        let v = sr.read(8);
        // f.value = hexstr2str(v)
        v = reverseHex(v);
        f.value = new BigNumber(v).toString();
        return f;
    }

    // 8 bytes
    value: string;
    constructor(value?: string) {
        // if(value && value.length !== 16) {
        //     throw new Error('Invalid value.')
        // }
        this.value = value || '0000000000000000';
    }

    serialize() {
        // return str2hexstr(this.value)
        let hexstring = new BigNumber(this.value).toString(16);
        const size = Fixed64Size * 2;

        hexstring = hexstring.length % size === 0
            ? hexstring
            : ('0'.repeat(size) + hexstring).substring(hexstring.length);

        hexstring = reverseHex(hexstring);
        return hexstring;
    }
}
