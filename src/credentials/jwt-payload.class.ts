import * as b64 from "base64-url";
import {PayloadFactory, PayloadType} from "./payload-factory.class";

export abstract class JwtPayload {
    iss: string;
    jti: string;
    nbf: number;
    iat: number;
    exp: number;

    protected constructor(
        issuer: string,
        subject: string,
        issuanceDate: number,
        expirationDate: Date
    ) {
        this.iss = issuer;
        this.jti = subject;
        this.nbf = issuanceDate;
        this.iat = issuanceDate;
        this.exp = expirationDate.getTime();
    }

    protected abstract payloadToJSON(): any;

    serialize(): string {
        const stringified = JSON.stringify(this.payloadToJSON());

        return b64.encode(stringified, 'utf-8');
    }

    static deserialize(encoded: string, payloadType: PayloadType): JwtPayload {
        const decoded = b64.decode(encoded);

        return PayloadFactory.payloadFromJson(JSON.parse(decoded), payloadType);
    }
}
