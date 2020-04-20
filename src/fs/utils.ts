import { Address } from '../crypto/address';
import { hex2VarBytes, num2hexstring, reverseHex, StringReader } from '../utils';
export function serializeUint64(num: number): string {
    return hex2VarBytes(num2hexstring(num, 8));
}

export function serializeVarUint(num: number): string {
    let hex = '';
    if (num < 0xfd) {
        hex = num2hexstring(num);
    } else if (num <= 0xffff) {
        // uint16
        hex = num2hexstring(num, 2, true);
    } else if (num <= 0xffffffff) {
        // uint32
        hex = num2hexstring(num, 4, true);
    } else {
        // uint64
        hex = num2hexstring(num, 8, true);
    }
    if (hex === '00') {
        return hex;
    }
    return hex2VarBytes(hex);
}

export function serializeAddress(addr: Address): string {
    return hex2VarBytes(addr.serialize());
}

export function serializeBool(bool: boolean): string {
    return bool ? '01' : '00';
}

export function decodeBool(sr: StringReader): boolean {
    return sr.readBoolean();
}

export function decodeVarBytes(sr: StringReader): string {
    return sr.readNextBytes();
}

export function decodeVarUint(sr: StringReader): number {
    const nextBytes = sr.readNextBytes();
    if (nextBytes === '') {
        return 0;
    }
    const hex = reverseHex(nextBytes);
    return parseInt(hex, 16);
}

export function decodeAddress(sr: StringReader): Address {
    const nextBytes = sr.readNextBytes();
    if (nextBytes === '') {
        return new Address('');
    }
    const addr = new Address(nextBytes);
    return addr;
}
