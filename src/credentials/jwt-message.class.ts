import {JwtHeader} from "./jwt-header.class";
import {JwtPayload} from "./jwt-payload.class";
import {PrivateKey, PublicKeyStatus, Signature, SignatureScheme} from "../crypto";
import {now, str2hexstr} from "../utils";
import {extractOntId, retrievePublicKey, retrievePublicKeyState} from "../claim/message";
import {PayloadType} from "./payload-factory.class";

export class JwtMessage {
    jwtHeader: JwtHeader;
    jwtPayload: JwtPayload;
    signature?: Signature;

    constructor(
        jwtHeader: JwtHeader,
        jwtPayload: JwtPayload,
        signature: Signature | undefined
    ) {
        this.jwtHeader = jwtHeader;
        this.jwtPayload = jwtPayload;
        this.signature = signature;
    }

    public async sign(
        url: string,
        publicKeyId: string,
        privateKey: PrivateKey,
        algorithm?: SignatureScheme
    ): Promise<void> {
        await retrievePublicKey(publicKeyId, url);

        if (algorithm === undefined) {
            algorithm = privateKey.algorithm.defaultSchema;
        }

        const message = this.serializeUnsigned(algorithm, publicKeyId);
        this.signature = await privateKey.signAsync(str2hexstr(message), algorithm, publicKeyId);
    }

    public async verify(url: string): Promise<boolean> {
        const signature = this.signature;

        if (signature !== undefined && signature.publicKeyId !== undefined) {
            try {
                if (!this.verifyKeyOwnership()) {
                    return false;
                }

                if (!this.verifyExpiration()) {
                    return false;
                }

                const state = await retrievePublicKeyState(signature.publicKeyId, url);

                if (state === PublicKeyStatus.REVOKED) {
                    return false;
                }

                const publicKey = await retrievePublicKey(signature.publicKeyId, url);
                const msg = this.serializeUnsigned(signature.algorithm, signature.publicKeyId);
                const msgHex = str2hexstr(msg);
                return publicKey.verify(msgHex, signature);
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    public serialize(): string {
        const signature = this.signature;

        if (signature !== undefined) {
            const signatureEncoded = signature.serializeJWT();
            return this.serializeUnsigned(signature.algorithm, signature.publicKeyId) + '.' + signatureEncoded;
        } else {
            return this.serializeUnsigned();
        }
    }

    static deserializeVc(jwt: string): JwtMessage {
        return JwtMessage.deserialize(jwt, PayloadType.VC);
    }

    static deserializeVp(jwt: string): JwtMessage {
        return JwtMessage.deserialize(jwt, PayloadType.VP);
    }

    private static deserialize(jwt: string, payloadType: PayloadType): JwtMessage {
        const parts = jwt.split('.', 4);

        if (parts.length < 2) {
            throw new Error('Invalid message.');
        }

        const header = JwtHeader.deserialize(parts[0]);
        const payload = JwtPayload.deserialize(parts[1], payloadType);
        let signature: Signature | undefined;

        if (parts.length > 2) {
            if (header.alg !== undefined && header.kid !== undefined) {
                signature = Signature.deserializeJWT(parts[2], SignatureScheme.fromLabelJWS(header.alg), header.kid);
            } else {
                throw new Error('Signature scheme was not specified.');
            }
        }

        return new JwtMessage(header, payload, signature);
    }

    private serializeUnsigned(algorithm?: SignatureScheme, publicKeyId?: string): string {
        const headerEncoded = this.jwtHeader.serialize(algorithm, publicKeyId);
        const payloadEncoded = this.jwtPayload.serialize();

        return headerEncoded + '.' + payloadEncoded;
    }

    private verifyKeyOwnership(): boolean {
        const signature = this.signature;

        if (signature !== undefined && signature.publicKeyId !== undefined) {
            const ontId = extractOntId(signature.publicKeyId);

            return ontId === this.jwtPayload.iss;
        } else {
            return false;
        }
    }

    private verifyExpiration(): boolean {
        if (this.jwtPayload.exp !== undefined) {
            return now() < this.jwtPayload.exp;
        } else {
            return true;
        }
    }
}
