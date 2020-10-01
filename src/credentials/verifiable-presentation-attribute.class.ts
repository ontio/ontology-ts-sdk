/**
 * Representation of Verifiable Presentation according to w3c spec.
 */
export class VerifiablePresentationAttribute {
    /**
     * Maps json into VerifiablePresentation object.
     *
     * @param json - verifiable-presentation representation
     */
    public static fromJson(json: any): VerifiablePresentationAttribute {
        return new VerifiablePresentationAttribute(
            json.verifiableCredentials
        );
    }

    '@context': string[];
    type: string[];
    verifiableCredentials: string[];

    constructor(verifiableCredentials: string[]) {
        this['@context'] = ['https://www.w3.org/2018/credentials/v1'];
        this.type = ['VerifiablePresentation'];
        this.verifiableCredentials = verifiableCredentials;
    }
}
