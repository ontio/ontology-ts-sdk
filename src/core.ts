import * as CryptoJS from 'crypto-js'
import * as Base58 from 'bs58'
import * as Ecurve from 'ecurve'
import * as BigInteger from 'bigi'
import { ab2hexstring, hexstring2ab } from './utils'

var ec = require('elliptic').ec
var wif = require('wif')

export function getPublicKey( privateKey: string, encode: boolean ): any {
    var ecparams = Ecurve.getCurveByName('secp256r1');
    var curvePt = ecparams.G.multiply(BigInteger.fromBuffer(hexstring2ab(privateKey)));

    return curvePt.getEncoded(encode);
};

export function createSignatureScript( publicKeyEncoded: string ):string {
    return "21" + publicKeyEncoded + "ac";
}

export function getHash( SignatureScript:string ):string {
    var ProgramHexString = CryptoJS.enc.Hex.parse(SignatureScript);
    var ProgramSha256 = CryptoJS.SHA256(ProgramHexString).toString();

    return CryptoJS.RIPEMD160( CryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
}

export function toAddress( programhash: string ): string  {
    var data = "17" + programhash;

    var ProgramHexString = CryptoJS.enc.Hex.parse(data);
    var ProgramSha256 = CryptoJS.SHA256( ProgramHexString ).toString();
    var ProgramSha256_2 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
    var ProgramSha256Buffer = hexstring2ab(ProgramSha256_2);

    var datas = data + ProgramSha256_2.slice(0,8);

    return Base58.encode(hexstring2ab(datas));
};

export function signatureData( data:string, privateKey:string ):string {
    let msg = CryptoJS.enc.Hex.parse( data );
    let msgHash = CryptoJS.SHA256( msg );
    
    let elliptic = new ec('p256')
    const sig = elliptic.sign(msgHash.toString(), privateKey, null)
    const signatureValue = Buffer.concat([
        sig.r.toArrayLike(Buffer, 'be', 32),
        sig.s.toArrayLike(Buffer, 'be', 32)
    ])

    return signatureValue.toString('hex');
}

export function AddContract( txData:string, sign:string, publicKeyEncoded:string ):string {
    let signatureScript = createSignatureScript( publicKeyEncoded );

    // sign num
	var data = txData + "01";
	// sign struct len
	data = data + "41";
	// sign data len
	data = data + "40";
	// sign data
	data = data + sign;
	// Contract data len
	data = data + "23";
	// script data
    data = data + signatureScript;
    
    return data;
}

// export function getPrivateKeyFromWIF( wifkey:string ):string {
//     let data = Base58.decode(wifkey);

// 	if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01) {
// 		return "";
// 	}

// 	let dataHexString = CryptoJS.enc.Hex.parse( ab2hexstring(data.slice( 0, data.length - 4 )) );
// 	let dataSha256 = CryptoJS.SHA256(dataHexString).toString();
// 	let dataSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(dataSha256)).toString();
//     let dataSha256Buffer = hexstring2ab(dataSha256_2);

// 	if ( ab2hexstring(dataSha256Buffer.slice(0, 4)) != ab2hexstring(data.slice(data.length - 4, data.length)) ) {
// 		//wif verify failed.
// 		return "";
// 	}

// 	return ab2hexstring(data.slice(1, 33));
// }

export function getPrivateKeyFromWIF( wifkey:string ):string {
    return ab2hexstring(wif.decode(wifkey, 128).privateKey);
}

export function getWIFFromPrivateKey( privateKey:string ):string {
    return wif.encode(128, Buffer.from(privateKey, 'hex'), true);
}