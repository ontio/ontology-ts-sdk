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

import { Address } from './../crypto/address';
import { num2hexstring, StringReader } from './../utils';
export class TransactionOutput {

    static deserialize(hexstring: string) {
        const sr = new StringReader(hexstring);
        const output = new TransactionOutput();
        output.assetId = sr.read(32);
        output.value = sr.readLong();
        output.scriptHash = new Address(sr.read(20));
        return output;
    }

    /**
     * 32 bytes
     */
    assetId: string;

    // long
    value: number;

    scriptHash: Address;

    serialize() {
        let result = '';
        result += this.assetId;
        result += num2hexstring(this.value, 8, true);
        result += this.scriptHash.serialize();
        return result;
    }
}
