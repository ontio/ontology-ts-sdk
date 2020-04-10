import { Address } from '../crypto';
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class FileRenew {
    public constructor(
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly payer: Address,
        public readonly newTimeExpired: number
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + this.fileOwner.serialize()
            + this.payer.serialize()
            + serializeUint64(this.newTimeExpired);
    }
}

export class FileRenewList {
    public constructor(
        public readonly filesRenew: FileRenew[] = []
    ) {}

    public serializeHex(): string {
        let str = serializeUint64(this.filesRenew.length);
        for (const fileRenew of this.filesRenew) {
            str += fileRenew.serializeHex();
        }
        return str;
    }
}
