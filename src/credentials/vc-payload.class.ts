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

    protected payloadToJSON(): any {}

    public static payloadFromJson(json: any): JwtPayload  {
        throw new Error("Not implemented yet");
    }
}
