import { Address, PrivateKey, PublicKey, Signature } from '../crypto';
import { serializeVarUint, serializeAddress, decodeVarBytes, decodeAddress, decodeVarUint } from './utils';
import { hex2VarBytes, StringReader } from '../utils'
export class FileReadSettleSlice {
    static genFileReadSettleSlice(
        fileHash: string,
        payTo: Address,
        sliceId: number,
        pledgeHeight: number,
        privateKey: PrivateKey
    ): FileReadSettleSlice {
        const pubKey = privateKey.getPublicKey();
        const payFrom = Address.fromPubKey(pubKey);
        const settleSlice = new FileReadSettleSlice(fileHash, payFrom, payTo, sliceId, pledgeHeight);
        const signData = privateKey.sign(settleSlice.serializeHex());
        settleSlice.sig = signData;
        settleSlice.pubKey = pubKey;
        return settleSlice;
    }

    public constructor(
        public readonly fileHash: string,
        public readonly payFrom: Address,
        public readonly payTo: Address,
        public readonly sliceId: number,
        public readonly pledgeHeight: number,
        public sig?: Signature,
        public pubKey?: PublicKey
    ) { }

    public verify(): boolean {
        if (!this.pubKey || !this.sig) {
            return false;
        }
        return this.pubKey.verify(this.serializeHexWithoutVerifyInfo() + '00' + '00', this.sig);
    }

    public serializeHexWithoutVerifyInfo(): string {
        return hex2VarBytes(this.fileHash)
            + serializeAddress(this.payFrom)
            + serializeAddress(this.payTo)
            + serializeVarUint(this.sliceId)
            + serializeVarUint(this.pledgeHeight)
    }

    public serializeHex(): string {
        return this.serializeHexWithoutVerifyInfo()
            + (this.sig ? hex2VarBytes(this.sig.value) : '00')
            + (this.pubKey ? this.pubKey.serializeHex() : '00');
    }
    static deserializeHex(hex: string): FileReadSettleSlice {
        let sr: StringReader = new StringReader(hex)
        const fileHash = decodeVarBytes(sr)
        const payFrom = decodeAddress(sr)
        const payTo = decodeAddress(sr)
        const sliceId = decodeVarUint(sr)
        const pledgeHeight = decodeVarUint(sr)
        const sigHex = decodeVarBytes(sr)
        const pubKeyHex = decodeVarBytes(sr)
        const sig = Signature.deserializeHex(sigHex)
        const pubKey = PublicKey.deserializeHex(new StringReader(pubKeyHex))
        return new FileReadSettleSlice(fileHash, payFrom, payTo, sliceId, pledgeHeight,
            sig, pubKey)
    }
}