import { decode, encode } from 'base64-url';

/**
 * Representation of JWT Payload according to W3C spec.
 */
export abstract class JwtPayload {
    /**
     * Deserializes the payload from JWT format - Base64 encoded string.
     *
     * @param encoded - JWT encoded payload
     * @param mapFunction - function for mapping json to JwtPayload
     */
    static deserialize(encoded: string, mapFunction: (json: any) => JwtPayload): JwtPayload {
        const decoded = decode(encoded);

        try {
            return mapFunction(JSON.parse(decoded));
        } catch (error) {
            throw new Error('Incorrect deserialization function for: ' + decoded);
        }
    }

    iss: string;
    jti?: string;
    nbf: number;
    iat?: number;
    exp?: number;

    protected constructor(
        issuer: string,
        issuanceDate: number,
        subjectId?: string,
        expirationDate?: Date
    ) {
        this.iss = issuer;
        this.jti = subjectId;
        this.nbf = issuanceDate;
        this.iat = issuanceDate ?? Date.now();
        this.exp = expirationDate?.getTime();
    }

    /**
     * Serializes the payload into JWT format - Base64 encoded string.
     */
    public serialize(): string {
        const stringified = JSON.stringify(this.payloadToJSON());

        return encode(stringified, 'utf-8');
    }

    /**
     * Converts data to JSON for serialization.
     */
    protected abstract payloadToJSON(): any;
}
// q: jti should be mandatory for VC and optional for VP ?
// jti - MUST represent the id property of the verifiable credential or verifiable presentation
// nbf - represent issuanceDate which MUST be
