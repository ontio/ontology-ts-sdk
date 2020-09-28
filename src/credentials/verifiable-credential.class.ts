export class VerifiableCredential {
    '@context': string[];
    type: string[];
    issuer: string;
    credentialSubject: any;

    constructor(type: string, issuer: string, credentialSubject: any) {
        this['@context'] = ['https://www.w3.org/2018/credentials/v1'];
        this.type = ['VerifiableCredential', type];
        this.issuer = issuer;
        this.credentialSubject = credentialSubject;
    }
}
