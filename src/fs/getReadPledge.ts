import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { serializeAddress } from './utils';
import { decodeAddress, decodeVarBytes } from './utils';

export class GetReadPledge {

    static deserializeHex(hex: string): GetReadPledge {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const downloader = decodeAddress(sr);
        return new GetReadPledge(fileHash, downloader);
    }
    public constructor(
        public readonly fileHash: string,
        public readonly downloader: Address
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.downloader);
    }
}
