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

import { num2hexstring, StringReader, num2VarInt, str2hexstr, str2VarBytes, hex2VarBytes, hexstr2str } from "../utils";
import Uint160 from "../common/uint160";
import {BigNumber} from 'bignumber.js'
import { Address } from "../crypto/address";
import Fixed64 from "../common/fixed64";

export class Transfers {
    //byte 
    // version : string
    states : Array<State> = []

    constructor() {
        // this.version = '00'        
    }

    serialize() {
        let result = ''
        // result += this.version
        result += num2hexstring(this.states.length)
        for (let i = 0; i < this.states.length; i++) {
            result += this.states[i].serialize()
        }
        return result
    }

    static deserialize(sr : StringReader) {
        let t = new Transfers()
        // const version = sr.read(1)
        // t.version = version
        let states = []
        const stateLen = sr.readNextLen()
        for (let i = 0; i < stateLen; i++) {
            let state = State.deserialize(sr)
            states.push(state)
        }
        t.states = states
        return t
    }
}

export class TokenTransfer {
    //20 bytes
    contract : string
    states : Array<State>

    serialize() {
        let result = ''
        result += this.contract
        let len = num2hexstring(this.states.length)
        result += len
        for(let i = 0 ; i < this.states.length; i++) {
            result += this.states[i].serialize()
        }
        return result
    }

    static deserialize(sr : StringReader) {
        let tf = new TokenTransfer
        tf.states = []
        let contract = sr.read(20)
        tf.contract = contract

        let len = sr.readNextLen()
        for (let i = 0; i < len; i++) {
            let state = State.deserialize(sr)
            tf.states.push(state)
        }
        return tf
    }
}

export class State {
    //byte
    // version : string
    //20 bytes address
    from  : Address 
    to    : Address
    value : Fixed64

    constructor() {
        // this.version = '00'
    }

    serialize() {
        let result = ''
        // result += this.version
        result += this.from.toHexString()
        result += this.to.toHexString()
        result += this.value.serialize()
        console.log('fixed64: '+ this.value.serialize())
        return result
    }

    static deserialize(sr : StringReader) {
        let s = new State()
        // let version = sr.read(1)
        let from = sr.read(20)
        let to   = sr.read(20)
        // let value = (new BigNumber(sr.readNextBytes(), 16)).toString()
        let value = sr.read(8)

        // s.version = version
        s.from = new Address(from)
        s.to   = new Address(to)
        s.value = new Fixed64(value)
        return s
    }
}

export class Contract {
    //byte
    version : string

    //TODO
    code : string = '00'

    //20 bytes
    address : string

    method : string

    //byte
    args : string

    constructor() {
        this.version = '00'
    }

    serialize() {
        let result = ''
        result += this.version

        // result += hex2VarBytes(this.code)
        result += this.code

        result += this.address

        result += str2VarBytes(this.method)

        result += hex2VarBytes(this.args)

        return result
    }

    static deserialize(sr : StringReader) {
        let c = new Contract()
        const version = sr.read(1)
        const code = sr.readNextBytes()
        const address = sr.read(20)
        const method = sr.readNextBytes()
        const args = sr.readNextBytes()
        c.version = version
        c.code = code
        c.address = address
        c.method = hexstr2str(method)
        c.args = args
        return c
    }
}

export class TransferFrom {
    // version : string = '00'

    sender : Address

    from : Address

    to : Address
    
    value : string

    constructor(sender: Address, from: Address, to: Address, value : string) {
        this.sender = sender;
        this.from = from;
        this.to = to;
        this.value = value;
    }

    serialize() : string {
        let result = ''
        // result += this.version
        result += this.sender.toHexString()
        result += this.from.toHexString()
        result += this.to.toHexString()
        let bn = new BigNumber(this.value).toString(16)
        bn = bn.length % 2 === 0 ? bn : '0' + bn
        result += hex2VarBytes(bn)
        return result
    }

    static deserialize(sr : StringReader) : TransferFrom {
        // const version = sr.read(1)
        const sender = new Address(sr.read(20))
        const from = new Address(sr.read(20))
        const to = new Address(sr.read(20))
        const value = (new BigNumber(sr.readNextBytes(), 16)).toString()
        let tf = new TransferFrom(sender, from ,to, value)
        return tf
    }
}