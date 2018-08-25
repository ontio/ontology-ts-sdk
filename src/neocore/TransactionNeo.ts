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

import * as cryptoJS from 'crypto-js';
import { Signable } from '../crypto/index';
import { PrivateKey } from '../crypto/PrivateKey';
import { TxType } from '../transaction/transaction';
import { SignatureScheme } from './../crypto/SignatureScheme';
import { TransactionAttribute } from './../transaction/txAttribute';
import { num2hexstring, num2VarInt } from './../utils';
import { Program } from './Program';
import { TransactionInput } from './TransactionInput';
import { TransactionOutput } from './TransactionOutput';

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

export class TransactionNeo implements Signable {
    /**
     * Transaction type
     */
    type: TxType;

    version: number = 0;

    nonce: string;

    attributes: TransactionAttribute[];

    inputs: TransactionInput[];

    outputs: TransactionOutput[];

    scripts: Program[];

    serialize() {
        let result = this.serializeUnsigned();
        result += num2VarInt(this.scripts.length);
        for (const s of this.scripts) {
            result += s.serialize();
        }

        return result;

    }

    serializeUnsigned() {
        let result = '';
        result += num2hexstring(this.type);
        result += num2hexstring(this.version);

        result += this.serializeExclusiveData();
        result += num2VarInt(this.attributes.length);
        for (const a of this.attributes) {
            result += a.serialize();
        }

        result += num2VarInt(this.inputs.length);
        for (const i of this.inputs) {
            result += i.serialize();
        }

        result += num2VarInt(this.outputs.length);
        for (const o of this.outputs) {
            result += o.serialize();
        }
        return result;
    }

    getHash() {
        const data = this.serializeUnsigned();

        const ProgramHexString = cryptoJS.enc.Hex.parse(data);
        const ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
        const ProgramSha2562 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();

        return ProgramSha2562;
    }

    getSignContent() {
        return this.getHashData();
    }

    serializeUnsignedData() {
        return this.getHashData();
    }

    getHashData() {
        return this.serializeUnsigned();
    }

    sign(privateKey: PrivateKey, scheme: SignatureScheme = SignatureScheme.ECDSAwithSHA256) {
        const sig = privateKey.sign(this.getHashData(), scheme).serializeHex();
        const signature = sig.substring(2);
        return signature;
    }

    protected serializeExclusiveData() {
        return '';
    }

}
