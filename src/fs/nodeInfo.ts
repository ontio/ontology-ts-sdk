import { Address } from '../crypto';
import { hexstr2str, num2VarInt, str2VarBytes, StringReader } from '../utils';
import { decodeAddress, decodeVarBytes, decodeVarUint, serializeUint64, serializeVarUint } from './utils';

export class FsNodeInfo {

    static deserializeHex(hex: string): FsNodeInfo {
        const sr: StringReader = new StringReader(hex);
        const pledge = decodeVarUint(sr);
        const profit = decodeVarUint(sr);
        const volume = decodeVarUint(sr);
        const restVol = decodeVarUint(sr);
        const serviceTime = decodeVarUint(sr);
        const minPdpInterval = decodeVarUint(sr);
        const nodeAddr = decodeAddress(sr);
        const nodeNetAddr = hexstr2str(decodeVarBytes(sr));
        return new FsNodeInfo(pledge, profit, volume, restVol, serviceTime,
            minPdpInterval, nodeAddr, nodeNetAddr);
    }
    public constructor(
        public readonly pledge: number,
        public readonly profit: number,
        public readonly volume: number,
        public readonly restVol: number,
        public readonly serviceTime: number,
        public readonly minPdpInterval: number,
        public readonly nodeAddr: Address,
        public readonly nodeNetAddr: string
    ) { }

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

    static deserializeHex(hex: string): FsNodeInfoList {
        const nodeInfos: FsNodeInfo[] = [];
        const sr: StringReader = new StringReader(hex);
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const nodeInfo = FsNodeInfo.deserializeHex(sr.readNextBytes());
            nodeInfos.push(nodeInfo);
        }
        const list = new FsNodeInfoList(nodeInfos);
        return list;
    }
    constructor(
        public readonly nodesInfo: FsNodeInfo[]
    ) { }

    public serializeHex(): string {
        let str = serializeVarUint(this.nodesInfo.length);
        for (const nodeInfo of this.nodesInfo) {
            const nodeInfoHex = nodeInfo.serializeHex();
            const hexLen = num2VarInt(nodeInfoHex.length / 2);
            str += hexLen + nodeInfoHex;
        }
        return str;
    }
}
