import { hex2VarBytes } from '../utils';
import { serializeVarUint } from './utils';

export class FileDel {
    public constructor(
        public readonly fileHash: string
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash);
    }
}

export class FileDelList {
    public constructor(
        public readonly filesDel: FileDel[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesDel.length);
        for (const fileDel of this.filesDel) {
            str += hex2VarBytes(fileDel.serializeHex());
        }
        return str;
    }
}
