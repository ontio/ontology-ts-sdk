import { Address } from '../crypto';
import { hex2VarBytes } from '../utils';
import { ReadPlan } from './readPlan';
import { serializeUint64 } from './utils';

export class ReadPledge {
    public constructor(
        public readonly fileHash: string,
        public readonly downloader: Address,
        public readonly blockHeight: number,
        public readonly expireHeight: number,
        public readonly restMoney: number,
        public readonly readPlans: ReadPlan[]
    ) {}

    public serializeHex(): string {
        let str = '';
        str += hex2VarBytes(this.fileHash)
            + this.downloader.serialize()
            + serializeUint64(this.blockHeight)
            + serializeUint64(this.expireHeight)
            + serializeUint64(this.restMoney)
            + serializeUint64(this.readPlans.length);

        for (const readPlan of this.readPlans) {
            str += hex2VarBytes(readPlan.serializeHex());
        }

        return str;
    }
}
