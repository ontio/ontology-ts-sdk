import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class FileHash {
    public constructor(
        public readonly fHash: string
    ) {}
}

export class FileHashList {
    public constructor(
        public readonly filesH: FileHash[]
    ) {}

    public serializeHex(): string {
        let str = serializeUint64(this.filesH.length);
        for (const fileHash of this.filesH) {
            str += hex2VarBytes(fileHash.fHash);
        }
        return str;
    }
}
