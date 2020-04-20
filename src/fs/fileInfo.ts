import { Address } from '../crypto';
import { serializeVarUint, serializeAddress, decodeVarBytes, decodeAddress, decodeVarUint, decodeBool } from './utils';
import { num2VarInt, StringReader, bool2VarByte, hex2VarBytes } from '../utils'

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
    static deserializeHex(hex: string): FileInfo {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const fileOwner = decodeAddress(sr)
        const fileDesc = decodeVarBytes(sr)
        const fileBlockCount = decodeVarUint(sr)
        const realFileSize = decodeVarUint(sr)
        const copyNumber = decodeVarUint(sr)
        const payAmount = decodeVarUint(sr)
        const restAmount = decodeVarUint(sr)
        const fileCost = decodeVarUint(sr)
        const firstPdp = decodeBool(sr)
        const pdpInterval = decodeVarUint(sr)
        const timeStart = decodeVarUint(sr)
        const timeExpired = decodeVarUint(sr)
        const pdpParam = decodeVarBytes(sr)
        const validFlag = decodeBool(sr)
        const storageType = decodeVarUint(sr)
        return new FileInfo(fileHash, fileOwner, fileDesc, fileBlockCount, realFileSize, copyNumber, payAmount,
            restAmount, fileCost, firstPdp, pdpInterval, timeStart, timeExpired, pdpParam, validFlag, storageType)
    }
}

export class FileInfoList {
    public constructor(
        public readonly filesI: FileInfo[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.filesI.length);
        for (const fileInfo of this.filesI) {
            const fileInfoHex = fileInfo.serializeHex()
            const hexLen = num2VarInt(fileInfoHex.length / 2)
            str += hexLen + fileInfoHex;
        }
        return str;
    }
    static deserializeHex(hex: string): FileInfoList {
        let list: FileInfo[] = []
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            let item = FileInfo.deserializeHex(sr.readNextBytes())
            list.push(item)
        }
        return new FileInfoList(list)
    }
}
