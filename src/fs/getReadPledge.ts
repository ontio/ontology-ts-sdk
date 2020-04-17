import { Address } from '../crypto';
import { serializeAddress } from './utils';
import { hex2VarBytes, StringReader } from '../utils';
import { decodeAddress, decodeVarBytes } from './utils';

export class GetReadPledge {
    public constructor(
        public readonly fileHash: string,
        public readonly downloader: Address
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.downloader);
    }

    static deserializeHex(hex: string): GetReadPledge {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const downloader = decodeAddress(sr)
        return new GetReadPledge(fileHash, downloader)
    }
}