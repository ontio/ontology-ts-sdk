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

import * as elliptic from 'elliptic';
import { sm2 } from 'sm.js';
import BigInt from '../common/bigInt';
import { KeyType } from '../crypto/KeyType';
import { PublicKey } from '../crypto/PublicKey';
import { ERROR_CODE } from '../error';
import { num2hexstring, StringReader } from './../utils';
import opcode from './opcode';
// The sorting rules is as follows:
//    1. if keys have different types, then sorted by the KeyType value.
//    2. else,
//       2.1. ECDSA or SM2:
//           2.1.1. if on different curves, then sorted by the curve label.
//           2.1.2. else if x values are different, then sorted by x.
//           2.1.3. else sorted by y.
//       2.2. EdDSA: sorted by the byte sequence directly.
export function comparePublicKeys(a: PublicKey, b: PublicKey) {
    if (a.algorithm !== b.algorithm) {
        return a.algorithm.hex - b.algorithm.hex;
    }
    switch (a.algorithm) {
    case KeyType.ECDSA:
        const ec = new elliptic.ec(a.parameters.curve.preset);
        const paKey = ec.keyFromPublic(a.key, 'hex', true);
        const pbKey = ec.keyFromPublic(b.key, 'hex', true);
        const pa = paKey.getPublic();
        const pb = pbKey.getPublic();
        if (pa.getX() !== pb.getX()) {
            return pa.getX() - pb.getX();
        } else {
            return pa.getY() - pb.getY();
        }
    case KeyType.SM2:
        const pka = new sm2.SM2KeyPair();
        const pkb = new sm2.SM2KeyPair();
        pka._pubFromString(a.key);
        pkb._pubFromString(b.key);
        if (pka.getX().toString() !== pkb.getX().toString()) {
            return Number(pka.getX().toString()) - Number(pkb.getX().toString());
        } else {
            return Number(pka.getY().toString()) - Number(pkb.getY().toString());
        }
    case KeyType.EDDSA:
        return Number(a.key) - Number(b.key);
    default:
        return 0;
    }
}

export function pushOpCode(op: opcode): string {
    return num2hexstring(op);
}

export function pushPubKey(pk: PublicKey): string {
    const pkStr = pk.serializeHex();
    return pushBytes(pkStr);
}

export function pushBigInt(num: number): string {
    if (num === -1) {
        return num2hexstring(opcode.PUSHM1);
    }
    if (num === 0) {
        return num2hexstring(opcode.PUSH0);
    }
    if (num > 0 && num <= 16) {
        return num2hexstring(opcode.PUSH1 - 1 + num);
    }
    return num2hexstring(num, 8, true);
}

export function pushNum(num: number): string {
    if ( num === 0 ) {
        return pushOpCode(opcode.PUSH0);
    } else if ( num <= 16 ) {
        return num2hexstring(num - 1 + opcode.PUSH1);
    }
    const bint = new BigInt(num.toString());
    return pushBytes(bint.toHexstr());
}

export function pushBytes(hexstr: string): string {
    let result = '';
    if (hexstr.length === 0) {
        throw new Error('pushBytes error, hexstr is empty.');
    }
    const len = hexstr.length / 2;
    if (len <= opcode.PUSHBYTES75 + 1 - opcode.PUSHBYTES1 ) {
        result += num2hexstring(len + opcode.PUSHBYTES1 - 1);
    } else if (len < 0x100) {
        result += num2hexstring(opcode.PUSHDATA1);
        result += num2hexstring(len);
    } else if (len < 0x10000) {
        result += num2hexstring(opcode.PUSHDATA2);
        result += num2hexstring(len, 2, true);
    } else if (len < 0x100000000) {
        result += num2hexstring(opcode.PUSHDATA4);
        result += num2hexstring(len, 4, true);
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    result += hexstr;
    return result;
}

export function programFromPubKey(pk: PublicKey): string {
    let result = '';
    result += pushPubKey(pk);
    result += pushOpCode(opcode.CHECKSIG);
    return result;
}

export function programFromMultiPubKey(pubkeys: PublicKey[], m: number): string {
    const n = pubkeys.length;
    if (!(1 <= m && m <= n && n <= 1024)) {
        throw new Error('Wrong multi-sig param');
    }
    // const pkStrList = pubkeys.map( (p) => p.serializeHex());
    // pkStrList.sort();

    pubkeys.sort(comparePublicKeys);

    let result = '';
    result += pushNum(m);

    for (const pk of pubkeys) {
        result += pushBytes(pk.serializeHex());
    }
    result += pushNum(n);
    result += pushOpCode(opcode.CHECKMULTISIG);
    return result;
}

export function programFromParams(sigs: string[]): string {
    let result = '';
    sigs.sort();
    for ( const s of sigs) {
        result += pushBytes(s);
    }
    return result;
}

export function readOpcode(sr: StringReader) {
    return parseInt(sr.read(1), 16);
}

export function readNum(sr: StringReader) {
    let code;
    try {
        code = readOpcode(sr);
    } catch (err) {
        return 0;
    }
    let num = code - opcode.PUSH1 + 1;
    if (code === opcode.PUSH0) {
        readOpcode(sr);
        return 0;
    } else if (1 <= num && num <= 16) {
        readOpcode(sr);
        return num;
    }
    const bint = BigInt.fromHexstr(sr.readNextBytes());
    num = parseInt(bint.value.toString(), 10);
    return num;
}

export function readBytes(sr: StringReader) {
    const code = readOpcode(sr);
    let keylen;
    if (code === opcode.PUSHDATA4) {
        keylen = sr.readUint32();
    } else if (code === opcode.PUSHDATA2) {
        keylen = sr.readUint16();
    } else if (code === opcode.PUSHDATA1) {
        keylen = sr.readUint8();
    } else if (code <= opcode.PUSHBYTES75 && code >= opcode.PUSHBYTES1) {
        keylen = code - opcode.PUSHBYTES1 + 1;
    } else {
        throw new Error('unexpected opcode: ' + code);
    }
    return sr.read(keylen);
}

export function readPubKey(sr: StringReader) {
    const pkStr = sr.readNextBytes();
    return PublicKey.deserializeHex(new StringReader(pkStr));
}

export function getParamsFromProgram(hexstr: string): string[] {
    const sigs = [];
    const sr = new StringReader(hexstr);
    while (!sr.isEmpty()) {
        sigs.push(readBytes(sr));
    }
    return sigs;
}

export class ProgramInfo {
    M: number;
    pubKeys: PublicKey[];
}
export function getProgramInfo(hexstr: string): ProgramInfo {
    const info = new ProgramInfo();
    const end = parseInt(hexstr.substr(-2, 2), 16);
    if (end === opcode.CHECKSIG) {
        const sr = new StringReader(hexstr);
        const pk = readPubKey(sr);
        info.M = 1;
        info.pubKeys = [pk];
        return info;
    } else if (end === opcode.CHECKMULTISIG) {
        const sr = new StringReader(hexstr);
        const m = parseInt(sr.read(1), 16) - opcode.PUSH1 + 1;
        const n = parseInt(hexstr.substr(-4, 2), 16) - opcode.PUSH1 + 1;
        info.M = m;
        info.pubKeys = [];
        for (let i = 0; i < n; i++) {
            const key = readPubKey(sr);
            info.pubKeys.push(key);
        }
        // const n = readNum(sr);
        return info;
    } else {
        throw new Error('Unsupported program.');
    }
}
