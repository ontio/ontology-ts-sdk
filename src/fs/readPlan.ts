import { Address } from '../crypto';
import { serializeUint64 } from './utils';

export interface ReadPlanLike {
    nodeAddr: Address;
    maxReadBlockNum: number;
    haveReadBlockNum: number;
}

export class ReadPlan {
    static fromReadPlanLike(obj: ReadPlanLike) {
        return new ReadPlan(obj.nodeAddr, obj.maxReadBlockNum, obj.haveReadBlockNum);
    }

    public constructor(
        public readonly nodeAddr: Address,
        public readonly maxReadBlockNum: number,
        public readonly haveReadBlockNum: number
    ) {}

    public serializeHex(): string {
        return this.nodeAddr.serialize()
            + serializeUint64(this.maxReadBlockNum)
            + serializeUint64(this.haveReadBlockNum);
    }
}
