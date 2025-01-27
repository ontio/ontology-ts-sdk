import { hex2VarBytes, StringReader } from '../utils';
import { decodeVarBytes, decodeVarUint, serializeVarUint } from './utils';

export class FileDel {
    static deserializeHex(hex: string): FileDel {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        return new FileDel(fileHash);
    }
    public constructor(
        public readonly fileHash: string
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash);
    }
}

export class FileDelList {
    static deserializeHex(hex: string): FileDelList {
        const list: FileDel[] = [];
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const del = FileDel.deserializeHex(sr.readNextBytes());
            list.push(del);
        }
        return new FileDelList(list);
    }
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
