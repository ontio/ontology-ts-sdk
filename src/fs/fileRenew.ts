import { Address } from '../crypto';
import { hex2VarBytes } from '../utils';
import { serializeVarUint, serializeAddress } from './utils';

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
}
