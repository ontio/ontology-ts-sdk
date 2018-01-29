import * as CryptoJS from 'crypto-js'
import * as Ecurve from 'ecurve'
import * as BigInteger from 'bigi'
var Scrypt = require('js-scrypt')
var Bs58check = require('bs58check')

import { ab2hexstring, hexXor } from './utils'
import * as core from './core'
import { DEFAULT_SCRYPT, OEP_HEADER, OEP_FLAG } from './consts'

export function encrypt( wifKey:string, keyphrase:string, scryptParams = DEFAULT_SCRYPT ): string {
    let privateKey = core.getPrivateKeyFromWIF( wifKey );
    //console.log( "privateKey: ", privateKey );

    let publickeyEncode = core.getPublicKey( privateKey, true ).toString('hex');
    //console.log( "publickeyEncode: ", publickeyEncode );

    let signatureScript = core.createSignatureScript( publickeyEncode );
    //console.log( "signatureScript: ", signatureScript );

    let programHash = core.getHash( signatureScript );
    //console.log( "programHash: ", programHash );

    let address = core.toAddress( programHash );
    //console.log( "address: ", address );

    let addressSha256  = CryptoJS.SHA256( address ).toString();
    let addressSha256_2 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(addressSha256) ).toString();
    let addresshash = addressSha256_2.slice( 0, 8 );
    //console.log( "addresshash: ", addresshash );

    // Scrypt
    let derived = Scrypt.hashSync( Buffer.from(keyphrase.normalize('NFC'), 'utf8'), Buffer.from(addresshash, 'hex'), scryptParams ).toString('hex');
    let derived1 = derived.slice(0, 64);
    let derived2 = derived.slice(64);

    // AES Encrypt
    let xor = hexXor(privateKey, derived1);
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(xor), CryptoJS.enc.Hex.parse(derived2), { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
    //console.log( "encrypted: ", encrypted.ciphertext.toString() );
    
    // Construct
    let assembled = OEP_HEADER + OEP_FLAG + addresshash + encrypted.ciphertext.toString();
    //console.log( "assembled: ", assembled );

    return Bs58check.encode(Buffer.from(assembled, 'hex'));
}

export function decrypt( encryptedKey:string, keyphrase:string, scryptParams = DEFAULT_SCRYPT ): string {
    let assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    //console.log( "assembled: ", assembled );

    let addressHash = assembled.substr(6, 8);
    //console.log( "addressHash: ", addressHash );

    let encrypted = assembled.substr(-64);
    //console.log( "encrypted: ", encrypted );

    // Scrypt
    let derived = Scrypt.hashSync(Buffer.from(keyphrase.normalize('NFC'), 'utf8'), Buffer.from(addressHash, 'hex'), scryptParams).toString('hex');
    let derived1 = derived.slice(0, 64);
    let derived2 = derived.slice(64);

    // AES Decrypt
    let ciphertexts = { ciphertext: CryptoJS.enc.Hex.parse(encrypted), salt: '', iv: '' }
    let decrypted = CryptoJS.AES.decrypt(ciphertexts, CryptoJS.enc.Hex.parse(derived2), { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
    //console.log( "decrypted: ", decrypted.toString() );

    // PrivateKey
    let privateKey = hexXor(decrypted.toString(), derived1);
    //console.log( "privateKey: ", privateKey );

    // WIF
    let wifKey = core.getWIFFromPrivateKey( privateKey );
    //console.log( "wifKey: ", wifKey );

    return wifKey;
}