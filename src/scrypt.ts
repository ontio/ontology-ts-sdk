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
import * as base58 from 'base-58';
import { createCipheriv, createDecipheriv } from 'crypto';
import * as CryptoJS from 'crypto-js';
import * as asyncScrypt from 'scrypt-async';
import { DEFAULT_SCRYPT, OEP_FLAG, OEP_HEADER } from './consts';
import { Address } from './crypto/address';
import { PublicKey } from './crypto/PublicKey';
import { ERROR_CODE } from './error';
import { ab2hexstring, hexstring2ab, hexXor, isHexString, StringReader } from './utils';

/**
 * Decribtes the structure of params for scrypt
 */
export interface ScryptParams {
    cost: number;
    blockSize: number;
    parallel: number;
    size: number;
}

/**
 * Synchronious call to scrypt-async-js.
 *
 * @param keyphrase Keyphrase to use
 * @param addressHash Hex encoded address
 * @param params Scrypt params
 */
function scrypt(keyphrase: string, addressHash: string, params: ScryptParams) {
    let derived: number[] = [];

    asyncScrypt(
        keyphrase.normalize('NFC'),
        hexstring2ab(addressHash),
        {
            N: params.cost,
            r: params.blockSize,
            p: params.parallel,
            dkLen: params.size
        },
        (result: string | number[]) => {
            derived = result as number[];
        }
    );
    return new Buffer(derived);
}

/**
 * Encrypt with aes-ctr
 */
