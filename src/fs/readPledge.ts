import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { ReadPlan } from './readPlan';
import { decodeAddress, decodeVarBytes, decodeVarUint, serializeAddress, serializeVarUint } from './utils';

export class ReadPledge {
    static deserializeHex(hex: string): ReadPledge {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const downloader = decodeAddress(sr);
        const blockHeight = decodeVarUint(sr);
        const expireHeight = decodeVarUint(sr);
        const restMoney = decodeVarUint(sr);
        const readPlans: ReadPlan[] = [];
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const plan = ReadPlan.deserializeHex(decodeVarBytes(sr));
            readPlans.push(plan);
        }
        return new ReadPledge(fileHash, downloader, blockHeight, expireHeight, restMoney, readPlans);
    }
    public constructor(
        public readonly fileHash: string,
        public readonly downloader: Address,
        public readonly blockHeight: number,
        public readonly expireHeight: number,
        public readonly restMoney: number,
        public readonly readPlans: ReadPlan[]
    ) { }

    public serializeHex(): string {
        let str = '';
        str += hex2VarBytes(this.fileHash)
            + serializeAddress(this.downloader)
            + serializeVarUint(this.blockHeight)
            + serializeVarUint(this.expireHeight)
            + serializeVarUint(this.restMoney)
            + serializeVarUint(this.readPlans.length);

        for (const readPlan of this.readPlans) {
            str += hex2VarBytes(readPlan.serializeHex());
        }

        return str;
    }
}
