import { Address } from '../crypto';
import { bool2VarByte, hex2VarBytes, num2VarInt, StringReader } from '../utils';
import { dateToUnixTime, decodeAddress, decodeBool, decodeVarBytes,
    decodeVarUint, serializeAddress, serializeVarUint, unixTimeToDate } from './utils';

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
        const firstPdp = decodeBool(sr);
        const timeStart = unixTimeToDate(decodeVarUint(sr));
        const timeExpired = unixTimeToDate(decodeVarUint(sr));
        const beginHeight = decodeVarUint(sr);
        const expiredHeight = decodeVarUint(sr);
        const pdpParam = decodeVarBytes(sr);
        const validFlag = decodeBool(sr);
        const currFeeRate = decodeVarUint(sr)
        const storageType = decodeVarUint(sr);
        return new FileInfo(
            fileHash, fileOwner, fileDesc, fileBlockCount, realFileSize, copyNumber, payAmount, restAmount,
            firstPdp, timeStart, timeExpired, beginHeight, expiredHeight, pdpParam, validFlag, currFeeRate, storageType
        );
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
        public readonly firstPdp: boolean,
        public readonly timeStart: Date,
        public readonly timeExpired: Date,
        public readonly beginHeight: number,
        public readonly expiredHeight: number,
        public readonly pdpParam: string,
        public readonly validFlag: boolean,
        public readonly currFeeRate: number,
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
            + bool2VarByte(this.firstPdp)
            + serializeVarUint(dateToUnixTime(this.timeStart))
            + serializeVarUint(dateToUnixTime(this.timeExpired))
            + serializeVarUint(this.beginHeight)
            + serializeVarUint(this.expiredHeight)
            + hex2VarBytes(this.pdpParam)
            + bool2VarByte(this.validFlag)
            + serializeVarUint(this.currFeeRate)
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
            firstPdp: this.firstPdp,
            timeStart: this.timeStart,
            timeExpired: this.timeExpired,
            beginHeight: this.beginHeight,
            expiredHeight: this.expiredHeight,
            pdpParam: this.pdpParam,
            validFlag: this.validFlag,
            currFeeRate: this.currFeeRate,
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
