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
import {
    bool2VarByte,
    hex2VarBytes,
    hexstr2str,
    num2hexstring,
    num2VarInt,
    str2VarBytes,
    StringReader
} from '../../utils';
import { VmCode, VmType } from '../vmcode';
import Payload from './payload';

export default class DeployCode extends Payload {
    // hex string
    code: VmCode;

    needStorage: boolean;
    name: string;
    version: string;
    author: string;
    email: string;
    description: string;

    serialize(): string {
        let result = '';

        result += this.code.serialize();

        result += bool2VarByte(this.needStorage);

        result += str2VarBytes(this.name);

        result += str2VarBytes(this.version);

        result += str2VarBytes(this.author);

        result += str2VarBytes(this.email);

        result += str2VarBytes(this.description);

        return result;
    }

    deserialize(sr: StringReader): void {

        const code = VmCode.deserialize(sr);
        this.code = code;

        const boolValue = sr.read(1);
        this.needStorage = boolValue === '00' ? false : true;

        const name = sr.readNextBytes();
        this.name = hexstr2str(name);

        const codeVersion = sr.readNextBytes();
        this.version = hexstr2str(codeVersion);

        const author = sr.readNextBytes();
        this.author = hexstr2str(author);

        const email = sr.readNextBytes();
        this.email = hexstr2str(email);

        const description = sr.readNextBytes();
        this.description = hexstr2str(description);
    }
}
