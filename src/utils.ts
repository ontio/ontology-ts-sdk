
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