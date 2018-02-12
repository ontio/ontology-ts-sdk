import BN from 'bignumber.js'
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


// ArrayBuffer转为字符串，参数为ArrayBuffer对象
export function ab2str(buf : ArrayBuffer | number[]) : string {
	let abView
	if(buf instanceof ArrayBuffer) {
		abView = new Uint8Array(buf)
	} else if(Array.isArray(buf)) {
		let abView = Uint8Array.of(buf)
	}
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// 字符串转为ArrayBuffer对象，参数为字符串
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
	if (typeof num !== 'number') throw new Error('num must be numeric')
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
 * Converts a number to a variable length Int. Used for array length header
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
 * Reverses a HEX string, treating 2 chars as a byte.
 * @example
 * reverseHex('abcdef') = 'efcdab'
 * @param {string} hex - HEX string
 * @return {string} HEX string reversed in 2s.
 */
export const reverseHex = (hex : string ) => {
	if (typeof hex !== 'string') throw new Error('reverseHex expects a string')
	if (hex.length % 2 !== 0) throw new Error(`Incorrect Length: ${hex}`)
	let out = ''
	for (let i = hex.length - 2; i >= 0; i -= 2) {
		out += hex.substr(i, 2)
	}
	return out
}

/**
 * @class StringStream
 * @classdesc A simple string stream that allows user to read a string byte by byte using read().
 * @param {string} str - The string to read as a stream.
 */
export class StringStream {
	str : string
	pter : number
	constructor(str = '') {
		this.str = str
		this.pter = 0
	}

	/**
	 * Checks if reached the end of the stream. Does not mean stream is actually empty (this.str is not empty)
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.pter >= this.str.length
	}

	/**
	 * Reads some bytes off the stream.
	 * @param {number} bytes - Number of bytes to read
	 * @returns {string}
	 */
	read(bytes) {
		if (this.isEmpty()) throw new Error()
		const out = this.str.substr(this.pter, bytes * 2)
		this.pter += bytes * 2
		return out
	}

	/**
	 * Reads some bytes off the stream using the first byte as the length indicator.
	 * @return {string}
	 */
	readVarBytes() {
		return this.read(this.readVarInt())
	}

	/**
	 * Reads a variable Int.
	 * @returns {number}
	 */
	readVarInt() {
		let len = parseInt(this.read(1), 16)
		if (len === 0xfd) len = parseInt(reverseHex(this.read(2)), 16)
		else if (len === 0xfe) len = parseInt(reverseHex(this.read(4)), 16)
		else if (len === 0xff) len = parseInt(reverseHex(this.read(8)), 16)
		return len
	}
}

export class EventEmitter {
	handlers : {  }
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
	return axios.post(url, params).then((res) => {
		return res
	}).catch((err) => {
		return err
	})
}
