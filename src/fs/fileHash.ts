import { hex2VarBytes, hexstr2str, StringReader } from '../utils';
import { decodeVarBytes, decodeVarUint, serializeUint64 } from './utils';

export class FileHash {
    static deserializeHex(hex: string): FileHash {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        return new FileHash(fileHash);
    }
    public constructor(
        public readonly fHash: string
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fHash);
    }

    public export() {
        return {
            fHash: this.fHash
        };
    }
}

export class FileHashList {
    static deserializeHex(hex: string): FileHashList {
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        const hashes: FileHash[] = [];
        for (let i = 0; i < count; i++) {
            hashes.push(new FileHash(hexstr2str(decodeVarBytes(sr))));
        }
        return new FileHashList(hashes);
    }
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

    public export() {
        return {
            filesH: this.filesH.map((fileHash) => fileHash.export())
        };
    }
}
