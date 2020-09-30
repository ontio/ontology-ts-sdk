import {JwtPayload} from "./jwt-payload.class";
import {VerifiableCredential} from "./verifiable-credential.class";

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
            json.jti,
            json.iat,
            VerifiableCredential.fromJson(json.vc),
            new Date(json.exp)
        );
    }

    sub: string;
    vc: VerifiableCredential

    constructor(
        issuer: string,
        subject: string,
        issuanceDate: number,
        verifiableCredential: VerifiableCredential,
        expirationDate: Date
    ) {
        super(issuer, subject, issuanceDate, expirationDate);
        this.sub = subject;
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
        }
    }
}
