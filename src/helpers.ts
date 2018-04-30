/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as cryptoJS from 'crypto-js';
import * as base58 from 'bs58';
import { hexstring2ab, ab2hexstring} from './utils';
import { ADDR_VERSION } from './consts';

/**
 * Those methods were moved from core.ts to break the circular dependencies.
 */

export function getMultiSigUInt160() {
    //TODO
}

export function getSingleSigUInt160(publicKeyEncoded: string): string {
    var PkHexString = cryptoJS.enc.Hex.parse(publicKeyEncoded);
    var PkSha256 = cryptoJS.SHA256(PkHexString).toString();
    var PkRipemd160 = cryptoJS.RIPEMD160(cryptoJS.enc.Hex.parse(PkSha256)).toString();

    //for normal account
    return "01" + PkRipemd160.substr(2);
}

export function u160ToAddress(programhash: string): string {
    var data = ADDR_VERSION + programhash;

    var ProgramHexString = cryptoJS.enc.Hex.parse(data);
    var ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
    var ProgramSha256_2 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();
    var ProgramSha256Buffer = hexstring2ab(ProgramSha256_2);

    var datas = data + ProgramSha256_2.slice(0, 8);

    return base58.encode(hexstring2ab(datas));
};

export function addressToU160(addressEncoded : string) {
    let decoded = base58.decode(addressEncoded)
    let programHash = ab2hexstring(decoded).substr(2,40)
    let add58 = u160ToAddress(programHash)
    if(add58 !== addressEncoded) {
        throw new Error('[addressToU160] decode encodeed varify failed')
    }
    return programHash
}
