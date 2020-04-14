import { StringReader } from '../utils';
import { decodeBool, decodeVarBytes } from './utils';

export class FsResult {
    public constructor(
        public readonly success: boolean,
        public readonly data: string,
    ) {

    }
    static deserializeHex(hex: string): FsResult {
        let sr: StringReader = new StringReader(hex)
        const success = decodeBool(sr)
        const data = decodeVarBytes(sr)
        return new FsResult(success, data)
    }
}