export function encryptWithCtr(
    privateKey: string,
    publicKeyEncoded: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    // let privateKey = PrivateKey.deserializeWIF(wifKey);
    // console.log( "privateKey: ", privateKey );

    // console.log( "publickeyEncode: ", publicKey );

    const publicKey = PublicKey.deserializeHex(new StringReader(publicKeyEncoded));

    const address = Address.fromPubKey(publicKey);
    // console.log( "address: ", address );

    const addresshash = address.getB58Checksum();
    // console.log( "addresshash: ", addresshash );

    // Scrypt
    const derived = scrypt(keyphrase, addresshash, scryptParams).toString('hex');
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
 * Decrypt with aes-ctr
 * @param encryptedKey encrypted private key
 * @param keyphrase user's password to encrypt private key
 * @param saltOrAddress 4 hex encoded bytes salt or Address object
 */
export function decryptWithCtr(
    encryptedKey: string,
    keyphrase: string,
    saltOrAddress: string | Address,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    // let assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    const encrypted = Buffer.from(encryptedKey, 'base64').toString('hex');

    // tslint:disable-next-line:no-console
    // console.log('dec assembled: ', encrypted);

    let salt = '';
    if (typeof saltOrAddress === 'string' && saltOrAddress.length === 8) {
        salt = saltOrAddress;
    } else if (saltOrAddress instanceof Address) {
        salt = saltOrAddress.getB58Checksum();
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }

    // let addressHash = assembled.substr(0, 8);
    // console.log( "dec addressHash: ", addressHash );

    // let encrypted = assembled.substr(8);
    // console.log( "encrypted: ", encrypted );

    // Scrypt
    const derived = scrypt(keyphrase, salt, scryptParams).toString('hex');
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
 * @param saltOrAddress 4 hex encoded bytes salt or Address object
 * @param publicKeyEncoded Public key from decrypted key
 */
export function checkCtrDecrypted(saltOrAddress: string | Address, publicKeyEncoded: string): void {
    // const assembled = ab2hexstring(Bs58check.decode(encryptedKey));
    // let assembled = Buffer.from(encryptedKey, 'base64').toString('hex')

    // console.log( "assembled: ", assembled );

    // const addressHash = assembled.substr(0, 8);
    // console.log( "addressHash: ", addressHash );

    // console.log('publicKey', publicKey)
    let salt = '';
    if (typeof saltOrAddress === 'string' && saltOrAddress.length === 8) {
        salt = saltOrAddress;
    } else if (saltOrAddress instanceof Address) {
        salt = saltOrAddress.getB58Checksum();
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }

    const publicKey = PublicKey.deserializeHex(new StringReader(publicKeyEncoded));

    // Address
    const address = Address.fromPubKey(publicKey);
    // console.log('address 2', address)

    // AddressHash
    const saltNew = address.getB58Checksum();

    if (saltNew !== salt) {

        // tslint:disable-next-line:no-console
        console.log('keyphrase error.');

        throw ERROR_CODE.Decrypto_ERROR;
    }

    // WIF
    // let wifKey = privateKey.serializeWIF();
    // console.log( "wifKey: ", wifKey );
}

/**
 * Encrypt with aes-ecb
 */
export function encryptWithEcb(
    privateKey: string,
    publicKeyEncoded: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    const publicKey = PublicKey.deserializeHex(new StringReader(publicKeyEncoded));

    const address = Address.fromPubKey(publicKey);
    // console.log( "address: ", address );

    const addresshash = address.getB58Checksum();
    // console.log( "addresshash: ", addresshash );
    // Scrypt
    const derived = scrypt(keyphrase, addresshash, scryptParams).toString('hex');
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
    return base58.encode(Buffer.from(assembled, 'hex'));
}

/**
 * Decrypt with aes-ecb
 */
export function decryptWithEcb(
    encryptedKey: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
): string {
    const assembled = ab2hexstring(base58.decode(encryptedKey));
    // console.log( "assembled: ", assembled );
    const addressHash = assembled.substr(6, 8);
    // console.log( "addressHash: ", addressHash );
    const encrypted = assembled.substr(-64);
    // console.log( "encrypted: ", encrypted );
    // Scrypt
    const derived = scrypt(keyphrase, addressHash, scryptParams).toString('hex');
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
 * @param publicKeyEncoded Public key from decrypted key
 */
export function checkEcbDecrypted(encryptedKey: string, decryptedKey: string, publicKeyEncoded: string): void {
    const assembled = ab2hexstring(base58.decode(encryptedKey));
    // console.log( "assembled: ", assembled );
    const addressHash = assembled.substr(6, 8);

    const publicKey = PublicKey.deserializeHex(new StringReader(publicKeyEncoded));

    // Address
    const address = Address.fromPubKey(publicKey);
    // console.log('address', address)
    // AddressHash
    const addressHashNew = address.getB58Checksum();

    if (addressHashNew !== addressHash) {
        // tslint:disable-next-line:no-console
        console.log('keyphrase error.');
        throw ERROR_CODE.Decrypto_ERROR;
    }
}

/**
 * Encrypt with aes-gcm-256
 * This is the default encryption algorithm for private key
 * @param privateKey Private key to encpryt with
 * @param address Adderss to encrypt with
 * @param salt Salt to encrypt with
 * @param keyphrase User's password
 * @param scryptParams Optional params to encrypt
 */
export function encryptWithGcm(
    privateKey: string,
    address: Address,
    salt: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
) {
    if (!isHexString(privateKey)) {
        throw new Error(ERROR_CODE.INVALID_PARAMS + ', Invalid private key');
    }
    const derived = scrypt(keyphrase, salt, scryptParams);
    const derived1 = derived.slice(0, 12);
    const derived2 = derived.slice(32);
    const key = derived2;
    const iv = derived1;
    const aad = new Buffer(address.toBase58());
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(aad);
    const plainText = Buffer.from(privateKey, 'hex');
    let ciphertext = cipher.update(plainText);
    // ciphertext += cipher.final();
    const final = cipher.final();
    const authTag = cipher.getAuthTag();
    ciphertext = Buffer.concat([ciphertext, final]);

    const result = Buffer.concat([ciphertext, authTag]);
    return result.toString('base64');
}

/**
 * Decrypt with aes-256-gcm
 * @param encrypted Encrypted private key
 * @param address Address to decrypt with
 * @param salt Salt to decrypt with
 * @param keyphrase User's password
 * @param scryptParams Optioanl params to decrypt with
 */
export function decryptWithGcm(
    // ciphertext: string,
    // authTag: string,
    encrypted: string,
    address: Address,
    salt: string,
    keyphrase: string,
    scryptParams: ScryptParams = DEFAULT_SCRYPT
) {
    if (salt.length !== 32) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    const result = Buffer.from(encrypted, 'base64');
    const ciphertext = result.slice(0, result.length - 16);
    const authTag = result.slice(result.length - 16);
    const derived = scrypt(keyphrase, salt, scryptParams);
    const derived1 = derived.slice(0, 12);
    const derived2 = derived.slice(32);
    const key = derived2;
    const iv = derived1;
    const aad = new Buffer(address.toBase58());
    // const auth = new Buffer(authTag, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext).toString('hex');

    try {
        decrypted += decipher.final().toString('hex');
    } catch (err) {
        throw ERROR_CODE.Decrypto_ERROR;
    }
    return decrypted;
}
