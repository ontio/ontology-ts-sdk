import { Address } from '../crypto';
import { bool2VarByte, hex2VarBytes, num2VarInt, StringReader } from '../utils';
import { decodeAddress, decodeBool, decodeVarBytes, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export class FileInfo {
    static deserializeHex(hex: string): FileInfo {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const fileOwner = decodeAddress(sr);
        const fileDesc = decodeVarBytes(sr);
        const fileBlockCount = decodeVarUint(sr);
        const realFileSize = decodeVarUint(sr);
        const copyNumber = decodeVarUint(sr);
        const payAmount = decodeVarUint(sr);
        const restAmount = decodeVarUint(sr);
        const fileCost = decodeVarUint(sr);
        const firstPdp = decodeBool(sr);
        const pdpInterval = decodeVarUint(sr);
        const timeStart = decodeVarUint(sr);
        const timeExpired = decodeVarUint(sr);
        const pdpParam = decodeVarBytes(sr);
        const validFlag = decodeBool(sr);
        const storageType = decodeVarUint(sr);
        return new FileInfo(fileHash, fileOwner, fileDesc, fileBlockCount, realFileSize, copyNumber, payAmount,
            restAmount, fileCost, firstPdp, pdpInterval, timeStart, timeExpired, pdpParam, validFlag, storageType);
    }
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
        public readonly storageType: number
    ) { }

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.fileOwner)
            + hex2VarBytes(this.fileDesc)
            + serializeVarUint(this.fileBlockCount)
            + serializeVarUint(this.realFileSize)
            + serializeVarUint(this.copyNumber)
            + serializeVarUint(this.payAmount)
            + serializeVarUint(this.restAmount)
            + serializeVarUint(this.fileCost)
            + bool2VarByte(this.firstPdp)
            + serializeVarUint(this.pdpInterval)
            + serializeVarUint(this.timeStart)
            + serializeVarUint(this.timeExpired)
            + hex2VarBytes(this.pdpParam)
            + bool2VarByte(this.validFlag)
            + serializeVarUint(this.storageType);
    }

    public export() {
        return {
            fileHash: this.fileHash,
            fileOwner: this.fileOwner.value,
            fileDesc: this.fileDesc,
            fileBlockCount: this.fileBlockCount,
            realFileSize: this.realFileSize,
            copyNumber: this.copyNumber,
            payAmount: this.payAmount,
            restAmount: this.restAmount,
            fileCost: this.fileCost,
            firstPdp: this.firstPdp,
            pdpInterval: this.pdpInterval,
            timeStart: this.timeStart,
            timeExpired: this.timeExpired,
            pdpParam: this.pdpParam,
            validFlag: this.validFlag,
            storageType: this.storageType
        };
    }
}

export class FileInfoList {
    static deserializeHex(hex: string): FileInfoList {
        const list: FileInfo[] = [];
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const item = FileInfo.deserializeHex(sr.readNextBytes());
            list.push(item);
        }
        return new FileInfoList(list);
    }
    public constructor(
        public readonly filesI: FileInfo[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesI.length);
        for (const fileInfo of this.filesI) {
            const fileInfoHex = fileInfo.serializeHex();
            const hexLen = num2VarInt(fileInfoHex.length / 2);
            str += hexLen + fileInfoHex;
        }
        return str;
    }

    public export() {
        return {
            filesI: this.filesI.map((fileInfo) => fileInfo.export())
        };
    }
}
