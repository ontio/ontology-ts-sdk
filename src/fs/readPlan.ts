import { Address } from "../crypto";
import { serializeUint64 } from "./utils";

export class ReadPlan {
    public constructor(
        public readonly nodeAddr: Address,
        public readonly maxReadBlockNum: number,
        public readonly haveReadBlockNum: number
    ) {}

    public serializeHex(): string {
        return this.nodeAddr.serialize()
            + serializeUint64(this.maxReadBlockNum)
            + serializeUint64(this.haveReadBlockNum)
    }
}
