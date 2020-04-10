import { Address } from "../crypto";
import { hex2VarBytes } from "../utils";
import { serializeUint64 } from "./utils";

export class FileTransfer {
    public constructor(
        public readonly fileHash: string,
        public readonly oriOwner: Address,
        public readonly newOwner: Address
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + this.oriOwner.serialize()
            + this.newOwner.serialize();
    }
}

export class FileTransferList {
    public constructor(
        public readonly filesTransfer: FileTransfer[] = []
    ) {}

    public serializeHex(): string {
        let str = serializeUint64(this.filesTransfer.length);

        for (const fileTrans of this.filesTransfer) {
            str += fileTrans.serializeHex();
        }

        return str;
    }
}