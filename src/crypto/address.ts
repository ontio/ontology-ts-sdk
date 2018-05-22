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
import { ERROR_CODE } from '../error';
import { addressToU160, hash160, u160ToAddress } from '../helpers';
import { hex2VarBytes, num2hexstring } from '../utils';
import { PublicKey } from './PublicKey';

export class Address {
    static addressFromPubKey(publicKey: PublicKey): Address {
        let programHash = hash160(publicKey.serializeHex());
        programHash = '01' + programHash.substring(2);
        return new Address(programHash);
    }

    /**
     * (m,n) threshold address
     * @param m is the threshold
     * @param publicKeys total value n
     */
    static addressFromMultiPubKeys(m: number, publicKeys: PublicKey[]): Address {
        const n = publicKeys.length;

        if (m <= 0 || m > n || n > 24 ) {
            throw ERROR_CODE.INVALID_PARAMS;
        }

        const pkHexStrs = publicKeys.map((p) => p.serializeHex());
        pkHexStrs.sort();
        let result = '';
        result += num2hexstring(n);
        result += num2hexstring(m);
        for (const s of pkHexStrs) {
            result += hex2VarBytes(s);
        }
        let programHash = hash160(result);

        programHash = '02' + programHash.substr(2);
        return new Address(programHash);
    }

    value: string;

    constructor(value: string) {
        if (value.length === 40 || value.length === 34) {
            this.value = value;
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }

    toBase58() {
        if (this.value.length === 34) {
            return this.value;
        } else {
            return u160ToAddress(this.value);
        }
    }

    toHexString() {
        if (this.value.length === 40) {
            return this.value;
        } else {
            return addressToU160(this.value);
        }
    }
}
