import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { decodeAddress, decodeVarBytes, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export class FileRenew {
    public constructor(
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly payer: Address,
        public readonly newTimeExpired: number
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.fileOwner)
            + serializeAddress(this.payer)
            + serializeVarUint(this.newTimeExpired);
    }
    static deserializeHex(hex: string): FileRenew {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const fileOwner = decodeAddress(sr)
        const payer = decodeAddress(sr)
        const newTimeExpired = decodeVarUint(sr)
        return new FileRenew(fileHash, fileOwner, payer, newTimeExpired)
    }
}

export class FileRenewList {
    public constructor(
        public readonly filesRenew: FileRenew[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesRenew.length);
        for (const fileRenew of this.filesRenew) {
            str += hex2VarBytes(fileRenew.serializeHex());
        }
        console.log('serializeHex str', str)
        return str;
    }
    static deserializeHex(hex: string): FileRenewList {
        let list: FileRenew[] = []
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            let item = FileRenew.deserializeHex(sr.readNextBytes())
            list.push(item)
        }
        return new FileRenewList(list)
    }
}
