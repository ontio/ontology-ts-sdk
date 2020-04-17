import { Address } from '../crypto';
import { pushBool } from '../transaction/scriptBuilder';
import { serializeUint64 } from './utils';

export class SpaceInfo {
    public constructor(
        public readonly spaceOwner: Address,
        public readonly volume: number,
        public readonly restVol: number,
        public readonly copyNumber: number,
        public readonly payAmount: number,
        public readonly restAmount: number,
        public readonly pdpInterval: number,
        public readonly timeStart: number,
        public readonly timeExpired: number,
        public readonly validFlag: boolean
    ) {}

    public serializeHex(): string {
        return this.spaceOwner.serialize()
            + serializeUint64(this.volume)
            + serializeUint64(this.restVol)
            + serializeUint64(this.copyNumber)
            + serializeUint64(this.payAmount)
            + serializeUint64(this.restAmount)
            + serializeUint64(this.pdpInterval)
            + serializeUint64(this.timeStart)
            + serializeUint64(this.timeExpired)
            + pushBool(this.validFlag);
    }
}

export class SpaceUpdate {
    public constructor(
        public readonly spaceOwner: Address,
        public readonly payer: Address,
        public readonly newVolume: number,
        public readonly newTimeExpired: number
    ) {}

    public serializeHex(): string {
        return this.spaceOwner.serialize()
            + this.payer.serialize()
            + serializeUint64(this.newVolume)
            + serializeUint64(this.newTimeExpired);
    }
}
