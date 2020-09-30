import { JwtPayload } from './jwt-payload.class';
import { VerifiablePresentation } from './verifiable-presentation.class';

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
            json.iat,
            VerifiablePresentation.fromJson(json.vp),
            json.aud,
            json.jti,
            new Date(json.exp)
        );
    }

    aud?: string;
    vp: VerifiablePresentation;

    constructor(
        issuer: string,
        issuanceDate: number,
        verifiablePresentation: VerifiablePresentation,
        audience?: string,
        subject?: string,
        expirationDate?: Date
    ) {
        super(issuer, issuanceDate, subject, expirationDate);
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
