import { hex2VarBytes, StringReader } from '../utils';
import { serializeVarUint, decodeVarBytes, decodeVarUint } from './utils';

export class FileDel {
    public constructor(
        public readonly fileHash: string
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash);
    }
    static deserializeHex(hex: string): FileDel {
        let sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        return new FileDel(fileHash)
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
    static deserializeHex(hex: string): FileDelList {
        let list: FileDel[] = []
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            let del = FileDel.deserializeHex(sr.readNextBytes())
            list.push(del)
        }
        return new FileDelList(list)
    }
}
