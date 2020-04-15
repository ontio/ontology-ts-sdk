import { Address, PrivateKey, PublicKey, Signature } from '../crypto';
import { str2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class Passport {

    static genPassport(
        height: number,
        blockHash: string,
        privateKey: PrivateKey
    ): Passport {
        const publicKey = privateKey.getPublicKey();
        const walletAddr = Address.fromPubKey(publicKey);
        const passport = new Passport(height, blockHash, walletAddr, publicKey);
        const signData = privateKey.sign(passport.serialzieHex());
        passport.signature = signData;
        return passport;
    }

    public constructor(
        public readonly blockHeight: number,
        public readonly blockHash: string,
        public readonly walletAddr: Address,
        public readonly publicKey: PublicKey,
        public signature?: Signature
    ) {}

    public serialzieHex() {
        return serializeUint64(this.blockHeight)
            + str2VarBytes(this.blockHash)
            + this.walletAddr.serialize()
            + this.publicKey.serializeHex()
            + (this.signature ? this.signature.serializeHex() : '0');
    }
}