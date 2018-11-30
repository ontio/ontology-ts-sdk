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
import axios from 'axios';
import * as bip39 from 'bip39';
import * as cryptoJS from 'crypto-js';
import * as Long from 'long';
import * as secureRandom from 'secure-random';
import { ONT_TOTAL_SUPPLY, UNBOUND_GENERATION_AMOUNT, UNBOUND_TIME_INTERVAL, WEBVIEW_SCHEME } from './consts';
import { ERROR_CODE } from './error';
/**
 * Turn hex string into array buffer
 * @param str hex string
 */
export function hexstring2ab(str: string): number[] {
    const result = [];

    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

/**
 * Turn array buffer into hex string
 * @param arr Array like value
 */
export function ab2hexstring(arr: any): string {
    let result: string = '';
    const uint8Arr: Uint8Array = new Uint8Array(arr);
    for (let i = 0; i < uint8Arr.byteLength; i++) {
        let str = uint8Arr[i].toString(16);
        str = str.length === 0
            ? '00'
            : str.length === 1
                ? '0' + str
                : str;
        result += str;
    }
    return result;
}

 /**
  * Turn ArrayBuffer or array-like oject into normal string
  * @param buf
  */
export function ab2str(buf: ArrayBuffer | number[]): string {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/**
 * Turn normal string into ArrayBuffer
 * @param str Normal string
 */
export function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length); // 每个字符占用1个字节
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * Turn normal string into hex string
 * @param str Normal string
 */
export function str2hexstr(str: string) {
    return ab2hexstring(str2ab(str));
}

/**
 * Turn hex string into normal string
 * @param str Hex string
 */
export function hexstr2str(str: string) {
    return ab2str(hexstring2ab(str));
}

/**
 * return the (length of bytes) + bytes
 * @param hex Hex string
 */
export function hex2VarBytes(hex: string) {
    let result = '';
    result += num2VarInt(hex.length / 2);
    result += hex;
    return result;
}

/**
 * return the length of string(bytes) + string(bytes)
 * @param str Normal string
 */
export function str2VarBytes(str: string) {
    let result = '';
    const hex = str2hexstr(str);
    const hexLen = num2VarInt(hex.length / 2);
    result += hexLen;
    result += hex;
    return result;
}

/**
 * return the byte of boolean value
 * @param v
 */
export function bool2VarByte(v: boolean) {
    return v ? '01' : '00';
}

/**
 * Do xor operation with two strings
 * @param str1 Hex string
 * @param str2 Hex string
 */
export function hexXor(str1: string, str2: string): string {
    if (str1.length !== str2.length) {
        throw new Error('strings are disparate lengths');
    }
    if (str1.length % 2 !== 0) {
        throw new Error('strings must be hex');
    }

    const result = new ArrayBuffer(str1.length / 2);
    const result8 = new Uint8Array(result);
    for (let i = 0; i < str1.length; i += 2) {
        // tslint:disable-next-line:no-bitwise
        result8[i / 2] = (parseInt(str1.substr(i, 2), 16) ^ parseInt(str2.substr(i, 2), 16));
    }
    return ab2hexstring(result);
}

/**
 * Converts a number to a big endian hexstring of a suitable size, optionally little endian
 * @param {number} num
 * @param {number} size - The required size in bytes, eg 1 for Uint8, 2 for Uint16. Defaults to 1.
 * @param {boolean} littleEndian - Encode the hex in little endian form
 * @return {string}
 */
export const num2hexstring = (num: number, size = 1, littleEndian = false) => {
    if (num < 0) {
        throw new RangeError('num must be >=0');
    }
    if (size % 1 !== 0) {
        throw new Error('size must be a whole integer');
    }
    if (!Number.isSafeInteger(num)) {
        throw new RangeError(`num (${num}) must be a safe integer`);
    }

    size = size * 2;
    let hexstring = num.toString(16);
    hexstring = hexstring.length % size === 0 ? hexstring : ('0'.repeat(size) + hexstring).substring(hexstring.length);
    if (littleEndian) {
        hexstring = reverseHex(hexstring);
    }
    return hexstring;
};

/**
 * Converts a number to a hex
 * @param {number} num - The number
 * @returns {string} hexstring of the variable Int.
 */
export const num2VarInt = (num: number) => {
    if (num < 0xfd) {
        return num2hexstring(num);
    } else if (num <= 0xffff) {
        // uint16
        return 'fd' + num2hexstring(num, 2, true);
    } else if (num <= 0xffffffff) {
        // uint32
        return 'fe' + num2hexstring(num, 4, true);
    } else {
        // uint64
        return 'ff' + num2hexstring(num, 8, true);
    }
};

/**
 * Reverses a hex string, 2 chars as 1 byte
 * @example
 * reverseHex('abcdef') = 'efcdab'
 * @param {string} hex - HEX string
 * @return {string} reversed hex string.
 */
export const reverseHex = (hex: string) => {
    if (hex.length % 2 !== 0) {
        throw new Error(`Incorrect Length: ${hex}`);
    }
    let out = '';
    for (let i = hex.length - 2; i >= 0; i -= 2) {
        out += hex.substr(i, 2);
    }
    return out;
};

export function bigIntFromBytes(bytes: string): Long {
    const buff = Buffer.from(bytes, 'hex');
    let data = Array.from(buff.subarray(0));
    const b = data[data.length - 1];

    if (b >> 7 === 1) {
        data = data.concat(Array(8 - data.length).fill(255));
    }
    return Long.fromBytesLE(data);
}

export function bigIntToBytes(value: Long) {
    let data = value.toBytesLE();
    const negData = value.neg().toBytesLE();
    let stop;
    if (value.isNegative()) {
        stop = 255;
    } else {
        stop = 0;
    }
    let b = stop;
    let pos = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] !== stop) {
            b = value.isNegative() ? negData[i] : data[i];
            pos = i + 1;
            break;
        }
    }
    data = data.slice(0, pos);

    if (b >> 7 === 1) {
        data.push(value.isNegative() ? 255 : 0);
    }
    return new Buffer(data).toString('hex');
}

