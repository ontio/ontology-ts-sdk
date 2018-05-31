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
import Fixed64 from '../common/fixed64';
import { Address } from '../crypto/address';
import { hex2VarBytes, hexstr2str, num2hexstring, num2VarInt, str2VarBytes, StringReader } from '../utils';

export class Transfers {
    static deserialize(sr: StringReader) {
        const t = new Transfers();
        // const version = sr.read(1);
        // t.version = version;
        const states = [];
        const stateLen = sr.readNextLen();
        for (let i = 0; i < stateLen; i++) {
            const state = State.deserialize(sr);
            states.push(state);
        }
        t.states = states;
        return t;
    }

    // byte
    // version : string
    states: State[] = [];

    constructor() {
        // this.version = '00';
    }

    serialize() {
        let result = '';
        // result += this.version
        result += num2hexstring(this.states.length);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.states.length; i++) {
            result += this.states[i].serialize();
        }
        return result;
    }
}

export class TokenTransfer {
    static deserialize(sr: StringReader) {
        const tf = new TokenTransfer();
        tf.states = [];
        const contract = sr.read(20);
        tf.contract = contract;

        const len = sr.readNextLen();
        for (let i = 0; i < len; i++) {
            const state = State.deserialize(sr);
            tf.states.push(state);
        }
        return tf;
    }

    // 20 bytes
    contract: string;
    states: State[];

    serialize() {
        let result = '';
        result += this.contract;
        const len = num2hexstring(this.states.length);
        result += len;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0 ; i < this.states.length; i++) {
            result += this.states[i].serialize();
        }
        return result;
    }
}

export class State {
    static deserialize(sr: StringReader) {
        const s = new State();
        // const version = sr.read(1);
        const from = sr.read(20);
        const to   = sr.read(20);
        // const value = (new BigNumber(sr.readNextBytes(), 16)).toString();
        // const value = sr.read(8);
        const value = sr.readNextLen().toString();

        // s.version = version;
        s.from = new Address(from);
        s.to   = new Address(to);
        s.value = new Fixed64(value);
        return s;
    }

    // byte
    // version : string
    // 20 bytes address
    from: Address;
    to: Address;
    value: Fixed64;

    constructor() {
        // this.version = '00'
    }

    serialize() {
        let result = '';
        // result += this.version
        result += this.from.toHexString();
        result += this.to.toHexString();
        // result += this.value.serialize();
        result += num2VarInt(parseInt(this.value.value, 10));
        return result;
    }
}

export class Contract {
    static deserialize(sr: StringReader) {
        const c = new Contract();
        const version = sr.read(1);
        const code = sr.readNextBytes();
        const address = sr.read(20);
        const method = sr.readNextBytes();
        const args = sr.readNextBytes();
        c.version = version;
        c.code = code;
        c.address = address;
        c.method = hexstr2str(method);
        c.args = args;
        return c;
    }

    // byte
    version: string;

    // TODO
    code: string = '00';

    // 20 bytes
    address: string;

    method: string;

    // byte
    args: string;

    constructor() {
        this.version = '00';
    }

    serialize() {
        let result = '';
        result += this.version;

        // result += hex2VarBytes(this.code);
        result += this.code;

        result += this.address;

        result += str2VarBytes(this.method);

        result += hex2VarBytes(this.args);

        return result;
    }
}

export class TransferFrom {
    static deserialize(sr: StringReader): TransferFrom {
        // const version = sr.read(1);
        const sender = new Address(sr.read(20));
        const from = new Address(sr.read(20));
        const to = new Address(sr.read(20));
        // const value = (new BigNumber(sr.readNextBytes(), 16)).toString();
        const value = sr.readNextLen().toString();
        const tf = new TransferFrom(sender, from, to, value);
        return tf;
    }

    // version : string = '00'

    sender: Address;

    from: Address;

    to: Address;

    value: Fixed64;

    constructor(sender: Address, from: Address, to: Address, value: string) {
        this.sender = sender;
        this.from = from;
        this.to = to;
        this.value = new Fixed64(value);
    }

    serialize(): string {
        let result = '';
        // result += this.version
        result += this.sender.toHexString();
        result += this.from.toHexString();
        result += this.to.toHexString();
        // result += this.value.serialize();
        result += num2VarInt(parseInt(this.value.value, 10));
        return result;
    }
}
