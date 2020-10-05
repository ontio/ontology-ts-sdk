/**
 * Representation of Verifiable Credential according to w3c spec.
 */
export class VerifiableCredentialAttribute {
    /**
     * Maps json into VerifiableCredential object.
     *
     * @param json - verifiable-credential representation
     */
    public static fromJson(json: any): VerifiableCredentialAttribute {
        return new VerifiableCredentialAttribute(
            json.type,
            json.issuer,
            json.credentialSubject,
        );
    }

    '@context': string[];
    type: string[];
    issuer: string;
    credentialSubject: any;

    constructor(type: string[], issuer: string, credentialSubject: any) {
        this['@context'] = ['https://www.w3.org/2018/credentials/v1'];
        this.type = type.includes('VerifiableCredential') ? type : [...['VerifiableCredential'], ...type] ;
        this.issuer = issuer;
        this.credentialSubject = credentialSubject;
    }
}
