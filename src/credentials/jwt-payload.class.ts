import * as b64 from "base64-url";

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

    static deserialize(encoded: string, deserializeFunction: (decoded: any) => JwtPayload): JwtPayload {
        const decoded = b64.decode(encoded);

        try {
            return deserializeFunction(JSON.parse(decoded));
        } catch (error) {
            throw new Error("Incorrect deserialization function for: " + decoded);
        }
    }
}
