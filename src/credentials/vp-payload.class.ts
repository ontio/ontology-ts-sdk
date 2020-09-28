import {JwtPayload} from "./jwt-payload.class";
import {VerifiablePresentation} from "./verifiable-presentation.class";

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

    protected payloadToJSON(): any {}

    public static payloadFromJson(json: any): JwtPayload {
        throw new Error("Not implemented yet");
    }
}
