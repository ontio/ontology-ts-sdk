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

import {SHA256, enc} from 'crypto-js'
import { WEBVIEW_SCHEME } from './consts'
import axios from 'axios'

export function hexstring2ab(str:string): number[] {
	var result = [];
	while (str.length >= 2) {
		result.push(parseInt(str.substring(0, 2), 16));
		str = str.substring(2, str.length);
	}

	return result;
}

export function ab2hexstring(arr: any): string {
    let result: string = "";
    let uint8Arr: Uint8Array = new Uint8Array(arr);
	for ( let i = 0; i < uint8Arr.byteLength; i++) {
		var str = uint8Arr[i].toString(16);
		str = str.length == 0 ? "00" :
			str.length == 1 ? "0" + str :
				str;
		result += str;
	}
	return result;
}


// Turn ArrayBuffer or array-like oject into normal string
export function ab2str(buf : ArrayBuffer | number[]) : string {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Turn normal string into ArrayBuffer
export function str2ab(str : string) {
	var buf = new ArrayBuffer(str.length ); // 每个字符占用1个字节
	var bufView = new Uint8Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

export function str2hexstr(str : string) {
	return ab2hexstring(str2ab(str))
}

export function hexstr2str(str : string) {
	return ab2str(hexstring2ab(str))
}

//return the length of bytes + bytes, 2 char as one byte
export function hex2VarBytes(hex : string) {
	let result = ''
	result += num2VarInt(hex.length / 2)
	result += hex
	return result
}

//return the length of string(bytes) + string(bytes)
export function str2VarBytes(str : string) {
	let result  = ''
	const hex = str2hexstr(str)
	const hexLen = num2VarInt(hex.length / 2)
	result += hexLen
	result += hex
	return result
}

//return the byte of boolean value
export function bool2VarByte(v : boolean) {
	return v ? '01' : '00'	
}

export function hexXor(str1:string, str2:string): string {
	if (str1.length !== str2.length) throw new Error('strings are disparate lengths')
	if (str1.length % 2 !== 0) throw new Error('strings must be hex')

	let result = new ArrayBuffer(str1.length/2);
	let result8 = new Uint8Array(result);
	for (let i = 0; i < str1.length; i += 2) {
		result8[i/2] = (parseInt(str1.substr(i, 2), 16) ^ parseInt(str2.substr(i, 2), 16))
	}
	return ab2hexstring(result)
  }

/**
* Converts a number to a big endian hexstring of a suitable size, optionally little endian
* @param {number} num
* @param {number} size - The required size in bytes, eg 1 for Uint8, 2 for Uint16. Defaults to 1.
* @param {boolean} littleEndian - Encode the hex in little endian form
* @return {string}
*/
export const num2hexstring = (num : number, size = 1, littleEndian = false) => {
	if (num < 0) throw new RangeError('num must be >=0')
	if (size % 1 !== 0) throw new Error('size must be a whole integer')
	if (!Number.isSafeInteger(num)) throw new RangeError(`num (${num}) must be a safe integer`)
	size = size * 2
	let hexstring = num.toString(16)
	hexstring = hexstring.length % size === 0 ? hexstring : ('0'.repeat(size) + hexstring).substring(hexstring.length)
	if (littleEndian) hexstring = reverseHex(hexstring)
	return hexstring
}

/**
 * Converts a number to a hex
 * @param {number} num - The number
 * @returns {string} hexstring of the variable Int.
 */
export const num2VarInt = (num : number) => {
	if (num < 0xfd) {
		return num2hexstring(num)
	} else if (num <= 0xffff) {
		// uint16
		return 'fd' + num2hexstring(num, 2, true)
	} else if (num <= 0xffffffff) {
		// uint32
		return 'fe' + num2hexstring(num, 4, true)
	} else {
		// uint64
		return 'ff' + num2hexstring(num, 8, true)
	}
}


/**
 * Reverses a hex string, 2 chars as 1 byte
 * @example
 * reverseHex('abcdef') = 'efcdab'
 * @param {string} hex - HEX string
 * @return {string} reversed hex string.
 */
export const reverseHex = (hex : string ) => {
	if (hex.length % 2 !== 0) throw new Error(`Incorrect Length: ${hex}`)
	let out = ''
	for (let i = hex.length - 2; i >= 0; i -= 2) {
		out += hex.substr(i, 2)
	}
	return out
}

/**
 * @class StringReader
 * @classdesc A string helper used to read given string as bytes.2 chars as one byte.
 * @param {string} str - The string to read.
 */
export class StringReader {
	str : string
	pos : number
	constructor(str = '') {
		this.str = str
		this.pos = 0
	}

	/**
	 * Checks if reached the end of the string.
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.pos >= this.str.length
	}

	/**
	 * Reads some bytes.
	 * @param {number} bytes - Number of bytes to read
	 * @returns {string}
	 */
	read(bytes : number) {
		if (this.isEmpty()) throw new Error('StringReader reached the end.')
		const out = this.str.substr(this.pos, bytes * 2)
		this.pos += bytes * 2
		return out
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
	 * @return {string}
	 */
	readNextBytes() {
		const bytesToRead = this.readNextLen();
		if (bytesToRead === 0) return '';

		return this.read(bytesToRead);
	}

	/**
	 * Reads one byte as int, which may indicates the length of following bytes to read.
	 * @returns {number}
	 */
	readNextLen() {
		let len = parseInt(this.read(1), 16)
		if (len === 0xfd) len = parseInt(reverseHex(this.read(2)), 16)
		else if (len === 0xfe) len = parseInt(reverseHex(this.read(4)), 16)
		else if (len === 0xff) len = parseInt(reverseHex(this.read(8)), 16)
		return len
	}

	/* read 2 bytes as uint16 in littleEndian */
	readUint16() {
		return parseInt(reverseHex(this.read(2)),16)
	}
}

export class EventEmitter {
	handlers : any
	constructor(){
		this.handlers = {}
	}

	//register event type and handler
	on ( type : string, handler : ()=> void) {
		if(typeof this.handlers[type] == 'undefined') {
			this.handlers[type] = []
		}
		this.handlers[type].push(handler)
	}

	//trigger event
	//@param { string } type 
	//@param { any } event , is the parameter
	trigger (type : string, event? : any) {
		if(this.handlers[type] instanceof Array) {
			var handlers = this.handlers[type]
			for(let i = 0, len = handlers.length; i< len; i++) {
				handlers[i](event)
			}
		}
	}

	//remove event listener
	off (type : string) {
		delete this.handlers[type]
	}
}

export const sendBackResult2Native = (result : string, callback : string) => {
	if(window && window.prompt) {
		window.prompt(`${WEBVIEW_SCHEME}://${callback}?params=${result}`)
	}
} 

export const axiosPost = (url:string, params:any) => {
	return axios.post(url, params).then((res : any) => {
		console.log('axios res:'+res)
		return res
	}).catch((err : any) => {
		console.log('axios res:' + JSON.stringify(err))

		return err
	})
}
