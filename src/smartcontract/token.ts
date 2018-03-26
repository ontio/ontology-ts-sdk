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
import Uint160 from "../common/Uint160";
import {BigNumber} from 'bignumber.js'

export class Transfers {
    //byte 
    version : string
    states : Array<State> = []

    constructor() {
        this.version = '00'        
    }

    serialize() {
        let result = ''
        result += this.version
        result += num2hexstring(this.states.length)
        for (let i = 0; i < this.states.length; i++) {
            result += this.states[i].serialize()
        }
        return result
    }

    static deserialize(sr : StringReader) {
        let t = new Transfers()
        const version = sr.read(1)
        t.version = version
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
    version : string
    //20 bytes address
    from  : string 
    to    : string
    value : string

    constructor() {
        this.version = '00'
    }

    serialize() {
        let result = ''
        result += this.version
        if(!this.from || this.from.length !== 40) {
            throw new Error('[State.serialize], Invalid from address '+this.from)
        }
        result += this.from

        if (!this.to || this.to.length !== 40) {
            throw new Error('[State.serialize], Invalid to address ' + this.to)
        }
        result += this.to
        // let numHex = str2hexstr(this.value)
        // result += hex2VarBytes(numHex)       
        let bn = BigNumber(this.value).toString(16)
        bn = bn.length % 2 === 0 ? bn : '0'+bn
        result += hex2VarBytes(bn)
        return result
    }

    static deserialize(sr : StringReader) {
        let s = new State()
        let version = sr.read(1)
        let from = sr.read(20)
        let to   = sr.read(20)
        let value = BigNumber(sr.readNextBytes(), 16)

        s.version = version
        s.from = from
        s.to   = to
        s.value = value
        return s
    }
}

export class Contract {
    //byte
    version : string
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

        result += this.address

        result += str2VarBytes(this.method)

        result += hex2VarBytes(this.args)

        return result
    }

    static deserialize(sr : StringReader) {
        let c = new Contract()
        const version = sr.read(1)
        const address = sr.read(20)
        const method = sr.readNextBytes()
        const args = sr.readNextBytes()
        c.version = version
        c.address = address
        c.method = method
        c.args = args
        return c
    }
}