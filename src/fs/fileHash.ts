import { serializeUint64, decodeVarUint, decodeVarBytes } from './utils';
import { hex2VarBytes, StringReader, hexstr2str } from '../utils';

export class FileHash {
    public constructor(
        public readonly fHash: string
    ) { }
}

export class FileHashList {
    public constructor(
        public readonly filesH: FileHash[]
    ) { }

    public serializeHex(): string {
        let str = serializeUint64(this.filesH.length);
        for (const fileHash of this.filesH) {
            str += hex2VarBytes(fileHash.fHash);
        }
        return str;
    }
    static deserializeHex(hex: string): FileHashList {
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        let hashes: FileHash[] = []
        for (let i = 0; i < count; i++) {
            hashes.push(new FileHash(hexstr2str(decodeVarBytes(sr))))
        }
        return new FileHashList(hashes)
    }
}