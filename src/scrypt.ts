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

import * as CryptoJS from 'crypto-js'
import * as BigInteger from 'bigi'
var Scrypt = require('js-scrypt')
var Bs58check = require('bs58check')

import { ab2hexstring, hexXor } from './utils'
import { getSingleSigUInt160, u160ToAddress } from './helpers'
import { DEFAULT_SCRYPT, OEP_HEADER, OEP_FLAG } from './consts'
import {ERROR_CODE} from './error'

export interface ScryptParams {
    cost: number;
    blockSize: number;
    parallel: number;
    size: number;
};

export function encrypt(privateKey: string, publicKey: string, keyphrase: string, scryptParams: ScryptParams = DEFAULT_SCRYPT): string {
    // let privateKey = core.getPrivateKeyFromWIF(wifKey);
    //console.log( "privateKey: ", privateKey );

    //console.log( "publickeyEncode: ", publicKey );

    // let signatureScript = core.createSignatureScript(publickeyEncode);
    //console.log( "signatureScript: ", signatureScript );

    let u160 = getSingleSigUInt160(publicKey);
    // console.log( "programHash: ", programHash );

    let address = u160ToAddress(u160);
    // console.log( "address: ", address );

    let addressSha256 = CryptoJS.SHA256(address).toString();
    let addressSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    let addresshash = addressSha256_2.slice(0, 8);
    // console.log( "addresshash: ", addresshash );

    // Scrypt
    let derived = Scrypt.hashSync(Buffer.from(keyphrase.normalize('NFC'), 'utf8'), Buffer.from(addresshash, 'hex'), scryptParams).toString('hex');
    let derived1 = derived.slice(0, 32);
    let derived2 = derived.slice(64);
    let iv = CryptoJS.enc.Hex.parse(derived1)

    // console.log('decrypt derived: ' + derived)
    // console.log('decrypt iv: ' + iv)
    // console.log('decrypt derived2: ' + derived2)

    // AES Encrypt
    // let xor = hexXor(privateKey, derived1);
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(privateKey), CryptoJS.enc.Hex.parse(derived2), { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding, iv : iv });
    //console.log( "encrypted: ", encrypted.ciphertext.toString() );

    // Construct
    // let assembled = OEP_HEADER + OEP_FLAG + addresshash + encrypted.ciphertext.toString();
    let assembled = addresshash + encrypted.ciphertext.toString();
    
    //console.log( "assembled: ", assembled );

    // return Bs58check.encode(Buffer.from(assembled, 'hex'));
    return new Buffer(assembled, 'hex').toString('base64')
}

/** 
*@param prefix the first 4 bytes of address after twice sha256
*/
export function decrypt(encryptedKey: string, keyphrase: string, scryptParams: ScryptParams = DEFAULT_SCRYPT): string {
    // let assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    let assembled = Buffer.from(encryptedKey, 'base64').toString('hex')
 
    //console.log( "assembled: ", assembled );

    let addressHash = assembled.substr(0, 8);
    //console.log( "addressHash: ", addressHash );

    let encrypted = assembled.substr(8);
    //console.log( "encrypted: ", encrypted );

    // Scrypt
    let derived = Scrypt.hashSync(Buffer.from(keyphrase.normalize('NFC'), 'utf8'), Buffer.from(addressHash, 'hex'), scryptParams).toString('hex');
    let derived1 = derived.slice(0, 32);
    let derived2 = derived.slice(64);

    let iv = CryptoJS.enc.Hex.parse(derived1)

    // AES Decrypt
    let ciphertexts = { ciphertext: CryptoJS.enc.Hex.parse(encrypted), salt: '', iv: '' }
    let decrypted = CryptoJS.AES.decrypt(ciphertexts, CryptoJS.enc.Hex.parse(derived2), { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding, iv:iv });
    //console.log( "decrypted: ", decrypted.toString() );

    // Check PrivateKey
    //----------------------------------------------------------

    // PrivateKey
    // let privateKey = hexXor(decrypted.toString(), derived1);
    let privateKey = decrypted.toString()
    //console.log( "privateKey: ", privateKey );
    return privateKey;
}

/**
 * Checks if the password supplied to decrypt was correct.
 * 
 * This method was taken out from decrypt, because it needs to create public key from private key
 * and it needs to be supplied from outside.
 * 
 * @param encrypted Original encrypted key
 * @param publicKey Public key from decrypted key
 */
export function checkDecrypted(encryptedKey: string, publicKey: string): void {
    // const assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    let assembled = Buffer.from(encryptedKey, 'base64').toString('hex')
    
    // console.log( "assembled: ", assembled );

    const addressHash = assembled.substr(0, 8);
    // console.log( "addressHash: ", addressHash );

    // console.log('publicKey', publicKey)

    // Address
    const u160 = getSingleSigUInt160(publicKey);
    const address = u160ToAddress(u160);
    // console.log('address 2', address)

    // AddressHash
    const addressSha256 = CryptoJS.SHA256(address).toString();
    const addressSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addressHashNew = addressSha256_2.slice(0, 8);
    

    if (addressHashNew != addressHash) {
        console.log("keyphrase error.");
        throw ERROR_CODE.Decrypto_ERROR;
    }

    // WIF
    // let wifKey = core.getWIFFromPrivateKey(privateKey);
    //console.log( "wifKey: ", wifKey );
}
