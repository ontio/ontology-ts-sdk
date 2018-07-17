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

import { PublicKey } from '../crypto/PublicKey';
import { programFromMultiPubKey, programFromParams, programFromPubKey } from '../transaction/program';
import { hex2VarBytes, StringReader } from '../utils';

export class Program {
    static deserialize(hexstring: string) {
        const sr = new StringReader();
        const program = new Program();
        program.parameter = sr.readNextBytes();
        program.code = sr.readNextBytes();
        return program;
    }

    static programFromParams(sigData: string[]) {
        return programFromParams(sigData);
    }

    static programFromPubKey(publicKey: PublicKey) {
        return programFromPubKey(publicKey);
    }

    static programFromMultiPubKey(m: number, pks: PublicKey[]) {
        return programFromMultiPubKey(pks, m);
    }

    parameter: string;

    code: string;

    serialize() {
        let result = '';
        result += hex2VarBytes(this.parameter);
        result += hex2VarBytes(this.code);
        return result;
    }
}
