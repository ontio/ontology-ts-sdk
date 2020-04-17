import { hex2VarBytes, num2hexstring } from '../utils';

export function serializeUint64(num: number): string {
    return hex2VarBytes(num2hexstring(num, 8));
}
