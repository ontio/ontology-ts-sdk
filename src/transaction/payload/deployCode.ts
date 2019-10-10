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
    hex2VarBytes,
    hexstr2str,
    str2VarBytes,
    StringReader
} from '../../utils';
import { num2hexstring } from './../../utils';
import Payload from './payload';

export enum VmType  {
    NEOVM_TYPE = 1,
    WASMVM_TYPE = 3
}

/**
 * Describes the payload of deploy code
 */
export default class DeployCode extends Payload {
    /**
     * Hex encoded contract content
     */
    code: string;

    /**
     * Decides if the contract need storage(Deprecated)
     * Change to VmType to support wasm vm
     */
    // needStorage: boolean;
    vmType: VmType;
    /**
     * Name of the smart contract
     */
    name: string;
    /**
     * Version of the contract
     */
    version: string;
    /**
     * Author of the contract
     */
    author: string;
    /**
     * Email of the author
     */
    email: string;
    /**
     * Description of the contract
     */
    description: string;

    /**
     * Serialize deploy code to hex string
     */
    serialize(): string {
        let result = '';

        // result += this.code.serialize();
        result += hex2VarBytes(this.code);

        result += num2hexstring(this.vmType);

        result += str2VarBytes(this.name);

        result += str2VarBytes(this.version);

        result += str2VarBytes(this.author);

        result += str2VarBytes(this.email);

        result += str2VarBytes(this.description);

        return result;
    }

    /**
     * Deserialize deploy code
     * @param sr
     */
    deserialize(sr: StringReader): void {

        // const code = VmCode.deserialize(sr);
        const code = sr.readNextBytes();
        this.code = code;

        const type = sr.readUint8();
        this.vmType = type;

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
