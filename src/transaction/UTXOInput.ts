import Uint256 from '../common/uint256'
import {num2hexstring, StringReader} from '../utils'
export default class UTXOInput {
    referTxID : Uint256

    //uint16
    referTxOutputIndex : number

    serialize() {
        let result = ''
        result += this.referTxID.serialize()
        result += num2hexstring(this.referTxOutputIndex, 2,true)
        return result
    }

    static deserialize(sr:StringReader) {
        let input = new UTXOInput()
        input.referTxID = Uint256.deserialize(sr)

        input.referTxOutputIndex = sr.readUint16()

        return input
    }
}