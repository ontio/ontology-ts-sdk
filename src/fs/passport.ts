import { Address, PublicKey, Signature, PrivateKey } from '../crypto';
import { serializeAddress, serializeVarUint } from './utils';
import { hex2VarBytes } from '../utils';

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
    ) { }

    public serialzieHex() {
        return serializeVarUint(this.blockHeight)
            + hex2VarBytes(this.blockHash)
            + serializeAddress(this.walletAddr)
            + hex2VarBytes(this.publicKey.serializeHex())
            + (this.signature ? hex2VarBytes(this.signature.value) : '00');
    }
}