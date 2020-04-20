import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { ReadPlan } from './readPlan';
import { serializeVarUint, serializeAddress, decodeVarBytes, decodeAddress, decodeVarUint } from './utils';

export class ReadPledge {
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


    static deserializeHex(hex: string): ReadPledge {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const downloader = decodeAddress(sr)
        const blockHeight = decodeVarUint(sr)
        const expireHeight = decodeVarUint(sr)
        const restMoney = decodeVarUint(sr)
        let readPlans: ReadPlan[] = []
        let count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            const plan = ReadPlan.deserializeHex(decodeVarBytes(sr))
            readPlans.push(plan)
        }
        return new ReadPledge(fileHash, downloader, blockHeight, expireHeight, restMoney, readPlans)
    }
}
