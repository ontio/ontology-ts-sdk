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
import * as Bs58check from 'bs58check';
import * as CryptoJS from 'crypto-js';
import * as Scrypt from 'js-scrypt';
import { DEFAULT_SCRYPT, OEP_FLAG, OEP_HEADER } from './consts';
import * as core from './core';
import { Address } from './crypto';
import { ERROR_CODE } from './error';
import { getSingleSigUInt160, u160ToAddress } from './helpers';
import { ab2hexstring, hexXor } from './utils';

export interface ScryptParams {
    cost: number;
    blockSize: number;
    parallel: number;
    size: number;
}

export function encrypt(
    privateKey: string,
    publicKey: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    // let privateKey = core.getPrivateKeyFromWIF(wifKey);
    // console.log( "privateKey: ", privateKey );

    // console.log( "publickeyEncode: ", publicKey );

    // let signatureScript = core.createSignatureScript(publickeyEncode);
    // console.log( "signatureScript: ", signatureScript );

    const u160 = getSingleSigUInt160(publicKey);
    // console.log( "programHash: ", programHash );

    const address = u160ToAddress(u160);
    // console.log( "address: ", address );

    const addressSha256 = CryptoJS.SHA256(address).toString();
    const addressSha2562 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addresshash = addressSha2562.slice(0, 8);
    // console.log( "addresshash: ", addresshash );

    // Scrypt
    const derived = Scrypt.hashSync(
        Buffer.from(keyphrase.normalize('NFC'), 'utf8'),
        Buffer.from(addresshash, 'hex'),
        scryptParams
    ).toString('hex');

    const derived1 = derived.slice(0, 32);
    const derived2 = derived.slice(64);
    const iv = CryptoJS.enc.Hex.parse(derived1);

    // console.log('decrypt derived: ' + derived)
    // console.log('decrypt iv: ' + iv)
    // console.log('decrypt derived2: ' + derived2)

    // AES Encrypt
    // let xor = hexXor(privateKey, derived1);
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Hex.parse(privateKey),
        CryptoJS.enc.Hex.parse(derived2),
        { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding, iv }
    );
    // console.log( "encrypted: ", encrypted.ciphertext.toString() );

    // Construct
    // let assembled = OEP_HEADER + OEP_FLAG + addresshash + encrypted.ciphertext.toString();
    const assembled = encrypted.ciphertext.toString();

    // console.log( "enc assembled: ", assembled );

    // return Bs58check.encode(Buffer.from(assembled, 'hex'));
    return new Buffer(assembled, 'hex').toString('base64');
}

/**
 * @param encryptedKey encrypted private key
 * @param keyphrase user's password to encrypt private key
 * @param checksum 4 bytes or address in base58 format
 */
export function decrypt(
    encryptedKey: string,
    keyphrase: string,
    checksum: string | Address,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    // let assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    const encrypted = Buffer.from(encryptedKey, 'base64').toString('hex');

    // tslint:disable-next-line:no-console
    console.log('dec assembled: ', encrypted);

    let addressHash = '';
    if (typeof checksum === 'string' && checksum.length === 8) {
        addressHash = checksum;
    } else if (checksum instanceof Address) {
        addressHash = core.getChecksumFromAddress(checksum);
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }

    // let addressHash = assembled.substr(0, 8);
    // console.log( "dec addressHash: ", addressHash );

    // let encrypted = assembled.substr(8);
    // console.log( "encrypted: ", encrypted );

    // Scrypt
    const derived = Scrypt.hashSync(
        Buffer.from(keyphrase.normalize('NFC'), 'utf8'),
        Buffer.from(addressHash, 'hex'),
        scryptParams
    ).toString('hex');
    const derived1 = derived.slice(0, 32);
    const derived2 = derived.slice(64);
    // console.log('decrypt derived: ' + derived)

    const iv = CryptoJS.enc.Hex.parse(derived1);

    // AES Decrypt
    const ciphertexts = { ciphertext: CryptoJS.enc.Hex.parse(encrypted), salt: '', iv: '' };
    const decrypted = CryptoJS.AES.decrypt(
        ciphertexts,
        CryptoJS.enc.Hex.parse(derived2),
        { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding, iv }
    );
    // console.log( "decrypted: ", decrypted.toString() );

    // Check PrivateKey
    // ----------------------------------------------------------

    // PrivateKey
    // let privateKey = hexXor(decrypted.toString(), derived1);
    const privateKey = decrypted.toString();
    // console.log( "privateKey: ", privateKey );
    return privateKey;
}

/**
 * Checks if the password supplied to decrypt was correct.
 *
 * This method was taken out from decrypt, because it needs to create public key from private key
 * and it needs to be supplied from outside.
 *
 * @param checksum
 * @param publicKey Public key from decrypted key
 */
