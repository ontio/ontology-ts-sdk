import { Address } from '../crypto';
import { hex2VarBytes, bool2VarByte, StringReader } from '../utils';
import { serializeVarUint, serializeAddress, decodeAddress, decodeVarBytes, decodeBool, decodeVarUint } from './utils';

export class PdpRecord {
    public constructor(
        public readonly nodeAddr: Address,
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly lastPdpTime: number,
        public readonly settleFlag: boolean,
    ) { }

    public serializeHex(): string {
        let str = '';
        str += serializeAddress(this.nodeAddr)
            + hex2VarBytes(this.fileHash)
            + serializeAddress(this.fileOwner)
            + serializeVarUint(this.lastPdpTime)
            + bool2VarByte(this.settleFlag)
        return str;
    }

    static deserializeHex(hex: string): PdpRecord {
        let sr: StringReader = new StringReader(hex)
        const nodeAddr = decodeAddress(sr)
        const fileHash = decodeVarBytes(sr)
        const fileOwner = decodeAddress(sr)
        const lastPdpTime = decodeVarUint(sr)
        const settleFlag = decodeBool(sr)

        return new PdpRecord(nodeAddr, fileHash, fileOwner, lastPdpTime,
            settleFlag)
    }
}


export class PdpRecordList {
    public constructor(
        public readonly pdpRecords: PdpRecord[] = []
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.pdpRecords.length);
        for (const pdpRecord of this.pdpRecords) {
            str += hex2VarBytes(pdpRecord.serializeHex());
        }
        return str;
    }


    static deserializeHex(hex: string): PdpRecordList {
        let sr: StringReader = new StringReader(hex)
        let pdpRecords: PdpRecord[] = []
        let count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            const record = PdpRecord.deserializeHex(decodeVarBytes(sr))
            pdpRecords.push(record)
        }
        return new PdpRecordList(pdpRecords)
    }
}