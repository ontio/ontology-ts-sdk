import { StringReader, hex2VarBytes } from '../utils';
import { decodeVarBytes, decodeBool, serializeBool } from './utils';

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
    public serializeHex(): string {
        return serializeBool(this.success) + hex2VarBytes(this.data);
    }
}
