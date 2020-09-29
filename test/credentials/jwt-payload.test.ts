import {VcPayload} from "../../src/credentials/vc-payload.class";
import {VerifiableCredential} from "../../src/credentials/verifiable-credential.class";
import {JwtPayload} from "../../src/credentials/jwt-payload.class";
import {VpPayload} from "../../src/credentials/vp-payload.class";
import {VerifiablePresentation} from "../../src/credentials/verifiable-presentation.class";

describe('test jwt payload serialization', () => {
    const issuer = "issuer_ontology_id";
    const subjectId = "unique_subject_id";
    const credentialSubject = {
        "id": subjectId,
        "isDriverLicenseValid": true
    };
    const verifiableCredential = new VerifiableCredential(
        ['DriverLicense'],
        issuer,
        credentialSubject
    );
    test('Should correctly go trough serialization process for verifiable credentials payload', () => {
        const vcPayload = new VcPayload(issuer, subjectId, Date.now(), verifiableCredential, new Date());

        const serialized = vcPayload.serialize();
        expect(_isNotEmpty(serialized)).toBeTruthy();

        const deserialized = JwtPayload.deserialize(serialized, VcPayload.payloadFromJson) as VcPayload;

        assertPayload(vcPayload, deserialized);
        expect(vcPayload.vc.issuer).toBe(deserialized.vc.issuer);
        expect(vcPayload.vc.type[0]).toBe(deserialized.vc.type[0]);
        expect(vcPayload.vc.type[1]).toBe(deserialized.vc.type[1]);
        expect(vcPayload.vc["@context"][0]).toBe(deserialized.vc["@context"][0]);
    });

    test('Should correctly go trough serialization process for verifiable presentation payload', () => {
     const verifiablePresentation = new VerifiablePresentation(["stringified_verifiable_credential"]);
     const vpPayload = new VpPayload(issuer, subjectId, Date.now(), verifiablePresentation, new Date());

     const serialized = vpPayload.serialize();
     expect(_isNotEmpty(serialized)).toBeTruthy();

     const deserialized = JwtPayload.deserialize(serialized, VpPayload.payloadFromJson) as VpPayload;

     assertPayload(vpPayload, deserialized);
     expect(vpPayload.vp.type[0]).toBe(deserialized.vp.type[0]);
     expect(vpPayload.vp.verifiableCredentials[0]).toBe(deserialized.vp.verifiableCredentials[0]);
     expect(vpPayload.vp["@context"][0]).toBe(deserialized.vp["@context"][0]);
    });
});

function assertPayload(jwtPayload: JwtPayload, deserialized: JwtPayload) {
    expect(jwtPayload.iss).toBe(deserialized.iss);
    expect(jwtPayload.exp).toBe(deserialized.exp);
    expect(jwtPayload.nbf).toBe(deserialized.nbf);
    expect(jwtPayload.iat).toBe(deserialized.iat);
    expect(jwtPayload.jti).toBe(deserialized.jti);
}

function _isNotEmpty(value: string): Boolean {
    return value.length > 0;
}