/**
 * @class StringReader
 * @classdesc A string helper used to read given string as bytes.2 chars as one byte.
 * @param {string} str - The string to read.
 */
export class StringReader {
    str: string;
    pos: number;
    size: number;
    constructor(str = '') {
        if (str.length % 2 !== 0) {
            throw new Error('Param\'s length is not even.');
        }
        this.str = str;
        this.pos = 0;
        this.size = this.str.length / 2;
    }

    /**
     * Checks if reached the end of the string.
     */
    isEmpty() {
        return this.pos >= this.str.length;
    }

    /**
     * Reads some bytes.
     * @param {number} bytes - Number of bytes to read
     */
    read(bytes: number) {
        if (this.isEmpty()) {
            throw new Error('StringReader reached the end.');
        }
        const out = this.str.substr(this.pos, bytes * 2);
        this.pos += bytes * 2;
        return out;
    }

    unreadBytes(bytes: number) {
        if ( (this.pos - bytes * 2) < 0 ) {
            throw new Error('Can not unread too many bytes.');
        }
        this.pos -= bytes * 2;
        return;
    }

    /**
     * Reads string terminated by NULL.
     */
    readNullTerminated(): string {
        const index = this.str.indexOf('00', this.pos);
        if (index === -1) {
            throw new Error('No ending NULL found');
        }

        const out = this.str.substring(this.pos, index);
        this.pos = index + 2;
        return out;
    }

    /**
     * First, read one byte as the length of bytes to read. Then read the following bytes.
     */
    readNextBytes() {
        const bytesToRead = this.readNextLen();
        if (bytesToRead === 0) {
            return '';
        }

        return this.read(bytesToRead);
    }

    /**
     * Reads one byte as int, which may indicates the length of following bytes to read.
     * @returns {number}
     */
    readNextLen() {
        let len = parseInt(this.read(1), 16);

        if (len === 0xfd) {
            len = parseInt(reverseHex(this.read(2)), 16);
        } else if (len === 0xfe) {
            len = parseInt(reverseHex(this.read(4)), 16);
        } else if (len === 0xff) {
            len = parseInt(reverseHex(this.read(8)), 16);
        }

        return len;
    }

    /**
     * Read Uint8
     */
    readUint8() {
        return parseInt(reverseHex(this.read(1)), 16);
    }

    /**
     * read 2 bytes as uint16 in littleEndian
     */
    readUint16() {
        return parseInt(reverseHex(this.read(2)), 16);
    }

    /**
     * Read 4 bytes as uint32 in littleEndian
     */
    readUint32() {
        return parseInt(reverseHex(this.read(4)), 16);
    }

    /**
     * Read 4 bytes as int in littleEndian
     */
    readInt() {
        return parseInt(reverseHex(this.read(4)), 16);
    }

    /**
     * Read 8 bytes as long in littleEndian
     */
    readLong() {
        return parseInt(reverseHex(this.read(8)), 16);
    }

