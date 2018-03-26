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
import * as Ecurve from 'ecurve'
import * as BigInteger from 'bigi'
var Scrypt = require('js-scrypt')
var Bs58check = require('bs58check')

import { ab2hexstring, hexXor } from './utils'
import * as core from './core'
import { DEFAULT_SCRYPT, OEP_HEADER, OEP_FLAG } from './consts'
import {ERROR_CODE} from './error'

export function encrypt(privateKey: string, keyphrase: string, scryptParams = DEFAULT_SCRYPT): string {
    // let privateKey = core.getPrivateKeyFromWIF(wifKey);
    //console.log( "privateKey: ", privateKey );

    let publickeyEncode = core.getPublicKey(privateKey, true).toString('hex');
    //console.log( "publickeyEncode: ", publickeyEncode );

    // let signatureScript = core.createSignatureScript(publickeyEncode);
    //console.log( "signatureScript: ", signatureScript );

    let u160 = core.getSingleSigUInt160(publickeyEncode);
    //console.log( "programHash: ", programHash );

    let address = core.u160ToAddress(u160);
    //console.log( "address: ", address );

    let addressSha256 = CryptoJS.SHA256(address).toString();
    let addressSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    let addresshash = addressSha256_2.slice(0, 8);
    //console.log( "addresshash: ", addresshash );

    // Scrypt
    let derived = Scrypt.hashSync(Buffer.from(keyphrase.normalize('NFC'), 'utf8'), Buffer.from(addresshash, 'hex'), scryptParams).toString('hex');
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

//why not return privateKey
export function decrypt(encryptedKey: string, keyphrase: string, scryptParams = DEFAULT_SCRYPT): string {
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

    // Check PrivateKey
    //----------------------------------------------------------

    // PrivateKey
    let privateKey = hexXor(decrypted.toString(), derived1);
    //console.log( "privateKey: ", privateKey );

    let publickeyEncode = core.getPublicKey(privateKey, true).toString('hex');

    let u160 = core.getSingleSigUInt160(publickeyEncode)

    // Address
    let address = core.u160ToAddress(u160);

    // AddressHash
    let addressSha256 = CryptoJS.SHA256(address).toString();
    let addressSha256_2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    let addressHashNew = addressSha256_2.slice(0, 8);

    if (addressHashNew != addressHash) {
        console.log("keyphrase error.");
        throw ERROR_CODE.Decrypto_ERROR;
    }

    // WIF
    // let wifKey = core.getWIFFromPrivateKey(privateKey);
    //console.log( "wifKey: ", wifKey );

    return privateKey;
}