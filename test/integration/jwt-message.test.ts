import { VerifiableCredentialAttribute } from '../../src/credentials/verifiable-credential-attribute.class';
import { VcPayload } from '../../src/credentials/vc-payload.class';
import { JwtMessage } from '../../src/credentials/jwt-message.class';
import { JwtHeader } from '../../src/credentials/jwt-header.class';
import { _isNotEmpty, assertPayload } from '../unit/util-functions';
import { Address, PrivateKey } from '../../src/crypto';
import { Identity } from '../../src';
import {TEST_ONT_URL} from "../../src/consts";

describe('test jwt message functionality', () => {
    const restUrl = TEST_ONT_URL.REST_URL;
    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const address = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
    const ontologyDid = 'did:ont:' + address.value;
    const identity = Identity.create(privateKey, '123456', '');
    const publicKeyId = identity.ontid + '#keys-1'

    const verifiableAttributeId = "unique_subject_id";
    const credentialSubject = {
        "id": verifiableAttributeId,
        "isDriverLicenseValid": true
    };
    const verifiableCredentialAttribute = new VerifiableCredentialAttribute(
        ['DriverLicense'],
        ontologyDid,
        credentialSubject
    );
    const vcPayload = new VcPayload(ontologyDid, verifiableCredentialAttribute, new Date(2018, 12).getTime(), verifiableAttributeId, new Date(2022, 12));

    test('Should correctly go trough serialization process', async () => {
        const jwtMessage = new JwtMessage(new JwtHeader(), vcPayload, undefined);

        await jwtMessage.sign(
            restUrl,
            publicKeyId,
            privateKey
        );

        const serialized = jwtMessage.serialize();
        expect(_isNotEmpty(serialized)).toBeTruthy();

        const deserialized = JwtMessage.deserializeVc(serialized);

        expect(deserialized.jwtHeader.typ).toBe('JWT');
        expect(deserialized.jwtHeader.kid).toBeDefined();
        expect(deserialized.jwtHeader.alg).toBeDefined();

        assertPayload(vcPayload, deserialized.jwtPayload);
        expect(jwtMessage.signature).toBeDefined();
    });

    test('Should correctly go trough signing process', async ()  => {
        const jwtMessage = new JwtMessage(new JwtHeader(), vcPayload, undefined);

        await assertJwtMessage(jwtMessage, true);
    });

    test('Should return false for verifying verifiable credential with outdated expiration date', async () => {
        const outdatedVcPayload = new VcPayload(ontologyDid, verifiableCredentialAttribute, Date.now(), verifiableAttributeId, new Date(2018, 12));
        const jwtMessage = new JwtMessage(new JwtHeader(), outdatedVcPayload, undefined);

        await assertJwtMessage(jwtMessage, false);
    });

    test('Should return false for verifying verifiable credential with future issuance date', async () => {
        const futureVcPayload = new VcPayload(ontologyDid, verifiableCredentialAttribute, new Date(2020, 11).getTime(), verifiableAttributeId, new Date(2020, 12));
        const jwtMessage = new JwtMessage(new JwtHeader(), futureVcPayload, undefined);

        await assertJwtMessage(jwtMessage, false);
    });

    test('Should throw error for serializing message without signature', () => {
        const jwtMessage = new JwtMessage(new JwtHeader(), vcPayload, undefined);

        expect(function () {jwtMessage.serialize()}).toThrow('Cannot serialize message without present signature');
    })

    async function assertJwtMessage(jwtMessage: JwtMessage, expectedVerifyResult: boolean): Promise<void> {
        await jwtMessage.sign(
            restUrl,
            publicKeyId,
            privateKey
        );
        expect(jwtMessage.signature).toBeDefined();
        expect(jwtMessage.signature!!.publicKeyId).toBeDefined();
        expect(jwtMessage.signature!!.publicKeyId).toBe(publicKeyId);

        const isVerified = await jwtMessage.verify(restUrl);
        expect(isVerified).toBe(expectedVerifyResult);
    }
});



