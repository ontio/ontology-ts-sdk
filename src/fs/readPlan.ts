import { Address } from '../crypto';
import { StringReader } from '../utils';
import { decodeAddress, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export interface ReadPlanLike {
    nodeAddr: Address;
    maxReadBlockNum: number;
    haveReadBlockNum: number;
    numOfSettlements: number;
}

export class ReadPlan {
    static fromReadPlanLike({ nodeAddr, maxReadBlockNum, haveReadBlockNum, numOfSettlements }: ReadPlanLike) {
        return new ReadPlan(nodeAddr, maxReadBlockNum, haveReadBlockNum, numOfSettlements);
    }

    static deserializeHex(hex: string): ReadPlan {
        const sr: StringReader = new StringReader(hex);
        const nodeAddr = decodeAddress(sr);
        const maxReadBlockNum = decodeVarUint(sr);
        const haveReadBlockNum = decodeVarUint(sr);
        const numOfSettlements = decodeVarUint(sr);
        return new ReadPlan(nodeAddr, maxReadBlockNum, haveReadBlockNum, numOfSettlements);
    }

    public constructor(
        public readonly nodeAddr: Address,
        public readonly maxReadBlockNum: number,
        public readonly haveReadBlockNum: number,
        public readonly numOfSettlements: number
    ) { }

    public serializeHex(): string {
        return serializeAddress(this.nodeAddr)
            + serializeVarUint(this.maxReadBlockNum)
            + serializeVarUint(this.haveReadBlockNum)
            + serializeVarUint(this.numOfSettlements);
    }

    public export() {
        return {
            nodeAddr: this.nodeAddr.value,
            maxReadBlockNum: this.maxReadBlockNum,
            haveReadBlockNum: this.haveReadBlockNum,
            numOfSettlements: this.numOfSettlements
        };
    }
}
