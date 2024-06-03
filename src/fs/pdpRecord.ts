import { Address } from '../crypto';
import { bool2VarByte, hex2VarBytes, StringReader } from '../utils';
import { dateToUnixTime, decodeAddress, decodeBool, decodeVarBytes,
    decodeVarUint, serializeAddress, serializeVarUint, unixTimeToDate } from './utils';

export class PdpRecord {

    static deserializeHex(hex: string): PdpRecord {
        const sr: StringReader = new StringReader(hex);
        const nodeAddr = decodeAddress(sr);
        const fileHash = decodeVarBytes(sr);
        const fileOwner = decodeAddress(sr);
        const lastPdpTime = unixTimeToDate(decodeVarUint(sr));
        const settleFlag = decodeBool(sr);

        return new PdpRecord(nodeAddr, fileHash, fileOwner, lastPdpTime, settleFlag);
    }
    public constructor(
        public readonly nodeAddr: Address,
        public readonly fileHash: string,
        public readonly fileOwner: Address,
        public readonly lastPdpTime: Date,
        public readonly settleFlag: boolean
    ) { }

    public serializeHex(): string {
        let str = '';
        str += serializeAddress(this.nodeAddr)
            + hex2VarBytes(this.fileHash)
            + serializeAddress(this.fileOwner)
            + serializeVarUint(dateToUnixTime(this.lastPdpTime))
            + bool2VarByte(this.settleFlag);
        return str;
    }

    public export() {
        return {
            nodeAddr: this.nodeAddr.value,
            fileHash: this.fileHash,
            fileOwner: this.fileOwner.value,
            lastPdpTime: this.lastPdpTime,
            settleFlag: this.settleFlag
        };
    }
}

export class PdpRecordList {
    static deserializeHex(hex: string): PdpRecordList {
        const sr: StringReader = new StringReader(hex);
        const pdpRecords: PdpRecord[] = [];
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const record = PdpRecord.deserializeHex(decodeVarBytes(sr));
            pdpRecords.push(record);
        }
        return new PdpRecordList(pdpRecords);
    }
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

    public export() {
        return {
            pdpRecords: this.pdpRecords.map((record) => record.export())
        };
    }
}
