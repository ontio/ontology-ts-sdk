import { num2hexstring, StringReader, num2VarInt, str2hexstr, str2VarBytes, hex2VarBytes, hexstr2str } from "../utils";
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
    //20 bytes address
    from  : string 
    to    : string
    value : string

    serialize() {
        let result = ''
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
        let from = sr.read(20)
        let to   = sr.read(20)
        let value = BigNumber(sr.readNextBytes(), 16)

        s.from = from
        s.to   = to
        s.value = value
        return s
    }
}