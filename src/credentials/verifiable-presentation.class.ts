export class VerifiablePresentation {
    '@context': string[];
    type: string[];
    verifiableCredentials: string[];

    constructor(verifiableCredentials: string[]) {
        this['@context'] = ['https://www.w3.org/2018/credentials/v1'];
        this.type = ['VerifiablePresentation'];
        this.verifiableCredentials = verifiableCredentials;
    }

    public static fromJson(json: any): VerifiablePresentation {
        return new VerifiablePresentation(
            json.verifiableCredentials
        );
    }
}
