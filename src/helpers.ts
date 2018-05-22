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

import * as base58 from 'bs58';
import * as cryptoJS from 'crypto-js';
import * as secureRandom from 'secure-random';
import { ADDR_VERSION } from './consts';
import { ab2hexstring, hexstring2ab } from './utils';

/**
 * Those methods were moved from core.ts to break the circular dependencies.
 */

export function getMultiSigUInt160() {
    // TODO
}

export function getSingleSigUInt160(publicKeyEncoded: string): string {
    const PkHexString = cryptoJS.enc.Hex.parse(publicKeyEncoded);
    const PkSha256 = cryptoJS.SHA256(PkHexString).toString();
    const PkRipemd160 = cryptoJS.RIPEMD160(cryptoJS.enc.Hex.parse(PkSha256)).toString();

    // for normal account
    return '01' + PkRipemd160.substr(2);
}

export function u160ToAddress(programhash: string): string {
    const data = ADDR_VERSION + programhash;

    const ProgramHexString = cryptoJS.enc.Hex.parse(data);
    const ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
    const ProgramSha2562 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();

    const datas = data + ProgramSha2562.slice(0, 8);

    return base58.encode(hexstring2ab(datas));
}

export function addressToU160(addressEncoded: string) {
    const decoded = base58.decode(addressEncoded);
    const programHash = ab2hexstring(decoded).substr(2, 40);
    const add58 = u160ToAddress(programHash);
    if (add58 !== addressEncoded) {
        throw new Error('[addressToU160] decode encodeed varify failed');
    }
    return programHash;
}

export function sha256(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const sha = cryptoJS.SHA256(hex).toString();
    return sha;
}

export function ripemd160(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const ripemd = cryptoJS.RIPEMD160(hex).toString();
    return ripemd;
}

export function hash160(SignatureScript: string): string {
    return ripemd160(sha256(SignatureScript));
}

export function generateRandomArray(len: number): ArrayBuffer {
    return secureRandom(len);
}

export function generateOntid(nonce: string) {
    const programHash = getSingleSigUInt160(nonce);
    const ontid = 'did:ont:' + u160ToAddress(programHash);
    return ontid;
}
