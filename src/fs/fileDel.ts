import { hex2VarBytes } from "../utils";
import { serializeUint64 } from "./utils";

export class FileDel {
    public constructor(
        public readonly fileHash: string
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash);
    }
}

export class FileDelList {
    public constructor(
        public readonly filesDel: FileDel[] = []
    ) {}

    public serializeHex(): string {
        let str = serializeUint64(this.filesDel.length);
        for (const fileDel of this.filesDel) {
            str += fileDel.serializeHex();
        }
        return str;
    }
}
