import {str2hexstr, hexstr2str ,StringReader} from '../utils'
const Fixed64Len = 8
export default class Fixed64 {
    //8 bytes
    value : string
    constructor() {
        this.value = '0000000000000000'
    }

    serialize() {
        // return str2hexstr(this.value)
        return this.value
    }

    static deserialize(sr:StringReader) {
        let f = new Fixed64()
        const v = sr.read(8)
        // f.value = hexstr2str(v)
        f.value = v
        return f
    }
}