    readBoolean() {
        return parseInt(this.read(1), 16) !== 0;
    }
}

export class EventEmitter {
    handlers: any = {};

    // register event type and handler
    on(type: string, handler: () => void) {
        if (typeof this.handlers[type] === 'undefined') {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    }

    /**
     * trigger event
     * @param { string } type
     * @param { any } event , is the parameter
     */
    trigger(type: string, event?: any) {
        if (this.handlers[type] instanceof Array) {
            const handlers = this.handlers[type];
            for (let i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
            }
        }
    }

    // remove event listener
    off(type: string) {
        delete this.handlers[type];
    }
}

export const sendBackResult2Native = (result: string, callback: string) => {
    if (window && window.prompt) {
        window.prompt(`${WEBVIEW_SCHEME}://${callback}?params=${result}`);
    }
};

export const axiosPost = (url: string, params: any) => {
    return axios.post(url, params).then((res: any) => {
        // tslint:disable-next-line:no-console
        console.log('axios res:' + res);
        return res;
    }).catch((err: any) => {
        // tslint:disable-next-line:no-console
        console.log('axios res:' + JSON.stringify(err));

        return err;
    });
};

/**
 * Gets current time in unix timestamp format.
 */
export function now(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * Computes sha-256 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function sha256(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const sha = cryptoJS.SHA256(hex).toString();
    return sha;
}

/**
 * Computes ripemd-160 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function ripemd160(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const ripemd = cryptoJS.RIPEMD160(hex).toString();
    return ripemd;
}

/**
 * Computes ripemd-160 hash of sha-256 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function hash160(SignatureScript: string): string {
    return ripemd160(sha256(SignatureScript));
}

/**
 * Generates random ArrayBuffer of specified length.
 *
 * @param len Length of the array to generate
 */
export function generateRandomArray(len: number): ArrayBuffer {
    return secureRandom(len);
}

/**
 * Generates random ArrayBuffer of specified length encoded as hex string
 *
 * @param len Length of the array to generate
 */
export function randomBytes(len: number) {
    return ab2hexstring(generateRandomArray(len));
}

export function generateMnemonic(size: number = 16): string {
    const random = ab2hexstring(generateRandomArray(size));
    return bip39.entropyToMnemonic(random);
}

export function parseMnemonic(str: string) {
    return bip39.mnemonicToEntropy(str);
}

export function varifyPositiveInt(v: number) {
    if (!/^[1-9]\d*$/.test(v.toString())) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    return;
}

export function isBase64(str: string): boolean {
    return Buffer.from(str, 'base64').toString('base64') === str;
}

export function isHexString(str: string): boolean {
    const regexp = /^[0-9a-fA-F]+$/;
    return regexp.test(str) && (str.length % 2 === 0);
}

export function unboundDeadline() {
    let count = 0;
    for (const m of UNBOUND_GENERATION_AMOUNT) {
        count += m;
    }
    count *= UNBOUND_TIME_INTERVAL;
    const numInterval = UNBOUND_GENERATION_AMOUNT.length;
    if (UNBOUND_GENERATION_AMOUNT[numInterval - 1] !== 1 ||
        ! ((count - UNBOUND_TIME_INTERVAL < ONT_TOTAL_SUPPLY) && ONT_TOTAL_SUPPLY <= count)) {
        throw new Error('incompatible constants setting');
    }
    return UNBOUND_TIME_INTERVAL * numInterval - (count - ONT_TOTAL_SUPPLY);
}

export function calcUnboundOng(balance: number, startOffset: number, endOffset: number) {
    let amount = 0;
    if (startOffset >= endOffset) {
        return 0;
    }
    const UNBOUND_DEADLINE = unboundDeadline();
    if (startOffset < UNBOUND_DEADLINE) {
        let ustart = Math.floor(startOffset / UNBOUND_TIME_INTERVAL);
        let istart = startOffset % UNBOUND_TIME_INTERVAL;
        if (endOffset >= UNBOUND_DEADLINE) {
            endOffset = UNBOUND_DEADLINE;
        }
        const uend = Math.floor(endOffset / UNBOUND_TIME_INTERVAL);
        const iend = endOffset % UNBOUND_TIME_INTERVAL;
        while (ustart < uend) {
            amount += (UNBOUND_TIME_INTERVAL - istart) * UNBOUND_GENERATION_AMOUNT[ustart];
            ustart++;
            istart = 0;
        }
        amount += (iend - istart) * UNBOUND_GENERATION_AMOUNT[ustart];
    }
    return amount * balance;
}
