import { JwtPayload } from '../../src/credentials/jwt-payload.class';

export function assertPayload(jwtPayload: JwtPayload, deserialized: JwtPayload) {
    expect(jwtPayload.iss).toBe(deserialized.iss);
    expect(jwtPayload.exp).toBe(deserialized.exp);
    expect(jwtPayload.nbf).toBe(deserialized.nbf);
    expect(jwtPayload.iat).toBe(deserialized.iat);
    expect(jwtPayload.jti).toBe(deserialized.jti);
}

export function _isNotEmpty(value: string): Boolean {
    return value.length > 0;
}

export function isEqual(a: any, b: any) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}
