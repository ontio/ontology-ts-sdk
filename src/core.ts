import * as cryptoJS from 'crypto-js'
import * as base58 from 'bs58'
import * as ecurve from 'ecurve'
import * as bigInteger from 'bigi'
import { ab2hexstring, hexstring2ab } from './utils'
import { ADDR_VERSION } from './consts'

var ec = require('elliptic').ec
var wif = require('wif')
var secureRandom = require('secure-random')

export function generateRandomArray(len: number): ArrayBuffer {
    return secureRandom(len);
}

export function generatePrivateKey(): ArrayBuffer {
    return generateRandomArray(32);
}

export function getPublicKey( privateKey: string, encode: boolean ): any {
    var ecparams = ecurve.getCurveByName('secp256r1');
    var curvePt = ecparams.G.multiply(bigInteger.fromBuffer(hexstring2ab(privateKey)));

    return curvePt.getEncoded(encode);
};

export function createSignatureScript( publicKeyEncoded: string ):string {
    return "21" + publicKeyEncoded + "ac";
}

export function getHash( SignatureScript:string ):string {
    var ProgramHexString = cryptoJS.enc.Hex.parse(SignatureScript);
    var ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();

    return cryptoJS.RIPEMD160( cryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
}

export function toAddress( programhash: string ): string  {
    var data = ADDR_VERSION + programhash;

    var ProgramHexString = cryptoJS.enc.Hex.parse(data);
    var ProgramSha256 = cryptoJS.SHA256( ProgramHexString ).toString();
    var ProgramSha256_2 = cryptoJS.SHA256( cryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
    var ProgramSha256Buffer = hexstring2ab(ProgramSha256_2);

    var datas = data + ProgramSha256_2.slice(0,8);

    return base58.encode(hexstring2ab(datas));
};

export function signatureData( data:string, privateKey:string ):string {
    let msg = cryptoJS.enc.Hex.parse( data );
    let msgHash = cryptoJS.SHA256( msg );
    
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

export function getPrivateKeyFromWIF( wifkey:string ):string {
    return ab2hexstring(wif.decode(wifkey, 128).privateKey);
}

export function getWIFFromPrivateKey( privateKey:string ):string {
    return wif.encode(128, Buffer.from(privateKey, 'hex'), true);
}