import { hex2VarBytes, StringReader } from '../utils';
import { decodeBool, decodeVarBytes, serializeBool } from './utils';

export class FsResult {
    static deserializeHex(hex: string): FsResult {
        const sr: StringReader = new StringReader(hex);
        const success = decodeBool(sr);
        const data = decodeVarBytes(sr);
        return new FsResult(success, data);
    }
    public constructor(
        public readonly success: boolean,
        public readonly data: string
    ) {

    }
    public serializeHex(): string {
        return serializeBool(this.success) + hex2VarBytes(this.data);
    }
}
