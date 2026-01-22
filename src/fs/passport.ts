import { Address, PrivateKey, PublicKey, Signature } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import { serializeAddress, serializeVarUint } from './utils';
import { decodeAddress, decodeVarBytes, decodeVarUint } from './utils';

export class Passport {

    static genPassport(
        height: number,
        blockHash: string,
        privateKey: PrivateKey
    ): Passport {
        const publicKey = privateKey.getPublicKey();
        const walletAddr = Address.fromPubKey(publicKey);
        const passport = new Passport(height, blockHash, walletAddr, publicKey);
        const signData = privateKey.sign(passport.serializeHex());
        passport.signature = signData;
        return passport;
    }
    static deserializeHex(hex: string): Passport {
        const sr: StringReader = new StringReader(hex);
        const blockHeight = decodeVarUint(sr);
        const blockHash = decodeVarBytes(sr);
        const walletAddr = decodeAddress(sr);
        const pubKeyHex = decodeVarBytes(sr);
        const sigHex = decodeVarBytes(sr);
        const sig = Signature.deserializeHex(sigHex);
        const pubKey = PublicKey.deserializeHex(new StringReader(pubKeyHex));
        return new Passport(blockHeight, blockHash, walletAddr, pubKey, sig);
    }

    public constructor(
        public readonly blockHeight: number,
        public readonly blockHash: string,
        public readonly walletAddr: Address,
        public readonly publicKey: PublicKey,
        public signature?: Signature
    ) { }

    public serializeHex() {
        return serializeVarUint(this.blockHeight)
            + hex2VarBytes(this.blockHash)
            + serializeAddress(this.walletAddr)
            + hex2VarBytes(this.publicKey.serializeHex())
            + (this.signature ? hex2VarBytes(this.signature.value) : '00');
    }
}
