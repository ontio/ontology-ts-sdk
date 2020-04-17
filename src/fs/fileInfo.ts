import { Address } from '../crypto';
import { pushBool } from '../transaction/scriptBuilder';
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class FileInfo {
    public constructor(
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly fileDesc: string,
        public readonly fileBlockCount: number,
        public readonly realFileSize: number,
        public readonly copyNumber: number,
        public readonly payAmount: number,
        public readonly restAmount: number,
        public readonly fileCost: number,
        public readonly firstPdp: boolean,
        public readonly pdpInterval: number,
        public readonly timeStart: number,
        public readonly timeExpired: number,
        public readonly pdpParam: string,
        public readonly validFlag: boolean,
        public readonly StorageType: number
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + this.fileOwner.serialize()
            + hex2VarBytes(this.fileDesc)
            + serializeUint64(this.fileBlockCount)
            + serializeUint64(this.realFileSize)
            + serializeUint64(this.copyNumber)
            + serializeUint64(this.payAmount)
            + serializeUint64(this.restAmount)
            + serializeUint64(this.fileCost)
            + pushBool(this.firstPdp)
            + serializeUint64(this.pdpInterval)
            + serializeUint64(this.timeStart)
            + serializeUint64(this.timeExpired)
            + hex2VarBytes(this.pdpParam)
            + pushBool(this.validFlag)
            + serializeUint64(this.StorageType);
    }
}

export class FileInfoList {
    public constructor(
        public readonly filesI: FileInfo[] = []
    ) {}

    public serializeHex(): string {
        let str = serializeUint64(this.filesI.length);
        for (const fileInfo of this.filesI) {
            str += fileInfo.serializeHex();
        }
        return str;
    }
}
