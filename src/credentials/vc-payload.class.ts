import { JwtPayload } from './jwt-payload.class';
import { VerifiableCredentialAttribute } from './verifiable-credential-attribute.class';

/**
 * Representation of Verifiable Credential Payload according to w3c spec.
 */
export class VcPayload extends JwtPayload {
    /**
     * Maps json into JwtPayload object.
     *
     * @param json - payload representation
     */
    public static payloadFromJson(json: any): JwtPayload  {
        return new VcPayload(
            json.iss,
            VerifiableCredentialAttribute.fromJson(json.vc),
            json.iat,
            json.jti,
            new Date(json.exp)
        );
    }

    sub?: string;
    vc: VerifiableCredentialAttribute;

    constructor(
        issuer: string,
        verifiableCredential: VerifiableCredentialAttribute,
        issuanceDate?: number,
        verifiableAttributeId?: string,
        expirationDate?: Date
    ) {
        super(issuer, issuanceDate, verifiableAttributeId, expirationDate);
        this.sub = verifiableAttributeId;
        this.vc = verifiableCredential;
    }

    protected payloadToJSON(): any {
        return {
            iss: this.iss,
            sub: this.sub,
            exp: this.exp,
            nbf: this.nbf,
            iat: this.iat,
            jti: this.jti,
            vc: this.vc
        };
    }
}
