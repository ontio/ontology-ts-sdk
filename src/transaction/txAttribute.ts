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

import { generateRandomArray } from '../helpers';
import { ab2hexstring, hex2VarBytes, num2hexstring, num2VarInt, str2hexstr, StringReader } from '../utils';

export enum TransactionAttributeUsage {
    Nonce           = 0x00,
    Script          = 0x20,
    DescriptionUrl  = 0x81,
    Description     = 0x90
}

function isValidAttributeType(usage: TransactionAttributeUsage): boolean {
    return usage === TransactionAttributeUsage.Nonce || usage === TransactionAttributeUsage.Script
        || usage === TransactionAttributeUsage.Description || usage === TransactionAttributeUsage.DescriptionUrl;
}

/**
 * TransactionAttribute
 * @property {number} usage - Identifying byte
 * @property {string} data - Data
 */
export class TransactionAttribute {
    usage: TransactionAttributeUsage;
    // hexstring
    data: string;

    // hexstring for uint32
    size: string;

    serialize(): string {
        let result = '';
        result += num2hexstring(this.usage);
        // result += this.nonce
        if (!isValidAttributeType(this.usage)) {
            throw new Error('[TxAttribute] error, Unsupported attribute Description.');
        }
        result += hex2VarBytes(this.data);
        return result;
    }

    deserialize(ss: StringReader): void {
        // usage
        const usage = parseInt(ss.read(1), 16);
        // nonce
        // const nonce = ss.read(8);
        // get hash with publicKey;
        const dataLen = ss.readNextLen();
        const data = ss.read(dataLen);
        this.usage = usage;
        // this.nonce = nonce;
        this.data = data;
    }
}
