import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { decodeAddress, decodeVarBytes, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export class FileTransfer {
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
    static deserializeHex(hex: string): FileTransfer {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const oriOwner = decodeAddress(sr)
        const newOwner = decodeAddress(sr)
        return new FileTransfer(fileHash, oriOwner, newOwner)
    }
}

export class FileTransferList {
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
    static deserializeHex(hex: string): FileTransferList {
        let list: FileTransfer[] = []
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            let item = FileTransfer.deserializeHex(sr.readNextBytes())
            list.push(item)
        }
        return new FileTransferList(list)
    }
}