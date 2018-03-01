//32 byte = 64char
import {ab2hexstring, hexstring2ab, num2VarInt, hex2VarBytes, StringReader} from '../utils'

const UINT256SIZE = 32
export default class Uint256 {
    value : Uint8Array

    //lettle endian
    compareTo( o : Uint256) {
        let x = this.value
        let y = o.value
        for(let i=UINT256SIZE -1; i >=0; i--) {
            if(x[i] > y[i]) {
                return 1
            }
            if(x[i] < y[i]) {
                return -1
            }
        }
        return 0
    }

    serialize() {
        const hex = ab2hexstring(this.value)
        return hex2VarBytes(hex)
    }

    static deserialize(sr:StringReader) {
        let result = new Uint256()
        const hex = sr.readNextBytes()
        let v = hexstring2ab(hex)
        //little endian
        v = v.reverse()
        let value = new Uint8Array(v)
        result.value = value
        return result
    }
}