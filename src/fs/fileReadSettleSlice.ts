import { Address, PrivateKey, PublicKey, Signature } from '../crypto';
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

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
    ) {}

    public verify(): boolean {
        if (!this.pubKey || !this.sig) {
            return false;
        }
        return this.pubKey.verify(this.serializeHexWithoutVerifyInfo(), this.sig);
    }

    public serializeHexWithoutVerifyInfo(): string {
        return hex2VarBytes(this.fileHash)
            + this.payFrom.serialize()
            + this.payTo.serialize()
            + serializeUint64(this.sliceId)
            + serializeUint64(this.pledgeHeight);
    }

    public serializeHex(): string {
        return this.serializeHexWithoutVerifyInfo()
            + (this.sig ? this.sig.serializeHex() : '0')
            + (this.pubKey ? this.pubKey.serializeHex() : '0');
    }
}