export function checkDecrypted(checksum: string | Address, publicKey: string): void {
    // const assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    // let assembled = Buffer.from(encryptedKey, 'base64').toString('hex')

    // console.log( "assembled: ", assembled );

    // const addressHash = assembled.substr(0, 8);
    // console.log( "addressHash: ", addressHash );

    // console.log('publicKey', publicKey)
    let addressHash = '';
    if (typeof checksum === 'string' && checksum.length === 8) {
        addressHash = checksum;
    } else if (checksum instanceof Address) {
        addressHash = core.getChecksumFromAddress(checksum);
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    // Address
    const u160 = getSingleSigUInt160(publicKey);
    const address = u160ToAddress(u160);
    // console.log('address 2', address)

    // AddressHash
    const addressSha256 = CryptoJS.SHA256(address).toString();
    const addressSha2562 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addressHashNew = addressSha2562.slice(0, 8);

    if (addressHashNew !== addressHash) {

        // tslint:disable-next-line:no-console
        console.log('keyphrase error.');

        throw ERROR_CODE.Decrypto_ERROR;
    }

    // WIF
    // let wifKey = core.getWIFFromPrivateKey(privateKey);
    // console.log( "wifKey: ", wifKey );
}

export function encryptWithEcb(
    privateKey: string,
    publicKey: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    const u160 = getSingleSigUInt160(publicKey);
    // console.log( "programHash: ", programHash );
    const address = u160ToAddress(u160);
    // console.log( "address: ", address );
    const addressSha256 = CryptoJS.SHA256(address).toString();
    const addressSha2562 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addresshash = addressSha2562.slice(0, 8);
    // console.log( "addresshash: ", addresshash );
    // Scrypt
    const derived = Scrypt.hashSync(
        Buffer.from(keyphrase.normalize('NFC'), 'utf8'),
        Buffer.from(addresshash, 'hex'),
        scryptParams).toString('hex');
    const derived1 = derived.slice(0, 64);
    const derived2 = derived.slice(64);

    // AES Encrypt
    const xor = hexXor(privateKey, derived1);
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Hex.parse(xor),
        CryptoJS.enc.Hex.parse(derived2),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
    // console.log( "encrypted: ", encrypted.ciphertext.toString() );
    // Construct
    const assembled = OEP_HEADER + OEP_FLAG + addresshash + encrypted.ciphertext.toString();
    // console.log( "assembled: ", assembled );
    return Bs58check.encode(Buffer.from(assembled, 'hex'));
}

export function decryptWithEcb(
    encryptedKey: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    const assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    // console.log( "assembled: ", assembled );
    const addressHash = assembled.substr(6, 8);
    // console.log( "addressHash: ", addressHash );
    const encrypted = assembled.substr(-64);
    // console.log( "encrypted: ", encrypted );
    // Scrypt
    const derived = Scrypt.hashSync(
        Buffer.from(keyphrase.normalize('NFC'),
        'utf8'), Buffer.from(addressHash, 'hex'),
        scryptParams).toString('hex');
    const derived1 = derived.slice(0, 64);
    const derived2 = derived.slice(64);

    // AES Decrypt
    const ciphertexts = { ciphertext: CryptoJS.enc.Hex.parse(encrypted), salt: '', iv: '' };
    const decrypted = CryptoJS.AES.decrypt(
        ciphertexts,
        CryptoJS.enc.Hex.parse(derived2),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
    // console.log( "decrypted: ", decrypted.toString() );
    // Check PrivateKey
    // ----------------------------------------------------------
    // PrivateKey
    const privateKey = hexXor(decrypted.toString(), derived1);
    // console.log( "privateKey: ", privateKey );
    return privateKey;
}

/**
 * Checks if the password supplied to decrypt was correct.
 *
 * This method was taken out from decrypt, because it needs to create public key from private key
 * and it needs to be supplied from outside.
 *
 * @param encryptedKey Original encrypted key
 * @param decryptedKey Decrypted key with decrypt
 * @param publicKey Public key from decrypted key
 */
export function checkEcbDecrypted(encryptedKey: string, decryptedKey: string, publicKey: string): void {
    const assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    // console.log( "assembled: ", assembled );
    const addressHash = assembled.substr(6, 8);
    // console.log( "addressHash: ", addressHash );
    // Address
    const u160 = getSingleSigUInt160(publicKey);
    const address = u160ToAddress(u160);
    // console.log('address', address)
    // AddressHash
    const addressSha256 = CryptoJS.SHA256(address).toString();
    const addressSha2562 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addressHashNew = addressSha2562.slice(0, 8);

    if (addressHashNew !== addressHash) {
        // tslint:disable-next-line:no-console
        console.log('keyphrase error.');
        throw ERROR_CODE.Decrypto_ERROR;
    }
}
