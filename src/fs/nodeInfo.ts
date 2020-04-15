import { Address } from '../crypto';
import { str2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class FsNodeInfo {
    public constructor(
        public readonly pledge: number,
        public readonly profit: number,
        public readonly volume: number,
        public readonly restVol: number,
        public readonly serviceTime: number,
        public readonly minPdpInterval: number,
        public readonly nodeAddr: Address,
        public readonly nodeNetAddr: string
    ) {}

    static deserializeHex() {

    }

    public serializeHex(): string {
        let str = '';
        str += serializeUint64(this.pledge)
            + serializeUint64(this.profit)
            + serializeUint64(this.volume)
            + serializeUint64(this.restVol)
            + serializeUint64(this.minPdpInterval)
            + this.nodeAddr.serialize()
            + str2VarBytes(this.nodeNetAddr);
        return str;
    }
}

export class FsNodeInfoList {
    constructor(
        public readonly nodesInfo: FsNodeInfo[]
    ) {}

    serialzieHex() {
        
    }
}
