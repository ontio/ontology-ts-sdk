import {JwtPayload} from "../../src/credentials/jwt-payload.class";

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
