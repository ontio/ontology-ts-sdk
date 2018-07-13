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

import { ab2hexstring, hex2VarBytes, hexstring2ab, StringReader } from '../utils';

const UINT160SIZE = 20;

export default class Uint160 {
    static deserialize(sr: StringReader) {
        const result = new Uint160();
        const hex = sr.readNextBytes();
        let v = hexstring2ab(hex);

        // little endian
        v = v.reverse();
        const value = new Uint8Array(v);
        result.value = value;
        return result;
    }

    value: Uint8Array;

    // little endian
    compareTo(o: Uint160) {
        const x = this.value;
        const y = o.value;
        for (let i = UINT160SIZE - 1; i >= 0; i--) {
            if (x[i] > y[i]) {
                return 1;
            }
            if (x[i] < y[i]) {
                return -1;
            }
        }
        return 0;
    }

    serialize() {
        const hex = ab2hexstring(this.value);
        return hex2VarBytes(hex);
    }
}
