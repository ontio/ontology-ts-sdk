import {JwtPayload} from "./jwt-payload.class";
import {VerifiablePresentation} from "./verifiable-presentation.class";

/**
 * Representation of Verifiable Presentation Payload according to w3c spec.
 */
export class VpPayload extends JwtPayload {
    vp: VerifiablePresentation;

    constructor(
        issuer: string,
        subject: string,
        issuanceDate: number,
        verifiablePresentation: VerifiablePresentation,
        expirationDate: Date
    ) {
        super(issuer, subject, issuanceDate, expirationDate);
        this.vp = verifiablePresentation;
    }

    protected payloadToJSON(): any {
        return {
            iss: this.iss,
            jti: this.jti,
            nbf: this.nbf,
            iat: this.iat,
            exp: this.exp,
            vp: this.vp
        }
    }

    /**
     * Maps json into JwtPayload object.
     *
     * @param json - payload representation
     */
    public static payloadFromJson(json: any): JwtPayload {
        return new VpPayload(
            json.iss,
            json.jti,
            json.iat,
            VerifiablePresentation.fromJson(json.vp),
            new Date(json.exp)
        );
    }
}
