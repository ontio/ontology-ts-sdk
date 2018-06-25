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

import BigInt from '../common/bigInt';
import { PublicKey } from '../crypto/PublicKey';
import { num2hexstring, StringReader } from './../utils';
import opcode from './opcode';

export function pushOpCode(op: opcode): string {
    return num2hexstring(op);
}

export function pushPubKey(pk: PublicKey): string {
    const pkStr = pk.serializeHex();
    return pushBytes(pkStr);
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
    } else {
        result += num2hexstring(opcode.PUSHDATA4);
        result += num2hexstring(len, 4, true);
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
    const pkStrList = pubkeys.map( (p) => p.serializeHex());
    pkStrList.sort();

    let result = '';
    result += pushNum(m);
    for (const pk of pkStrList) {
        result += pushBytes(pk);
    }
    result += pushNum(n);
    result += pushOpCode(opcode.CHECKMULTISIG);
    return result;
}

export function programFromParams(sigs: string[]): string {
    let result = '';
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
    const pkStr = readBytes(sr);
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
        const m = readNum(sr);
        info.M = m;
        info.pubKeys = [];
        for (let i = 0; i < m; i++) {
            const key = readPubKey(sr);
            info.pubKeys.push(key);
        }
        // const n = readNum(sr);
        return info;
    } else {
        throw new Error('Unsupported program.');
    }
}
