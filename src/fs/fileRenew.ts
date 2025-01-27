import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { dateToUnixTime, decodeAddress, decodeVarBytes, decodeVarUint,
    serializeAddress, serializeVarUint, unixTimeToDate } from './utils';

export class FileRenew {
    static deserializeHex(hex: string): FileRenew {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const fileOwner = decodeAddress(sr);
        const payer = decodeAddress(sr);
        const newTimeExpired = unixTimeToDate(decodeVarUint(sr));
        return new FileRenew(fileHash, fileOwner, payer, newTimeExpired);
    }
    public constructor(
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly payer: Address,
        public readonly newTimeExpired: Date
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.fileOwner)
            + serializeAddress(this.payer)
            + serializeVarUint(dateToUnixTime(this.newTimeExpired));
    }
}

export class FileRenewList {
    static deserializeHex(hex: string): FileRenewList {
        const list: FileRenew[] = [];
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const item = FileRenew.deserializeHex(sr.readNextBytes());
            list.push(item);
        }
        return new FileRenewList(list);
    }
    public constructor(
        public readonly filesRenew: FileRenew[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesRenew.length);
        for (const fileRenew of this.filesRenew) {
            str += hex2VarBytes(fileRenew.serializeHex());
        }
        return str;
    }
}
