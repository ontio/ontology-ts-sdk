import { Address } from '../crypto';
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class FilePdpData {
    public constructor(
        public readonly nodeAddr: Address,
        public readonly fileHash: string,
        public readonly proveData: string,
        public readonly challengeHeight: number
    ) {}

    public serializeHex(): string {
        let str = '';
        str += this.nodeAddr.serialize()
            + hex2VarBytes(this.fileHash)
            + hex2VarBytes(this.proveData)
            + serializeUint64(this.challengeHeight)
        return str;
    }
}