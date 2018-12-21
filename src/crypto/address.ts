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
import * as base58 from 'base-58';
import * as cryptoJS from 'crypto-js';
import { ADDR_VERSION } from '../consts';
import { ERROR_CODE } from '../error';
import opcode from '../transaction/opcode';
import { comparePublicKeys, programFromPubKey, pushBigInt } from '../transaction/program';
import { pushHexString } from '../transaction/scriptBuilder';
import { ab2hexstring, hash160, num2hexstring, sha256, StringReader } from '../utils';
import { reverseHex } from './../utils';
import { PublicKey } from './PublicKey';

/**
 * Representation of Address.
 *
 * There are 4 types of address:
 * 1. Public key based
 * 2. Multi public key based (m, n)
 * 3. Contract based
 * 4. ONT ID based
 *
 * The value is stored as base58 or hex encoded, therefore always use
 * toBase58() or serialize() according to requirements.
 */
export class Address {
    static deserialize(sr: StringReader): Address {
        return new Address(sr.read(20));
    }
    /**
     * Generates public key based address.
     *
     * @param publicKey Public key to use
     */
    static fromPubKey(publicKey: PublicKey): Address {
        const program = programFromPubKey(publicKey);
        // const program = publicKey.key + num2hexstring(opcode.CHECKSIG);
        const programHash = hash160(program);
        return new Address(programHash);
    }

    /**
     * Generates identity based address.
     * @param ontid ONT ID in the form did:ont:AXmQDzzvpEtPkNwBEFsREzApTTDZFW6frD
     */
    static fromOntid(ontid: string): Address {
        const address = ontid.substr(8);
        return new Address(address);
    }

    /**
     * Generates address from smart contract code.
     *
     * @param vmCode Hex encoded smart contract code
     */
    static fromVmCode(vmCode: string): Address {
        const programHash = hash160(vmCode);
        // programHash = num2hexstring(vmType) + programHash.substring(2);
        return new Address(programHash);
    }

    /**
     * Generates (m, n) threshold address.
     *
     * m - threshold
     * n - total number of public keys
     *
     * @param m The threshold
     * @param publicKeys Public key
     */
    static fromMultiPubKeys(m: number, publicKeys: PublicKey[]): Address {
        const n = publicKeys.length;

        if (m <= 0 || m > n || n > 24 ) {
            throw ERROR_CODE.INVALID_PARAMS;
        }

        // const pkHexStrs = publicKeys.map((p) => p.serializeHex());
        // pkHexStrs.sort();
        publicKeys.sort(comparePublicKeys);
        let result = '';
        result += pushBigInt(m);
        for (const s of publicKeys) {
            result += pushHexString(s.serializeHex());
        }
        result += pushBigInt(n);
        result += num2hexstring(opcode.CHECKMULTISIG);
        const programHash = hash160(result);
        return new Address(programHash);
    }

    /**
     * Deterministicaly generates ONT ID from this public key.
     */
    static generateOntid(publicKey: PublicKey): string {
        const address = Address.fromPubKey(publicKey);
        const ontid = 'did:ont:' + address.toBase58();

        return ontid;
    }

    /**
     * Base58 or Hex encoded address
     */
    value: string;

    constructor(value: string) {
        if (value.length === 40 || value.length === 34) {
            this.value = value;
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }

    /**
     * Gets Base58 encoded representation of the address.
     */
    toBase58() {
        if (this.value.length === 34) {
            return this.value;
        } else {
            return hexToBase58(this.value);
        }
    }

    /**
     * Gets Hex encoded representation of the address.
     */
    toHexString() {
        let val;
        if (this.value.length === 40) {
            val = this.value;
        } else {
            val = base58ToHex(this.value);
        }
        return reverseHex(val);
    }

    serialize() {
        if (this.value.length === 40) {
            return this.value;
        } else {
            return base58ToHex(this.value);
        }
    }

    /**
     * Computes the salt from address for decrypt.
     */
    getB58Checksum() {
        const address = this.toBase58();
        const hash = cryptoJS.SHA256(address).toString();
        const hash2 = sha256(hash);
        return hash2.slice(0, 8);
    }
}

/**
 *
 * @param programhash
 */
function hexToBase58(hexEncoded: string): string {
    const data = ADDR_VERSION + hexEncoded;

    const hash = sha256(data);
    const hash2 = sha256(hash);
    const checksum = hash2.slice(0, 8);

    const datas = data + checksum;

    return base58.encode(new Buffer(datas, 'hex'));
}

function base58ToHex(base58Encoded: string) {
    const decoded = base58.decode(base58Encoded);
    const hexEncoded = ab2hexstring(decoded).substr(2, 40);

    if (base58Encoded !== hexToBase58(hexEncoded)) {
        throw new Error('[addressToU160] decode encoded verify failed');
    }
    return hexEncoded;
}
