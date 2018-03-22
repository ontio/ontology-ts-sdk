import { num2hexstring, StringReader, num2VarInt, str2hexstr, str2VarBytes } from "../utils";
import Uint160 from "../common/Uint160";
import {BigNumber} from 'bignumber.js'
export class Transfers {
    params : Array<TokenTransfer>

    constructor() {}

    serialize() {
        let result = ''
        result += num2hexstring(this.params.length)
        for(let i=0; i < this.params.length; i++) {
            result += this.params[i].serialize()
        }
        return result
    }

    static deserialize(sr : StringReader) {
        let t = new Transfers()
        t.params = []
        const len = sr.readNextLen()
        for(let i=0; i<len;i++) {
            let tf = TokenTransfer.deserialize(sr)
            t.params.push(tf)
        }
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
    from  : string
    to    : string
    value : BigNumber

    serialize() {
        let result = ''
        result += this.from
        result += this.to
        result += str2VarBytes(this.value.toString())
    }

    static deserialize(sr : StringReader) {
        let s = new State()
        let from = sr.read(20)
        let to   = sr.read(20)
        let value = BigNumber(parseInt(sr.readNextBytes()))

        s.from = from
        s.to   = to
        s.value = value
        return s
    }
}