import { JwtPayload } from './jwt-payload.class';
import { VerifiablePresentationAttribute } from './verifiable-presentation-attribute.class';

/**
 * Representation of Verifiable Presentation Payload according to w3c spec.
 */
export class VpPayload extends JwtPayload {
    /**
     * Maps json into JwtPayload object.
     *
     * @param json - payload representation
     */
    public static payloadFromJson(json: any): JwtPayload {
        return new VpPayload(
            json.iss,
            VerifiablePresentationAttribute.fromJson(json.vp),
            json.iat,
            json.aud,
            json.jti,
            new Date(json.exp)
        );
    }

    aud?: string;
    vp: VerifiablePresentationAttribute;

    constructor(
        issuer: string,
        verifiablePresentation: VerifiablePresentationAttribute,
        issuanceDate?: number,
        audience?: string,
        verifiableAttributeId?: string,
        expirationDate?: Date
    ) {
        super(issuer, issuanceDate, verifiableAttributeId, expirationDate);
        this.aud = audience;
        this.vp = verifiablePresentation;
    }

    protected payloadToJSON(): any {
        return {
            iss: this.iss,
            jti: this.jti,
            aud: this.aud,
            nbf: this.nbf,
            iat: this.iat,
            exp: this.exp,
            vp: this.vp
        };
    }
}
