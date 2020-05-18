import * as Long from 'long';
import { writeVarBytes } from '../../../transaction/scriptBuilder';
import { bigIntToBytes, str2hexstr } from '../../../utils';

export class Signer {
    id: string;
    index: number;

    public constructor(id: string, index: number) {
        this.id = id;
        this.index = index;
    }

    public serialize(): string {
        let result = '';
        result += writeVarBytes(str2hexstr(this.id));
        const bi = bigIntToBytes(Long.fromNumber(this.index));
        result += writeVarBytes(bi);
        return result;
    }
}

export function serializeSigners(signers: Signer[]): string {
    let result = '';
    const length = bigIntToBytes(Long.fromNumber(signers.length));
    result += writeVarBytes(length);
    for (const s of signers) {
        result += s.serialize();
    }
    return result;
}
