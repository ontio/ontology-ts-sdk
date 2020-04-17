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
        settleSlice.signature = signData;
        settleSlice.publicKey = pubKey;
        return settleSlice;
    }

    public constructor(
        public readonly fileHash: string,
        public readonly payFrom: Address,
        public readonly payTo: Address,
        public readonly sliceId: number,
        public readonly pledgeHeight: number,
        public signature?: Signature,
        public publicKey?: PublicKey
    ) {}

    public verify(): boolean {
        if (!this.publicKey || !this.signature) {
            return false;
        }
        return this.publicKey.verify(this.serializeHexWithoutVerifyInfo(), this.signature);
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
            + (this.signature ? this.signature.serializeHex() : '0')
            + (this.publicKey ? this.publicKey.serializeHex() : '0');
    }
}
