import { VerifiableCredential } from '../../src/credentials/verifiable-credential.class';
import { VcPayload } from '../../src/credentials/vc-payload.class';
import { JwtMessage } from '../../src/credentials/jwt-message.class';
import { JwtHeader } from '../../src/credentials/jwt-header.class';
import { _isNotEmpty, assertPayload } from './util-functions';
import { Address, PrivateKey } from '../../src/crypto';
import { Identity } from '../../src';

describe('test jwt message functionality', () => {
    const restUrl = 'http://polaris1.ont.io:20334';
    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const address = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
    const ontologyDid = 'did:ont:' + address.value;
    const identity = Identity.create(privateKey, '123456', '');
    const publicKeyId = identity.ontid + '#keys-1'

    const subjectId = "unique_subject_id";
    const credentialSubject = {
        "id": subjectId,
        "isDriverLicenseValid": true
    };
    const verifiableCredential = new VerifiableCredential(
        ['DriverLicense'],
        ontologyDid,
        credentialSubject
    );
    const vcPayload = new VcPayload(ontologyDid, Date.now(), verifiableCredential, subjectId, new Date());

    test('Should correctly go trough serialization process', () => {
        const jwtMessage = new JwtMessage(new JwtHeader(), vcPayload, undefined);

        const serialized = jwtMessage.serialize();
        expect(_isNotEmpty(serialized)).toBeTruthy();

        const deserialized = JwtMessage.deserializeVc(serialized);

        expect(deserialized.jwtHeader.typ).toBe('JWT');
        expect(deserialized.jwtHeader.kid).toBeUndefined();
        expect(deserialized.jwtHeader.alg).toBeUndefined();

        assertPayload(vcPayload, deserialized.jwtPayload);
        expect(jwtMessage.signature).toBeUndefined();
    });

    test('Should correctly go trough signing process', async ()  => {
        const jwtMessage = new JwtMessage(new JwtHeader(), vcPayload, undefined);

        await jwtMessage.sign(
            restUrl,
            publicKeyId,
            privateKey
        );
        expect(jwtMessage.signature).toBeDefined();
        expect(jwtMessage.signature!!.publicKeyId).toBeDefined();
        expect(jwtMessage.signature!!.publicKeyId).toBe(publicKeyId);

        const isVerified = await jwtMessage.verify(restUrl);
        expect(isVerified).toBeTruthy();
    });
});

