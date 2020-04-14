import { Address } from '../crypto';
import { serializeVarUint, serializeAddress, decodeAddress, decodeVarUint } from './utils';
import { StringReader } from '../utils';

export class ReadPlan {
    public constructor(
        public readonly nodeAddr: Address,
        public readonly maxReadBlockNum: number,
        public readonly haveReadBlockNum: number
    ) { }

    public serializeHex(): string {
        return serializeAddress(this.nodeAddr)
            + serializeVarUint(this.maxReadBlockNum)
            + serializeVarUint(this.haveReadBlockNum)
    }

    static deserializeHex(hex: string): ReadPlan {
        let sr: StringReader = new StringReader(hex)
        const nodeAddr = decodeAddress(sr)
        const maxReadBlockNum = decodeVarUint(sr)
        const haveReadBlockNum = decodeVarUint(sr)
        return new ReadPlan(nodeAddr, maxReadBlockNum, haveReadBlockNum)
    }
}
