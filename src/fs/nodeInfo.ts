import { Address } from '../crypto';
import { str2VarBytes, StringReader, hexstr2str, num2VarInt } from '../utils';
import { serializeUint64, decodeVarUint, decodeVarBytes, decodeAddress, serializeVarUint } from './utils';

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
    ) { }

    static deserializeHex(hex: string): FsNodeInfo {
        let sr: StringReader = new StringReader(hex)
        const pledge = decodeVarUint(sr)
        const profit = decodeVarUint(sr)
        const volume = decodeVarUint(sr)
        const restVol = decodeVarUint(sr)
        const serviceTime = decodeVarUint(sr)
        const minPdpInterval = decodeVarUint(sr)
        const nodeAddr = decodeAddress(sr)
        const nodeNetAddr = hexstr2str(decodeVarBytes(sr))
        return new FsNodeInfo(pledge, profit, volume, restVol, serviceTime,
            minPdpInterval, nodeAddr, nodeNetAddr)
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
    ) { }

    static deserializeHex(hex: string): FsNodeInfoList {
        let nodeInfos: FsNodeInfo[] = []
        let sr: StringReader = new StringReader(hex)
        const count = decodeVarUint(sr)
        for (let i = 0; i < count; i++) {
            let nodeInfo = FsNodeInfo.deserializeHex(sr.readNextBytes())
            nodeInfos.push(nodeInfo)
        }
        let list = new FsNodeInfoList(nodeInfos)
        return list
    }

    public serializeHex(): string {
        let str = serializeVarUint(this.nodesInfo.length);
        for (const nodeInfo of this.nodesInfo) {
            const nodeInfoHex = nodeInfo.serializeHex()
            const hexLen = num2VarInt(nodeInfoHex.length / 2)
            str += hexLen + nodeInfoHex;
        }
        return str;
    }
}
