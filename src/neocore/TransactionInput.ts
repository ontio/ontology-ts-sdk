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

import { reverseHex } from '../utils';
import { num2hexstring, StringReader } from './../utils';

export class TransactionInput {

    static deserialize(hexstr: string) {
        const sr = new StringReader(hexstr);
        const input = new TransactionInput();
        input.prevHash = sr.read(20);
        input.prevIndex = parseInt(reverseHex(sr.read(2)), 16);
        return input;
    }
    /**
     * 32 bytes
     */
    prevHash: string;

    prevIndex: number;

    equals(o: any) {
        if (o === this) {
            return true;
        }
        if (null === o) {
            return false;
        }
        if (!(o instanceof TransactionInput)) {
            return false;
        }
        return this.prevHash === o.prevHash && this.prevIndex === o.prevIndex;
    }

    hashCode() {
        return parseInt(reverseHex(this.prevHash) , 16) + this.prevIndex;
    }

    serialize() {
        let result = '';
        result += this.prevHash;
        result += num2hexstring(this.prevIndex, 2, true);
        return result;
    }
}
