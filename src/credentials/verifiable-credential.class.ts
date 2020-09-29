export class VerifiableCredential {
    '@context': string[];
    type: string[];
    issuer: string;
    credentialSubject: any;

    constructor(type: string[], issuer: string, credentialSubject: any, isDeserialized: boolean = false) {
        this['@context'] = ['https://www.w3.org/2018/credentials/v1'];
        this.type = isDeserialized ? type : [...['VerifiableCredential'], ...type] ;
        this.issuer = issuer;
        this.credentialSubject = credentialSubject;
    }

    public static fromJson(json: any): VerifiableCredential {
        return new VerifiableCredential(
            json.type,
            json.issuer,
            json.credentialSubject,
            true
        );
    }
}
