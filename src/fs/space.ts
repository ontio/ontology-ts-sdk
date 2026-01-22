import { Address } from '../crypto';
import { bool2VarByte, StringReader } from '../utils';
import { dateToUnixTime, decodeAddress, decodeBool, decodeVarUint,
    serializeAddress, serializeVarUint, unixTimeToDate } from './utils';

export class SpaceInfo {

    static deserializeHex(hex: string): SpaceInfo {
        const sr: StringReader = new StringReader(hex);
        const spaceOwner = decodeAddress(sr);
        const volume = decodeVarUint(sr);
        const restVol = decodeVarUint(sr);
        const copyNumber = decodeVarUint(sr);
        const payAmount = decodeVarUint(sr);
        const restAmount = decodeVarUint(sr);
        const timeStart = unixTimeToDate(decodeVarUint(sr));
        const timeExpired = unixTimeToDate(decodeVarUint(sr));
        const currFeeRate = decodeVarUint(sr)
        const validFlag = decodeBool(sr);
        return new SpaceInfo(spaceOwner, volume, restVol, copyNumber, payAmount,
            restAmount, timeStart, timeExpired, currFeeRate, validFlag);
    }
    public constructor(
        public readonly spaceOwner: Address,
        public readonly volume: number,
        public readonly restVol: number,
        public readonly copyNumber: number,
        public readonly payAmount: number,
        public readonly restAmount: number,
        public readonly timeStart: Date,
        public readonly timeExpired: Date,
        public readonly currFeeRate: number,
        public readonly validFlag: boolean
    ) { }

    public serializeHex(): string {
        return serializeAddress(this.spaceOwner)
            + serializeVarUint(this.volume)
            + serializeVarUint(this.restVol)
            + serializeVarUint(this.copyNumber)
            + serializeVarUint(this.payAmount)
            + serializeVarUint(this.restAmount)
            + serializeVarUint(dateToUnixTime(this.timeStart))
            + serializeVarUint(dateToUnixTime(this.timeExpired))
            + serializeVarUint(this.currFeeRate)
            + bool2VarByte(this.validFlag);
    }

    public export() {
        return {
            spaceOwner: this.spaceOwner.value,
            volume: this.volume,
            restVol: this.restVol,
            copyNumber: this.copyNumber,
            payAmount: this.payAmount,
            restAmount: this.restAmount,
            timeStart: this.timeStart,
            timeExpired: this.timeExpired,
            currFeeRate: this.currFeeRate,
            validFlag: this.validFlag
        };
    }
}

export class SpaceUpdate {
    static deserializeHex(hex: string): SpaceUpdate {
        const sr: StringReader = new StringReader(hex);
        const spaceOwner = decodeAddress(sr);
        const payer = decodeAddress(sr);
        const newVolume = decodeVarUint(sr);
        const newTimeExpired = unixTimeToDate(decodeVarUint(sr));

        return new SpaceUpdate(spaceOwner, payer, newVolume, newTimeExpired);
    }
    public constructor(
        public readonly spaceOwner: Address,
        public readonly payer: Address,
        public readonly newVolume: number,
        public readonly newTimeExpired: Date
    ) { }

    public serializeHex(): string {
        return serializeAddress(this.spaceOwner)
            + serializeAddress(this.payer)
            + serializeVarUint(this.newVolume)
            + serializeVarUint(dateToUnixTime(this.newTimeExpired));
    }
}
