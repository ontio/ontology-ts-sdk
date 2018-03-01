import Uint256 from '../common/uint256'
import Fixed64 from '../common/Fixed64'
import Uint160 from '../common/Uint160'
import {StringReader} from '../utils'
export default class TXOutput {
    assetID : Uint256
    value : Fixed64
    programHash : Uint160

    serialize() {
        let result = ''
        result += this.assetID.serialize()
        result += this.value.serialize()
        result += this.programHash.serialize()
        return result
    }

    static deserialize(sr:StringReader) {
        let out = new TXOutput()
        out.assetID = Uint256.deserialize(sr)
        out.value = Fixed64.deserialize(sr)
        out.programHash = Uint160.deserialize(sr)
        return out
    }
}