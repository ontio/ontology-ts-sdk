import { Address } from "../crypto";
import { hex2VarBytes } from "../utils";

export class GetReadPledge {
    public constructor(
        public readonly fileHash: string,
        public readonly downloader: Address
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + this.downloader.serialize();
    }
}