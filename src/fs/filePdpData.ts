import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { serializeUint64, decodeAddress, decodeVarBytes, decodeVarUint } from './utils';

export class FilePdpData {
    public constructor(
        public readonly nodeAddr: Address,
        public readonly fileHash: string,
        public readonly proveData: string,
        public readonly challengeHeight: number
    ) { }

    public serializeHex(): string {
        let str = '';
        str += this.nodeAddr.serialize()
            + hex2VarBytes(this.fileHash)
            + hex2VarBytes(this.proveData)
            + serializeUint64(this.challengeHeight)
        return str;
    }
    static deserializeHex(hex: string): FilePdpData {
        let sr: StringReader = new StringReader(hex)
        const nodeAddr = decodeAddress(sr)
        const fileHash = decodeVarBytes(sr)
        const proveData = decodeVarBytes(sr)
        const challengeHeight = decodeVarUint(sr)
        return new FilePdpData(nodeAddr, fileHash, proveData, challengeHeight)
    }
}