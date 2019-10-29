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
import { ab2hexstring, hexstring2ab, reverseHex, StringReader } from '../utils';
import BigInt from './bigInt';

const I128_SIZE = 16;

// little endian i128
export class I128 {
    static deserialize(sr: StringReader) {
        const result = new I128();
        const hex = sr.read(I128_SIZE);
        const v = hexstring2ab(hex);
        result.value = v;
        return result;
    }

    value: number[] = new Array(I128_SIZE).fill(0);

    constructor(value?: number[]) {
        if (value && value.length !== I128_SIZE) {
            throw new Error(`Invalid value: ${value} for I128.`);
        }
        if (value) {
            this.value = value;
        }
    }

    // little endian
    compareTo(o: I128) {
        const x = this.value;
        const y = o.value;
        for (let i = I128_SIZE - 1; i >= 0; i--) {
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
        return hex;
    }

}

// little endian u128
export class U128 {
    static deserialize(sr: StringReader) {
        const result = new U128();
        const hex = sr.read(I128_SIZE);
        const v = hexstring2ab(hex);

        result.value = v;
        return result;
    }

    value: number[] = new Array(I128_SIZE).fill(0);

    constructor(value?: number[]) {
        if (value && value.length !== I128_SIZE) {
            throw new Error(`Invalid value: ${value} for U128.`);
        }
        if (value) {
            this.value = value;
        }
    }

    // little endian
    compareTo(o: U128) {
        const x = this.value;
        const y = o.value;
        for (let i = I128_SIZE - 1; i >= 0; i--) {
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
        return hex;
    }

    toBigInt(): BigInt {
        const hex = ab2hexstring(this.value);
        const buf = reverseHex(hex);
        return BigInt.fromHexstr(buf);
    }

    toI128(): I128 {
        return new I128(this.value);
    }

}

export function oneBits128() {
    const val = [];
    for (let i = 0; i < I128_SIZE; i++) {
        val[i] = 255;
    }
    const i128 = new I128(val);
    return i128;
}

export function bigPow(a: number, b: number): BigNumber {
    return new BigNumber(a).pow(b);
}

export const pow128 = bigPow(2, 128);

export const maxBigU128 = bigPow(2, 128).minus(1);

export const maxI128 = bigPow(2, 127).minus(1);

export const minI128 = bigPow(2, 127).negated();

export function I128FromInt(val: number) {
    let i128 = new I128();
    if (val < 0) {
        i128 = oneBits128();
    }
    putUint64(i128.value, val);
    return i128;
}

export function I128FromBigInt(val: string) {
    let valBN = new BigNumber(val);
    if (valBN.isGreaterThan(maxI128) || valBN.isLessThan(minI128)) {
        throw new Error('The value is out of I128 range');
    }

    if (valBN.isLessThan(0)) {
        valBN = valBN.plus(pow128);
    }
    const size = I128_SIZE * 2;
    let hexstring = valBN.toString(16);
    hexstring = hexstring.length % size === 0 ? hexstring : ('0'.repeat(size) + hexstring).substring(hexstring.length);
    hexstring = reverseHex(hexstring);
    const bufRArray = hexstring2ab(hexstring);

    const i128 = new I128();
    const value = new Array(I128_SIZE).fill(0);
    for (let i = 0; i < bufRArray.length; i++) {
        value[i] = bufRArray[i];
    }
    i128.value = value;
    return i128;
}

export function putUint64(value: number[], val: number) {
    value[0] = val & 0xFF;
    val = val >> 8;
    value[1] = val & 0xFF;
    val = val >> 8;
    value[2] = val & 0xFF;
    val = val >> 8;
    value[3] = val & 0xFF;
    val = val >> 8;
    value[4] = val & 0xFF;
    val = val >> 8;
    value[5] = val & 0xFF;
    val = val >> 8;
    value[6] = val & 0xFF;
    val = val >> 8;
    value[7] = val & 0xFF;
}
