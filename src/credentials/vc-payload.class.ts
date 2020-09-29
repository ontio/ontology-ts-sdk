import {JwtPayload} from "./jwt-payload.class";
import {VerifiableCredential} from "./verifiable-credential.class";

export class VcPayload extends JwtPayload {
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

    public static payloadFromJson(json: any): JwtPayload  {
        return new VcPayload(
            json.iss,
            json.jti,
            json.iat,
            VerifiableCredential.fromJson(json.vc),
            new Date(json.exp)
        );
    }
}
