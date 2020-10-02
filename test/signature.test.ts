import {Signature, SignatureScheme} from "../src/crypto";

describe('test signature deserialization', () => {
    const signature128length = 'e5e723d37c01d3df7e48eb04b95070c302a84e3264174f5be6772d482c4495bb67cb8830dfe08aa600a1e54e0d8d97d67a5bec1d0c40a656f7491b4c82990009';
    const signature130length = '08' + signature128length;
    const defaultAlgorithm = SignatureScheme.ECDSAwithSHA256

    test('should deserialize signature with 128 length', () => {
        const deserialized = Signature.deserializeHex(signature128length);

        expect(deserialized.algorithm).toBe(defaultAlgorithm);
    });

    test('should deserialize signature with 130 length', () => {
        const deserialized = Signature.deserializeHex(signature130length);

        expect(deserialized.algorithm).toBe(SignatureScheme.ECDSAwithRIPEMD160);
    });
});
