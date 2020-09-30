import * as b64 from "base64-url";

/**
 * Representation of JWT Payload according to W3C spec.
 */
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

    /**
     * Converts data to JSON for serialization.
     */
    protected abstract payloadToJSON(): any;

    /**
     * Serializes the payload into JWT format - Base64 encoded string.
     */
    serialize(): string {
        const stringified = JSON.stringify(this.payloadToJSON());

        return b64.encode(stringified, 'utf-8');
    }

    /**
     * Deserializes the payload from JWT format - Base64 encoded string.
     *
     * @param encoded - JWT encoded payload
     * @param mapFunction - function for mapping json to JwtPayload
     */
    static deserialize(encoded: string, mapFunction: (json: any) => JwtPayload): JwtPayload {
        const decoded = b64.decode(encoded);

        try {
            return mapFunction(JSON.parse(decoded));
        } catch (error) {
            throw new Error("Incorrect deserialization function for: " + decoded);
        }
    }
}
