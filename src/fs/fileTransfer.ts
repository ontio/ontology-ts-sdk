import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { decodeAddress, decodeVarBytes, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export class FileTransfer {
    static deserializeHex(hex: string): FileTransfer {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const oriOwner = decodeAddress(sr);
        const newOwner = decodeAddress(sr);
        return new FileTransfer(fileHash, oriOwner, newOwner);
    }
    public constructor(
        public readonly fileHash: string,
        public readonly oriOwner: Address,
        public readonly newOwner: Address
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.oriOwner)
            + serializeAddress(this.newOwner);
    }
}

export class FileTransferList {
    static deserializeHex(hex: string): FileTransferList {
        const list: FileTransfer[] = [];
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const item = FileTransfer.deserializeHex(sr.readNextBytes());
            list.push(item);
        }
        return new FileTransferList(list);
    }
    public constructor(
        public readonly filesTransfer: FileTransfer[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesTransfer.length);

        for (const fileTrans of this.filesTransfer) {
            str += hex2VarBytes(fileTrans.serializeHex());
        }

        return str;
    }
}
