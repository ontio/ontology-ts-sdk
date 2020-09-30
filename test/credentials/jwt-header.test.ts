import { JwtHeader } from '../../src/credentials/jwt-header.class';
import { SignatureScheme } from '../../src/crypto';
import { isEqual } from './util-functions';

describe('test jwt header serialization', () => {
    test('should correctly go trough serialization process without argument', () => {
        const jwtHeader = new JwtHeader();

        const serialized = jwtHeader.serialize(undefined, undefined);
        expect(_isNotEmpty(serialized)).toBeTruthy()

        const deserialized = JwtHeader.deserialize(serialized);
        expect(isEqual(deserialized, jwtHeader)).toBeTruthy();
    });

    test('should correctly go trough serialization process with signature scheme', () => {
       const jwtHeader = new JwtHeader(SignatureScheme.ECDSAwithSHA256.labelJWS)

       const serialized = jwtHeader.serialize(SignatureScheme.ECDSAwithSHA256, undefined);
       expect(_isNotEmpty(serialized)).toBeTruthy()

       const deserialized = JwtHeader.deserialize(serialized);
       expect(isEqual(deserialized, jwtHeader)).toBeTruthy();
    });

    test('should correctly go trough serialization process with public key and schema', () => {
       const jwtHeader = new JwtHeader(SignatureScheme.ECDSAwithSHA256.labelJWS, 'public_key_id');

       const serialized = jwtHeader.serialize(SignatureScheme.ECDSAwithSHA256, 'public_key_id');
       expect(_isNotEmpty(serialized)).toBeTruthy()

       const deserialized = JwtHeader.deserialize(serialized);
       expect(isEqual(deserialized, jwtHeader)).toBeTruthy();
    });

    test('should correctly go trough serialization process with public key and without signature schema', () => {
        const jwtHeader = new JwtHeader();

        const serialized = jwtHeader.serialize(undefined,'public_key_id');
        expect(_isNotEmpty(serialized)).toBeTruthy()

        const deserialized = JwtHeader.deserialize(serialized);
        expect(isEqual(deserialized, jwtHeader)).toBeTruthy();
    })
});

function _isNotEmpty(value: string): Boolean {
    return value.length > 0;
}
