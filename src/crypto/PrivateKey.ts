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

import * as bip39 from 'bip39';
import * as elliptic from 'elliptic';
import * as secureRandom from 'secure-random';
import { sm2 } from 'sm.js';
import * as wif from 'wif';
import { DEFAULT_ALGORITHM, DEFAULT_SM2_ID, ONT_BIP44_PATH } from '../consts';
import { ERROR_CODE } from '../error';
import { decryptWithGcm, encryptWithGcm, ScryptParams } from '../scrypt';
import { ab2hexstring, hexstring2ab, isBase64, str2hexstr } from '../utils';
import { Address } from './address';
import { Key, KeyParameters } from './Key';
import { KeyType } from './KeyType';
import { PublicKey } from './PublicKey';
import { Signable } from './signable';
import { Signature } from './Signature';
import { SignatureScheme } from './SignatureScheme';

// tslint:disable-next-line:no-var-requires
const HDKey = require('@ont-community/hdkey-secp256r1');

export class PrivateKey extends Key {
  /**
   * Generates random Private key using supplied Key type and parameters.
   *
   * If no Key type or parameters is supplied, default SDK key type with default parameters will be used.
   *
   * @param keyType The key type
   * @param parameters The parameters for the key type
   */
    static random(keyType?: KeyType, parameters?: KeyParameters): PrivateKey {
        if (keyType === undefined) {
            keyType = KeyType.fromLabel(DEFAULT_ALGORITHM.algorithm);
        }

        if (parameters === undefined) {
            parameters = KeyParameters.deserializeJson(DEFAULT_ALGORITHM.parameters);
        }

        return new PrivateKey(ab2hexstring(secureRandom(32)), keyType, parameters);
    }

    /**
     * Creates PrivateKey from Wallet Import Format (WIF) representation.
     *
     * @param wifkey WIF private key representation
     *
     */
    static deserializeWIF(wifkey: string): PrivateKey {
        const key = ab2hexstring(wif.decode(wifkey, 128).privateKey);
        return new PrivateKey(key);
    }

    /**
     * Creates PrivateKey from mnemonic according to BIP39 protocol.
     *
     * @param mnemonic Space separated list of words
     *
     */
    static generateFromMnemonic(mnemonic: string, derivePath: string = ONT_BIP44_PATH): PrivateKey {
        if (mnemonic.split(' ').length < 12) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        const seed = bip39.mnemonicToSeedHex(mnemonic);

        // generate privateKey
        // const pri = seed.substr(0, 64);
        const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
        const pri = hdkey.derive(derivePath);
        const key = Buffer.from(pri.privateKey).toString('hex');
        const privateKey = new PrivateKey(key);
        return privateKey;
    }

    /**
     * Signs the data with supplied private key using signature schema.
     *
     * If the signature schema is not provided, the default schema for this key type is used.
     *
     * This method is not suitable, if external keys (Ledger, TPM, ...) support is required.
     *
     * @param msg Hex encoded input data or Signable object
     * @param schema Signing schema to use
     * @param publicKeyId Id of public key
     */
    sign(msg: string | Signable, schema?: SignatureScheme, publicKeyId?: string): Signature {
        if (schema === undefined) {
            schema = this.algorithm.defaultSchema;
        }

        if (!this.isSchemaSupported(schema)) {
            throw new Error('Signature schema does not match key type.');
        }

        // retrieves content to sign if not provided directly
        if (typeof msg !== 'string') {
            msg = msg.getSignContent();
        }

        let hash: string;
        if (schema === SignatureScheme.SM2withSM3) {
            // library sm.js (SM2withSM3) has implemented hashing as part of signing, therefore it is skipped
            hash = msg;
        } else {
            hash = this.computeHash(msg, schema);
        }

        const signed = this.computeSignature(hash, schema);
        return new Signature(schema, signed, publicKeyId);
    }

    /**
     * Asynchroniously signs the data with supplied private key using signature schema.
     *
     * If the signature schema is not provided, the default schema for this key type is used.
     *
     * This method is suitable, if external keys (Ledger, TPM, ...) support is required.
     *
     * @param msg Hex encoded input data or Signable object
     * @param schema Signing schema to use
     * @param publicKeyId Id of public key
     */
    async signAsync(msg: string | Signable, schema?: SignatureScheme, publicKeyId?: string): Promise<Signature> {
        return this.sign(msg, schema, publicKeyId);
    }

    /**
     * Derives Public key out of Private key.
     */
    getPublicKey(): PublicKey {
        switch (this.algorithm) {
        case KeyType.ECDSA:
            return this.getEcDSAPublicKey();
        case KeyType.EDDSA:
            return this.getEdDSAPublicKey();
        case KeyType.SM2:
            return this.getSM2PublicKey();
        default:
            throw new Error('Unsupported signature schema.');
        }
    }

    /**
     * Decrypts encrypted private key with supplied password.
     *
     * @param keyphrase Password to decrypt with
     * @param address For aad in decryption
     * @param 16 secure random bytes
     * @param params Optional Scrypt params
     */
    decrypt(keyphrase: string, address: Address, salt: string, params?: ScryptParams): PrivateKey {
        // const decrypted = decrypt(this.key, keyphrase, checksum, params);
        if (salt.length === 24 && isBase64(salt)) {
            salt = Buffer.from(salt, 'base64').toString('hex');
        }
        const decrypted = decryptWithGcm(this.key, address, salt, keyphrase, params);
        const decryptedKey = new PrivateKey(decrypted, this.algorithm, this.parameters);
        // checkDecrypted(checksum, decryptedKey.getPublicKey().serializeHex());
        const pk = decryptedKey.getPublicKey();
        const addrTmp = Address.fromPubKey(pk);
        if (addrTmp.toBase58() !== address.toBase58()) {
            throw ERROR_CODE.Decrypto_ERROR;
        }
        return decryptedKey;
    }

    /**
     * Encrypts private key with supplied password.
     *
     * @param keyphrase Password to encrypt with
     * @param address For aad in encryption
     * @param salt 16 secure random bytes
     * @param params Optional Scrypt params
     */
    encrypt(keyphrase: string, address: Address, salt: string, params?: ScryptParams): PrivateKey {
        // add address check
        const publicKey = this.getPublicKey();
        const addr = Address.fromPubKey(publicKey).toBase58();
        if (addr !== address.toBase58()) {
            throw ERROR_CODE.INVALID_ADDR;
        }
        const encrypted = encryptWithGcm(this.key, address, salt, keyphrase, params);
        return new PrivateKey(encrypted, this.algorithm, this.parameters);
    }

    /**
     * Derives Public key out of Private key using EcDSA algorithm.
     */
    getEcDSAPublicKey(): PublicKey {
        const ec = new elliptic.ec(this.parameters.curve.preset);
        const keyPair = ec.keyFromPrivate(this.key, 'hex');
        const pk = keyPair.getPublic(true, 'hex');

        return new PublicKey(pk, this.algorithm, this.parameters);
    }

    /**
     * Derives Public key out of Private key using EdDSA algorithm.
     */
    getEdDSAPublicKey(): PublicKey {
        const eddsa = new elliptic.eddsa(this.parameters.curve.preset);
        const keyPair = eddsa.keyFromSecret(this.key, 'hex');
        const pk = keyPair.getPublic(true, 'hex');

        return new PublicKey(pk, this.algorithm, this.parameters);
    }

    /**
     * Derives Public key out of Private key using SM2 algorithm.
     */
    getSM2PublicKey(): PublicKey {
        const keyPair = sm2.SM2KeyPair(null, this.key);
        const pk = keyPair.pubToString('compress');

        return new PublicKey(pk, this.algorithm, this.parameters);
    }

    /**
     * Computes signature of message hash using specified signature schema.
     *
     * @param hash Message hash
     * @param schema Signature schema to use
     */
    computeSignature(hash: string, schema: SignatureScheme): string {
        switch (schema) {
        case SignatureScheme.ECDSAwithSHA224:
        case SignatureScheme.ECDSAwithSHA256:
        case SignatureScheme.ECDSAwithSHA384:
        case SignatureScheme.ECDSAwithSHA512:
        case SignatureScheme.ECDSAwithSHA3_224:
        case SignatureScheme.ECDSAwithSHA3_256:
        case SignatureScheme.ECDSAwithSHA3_384:
        case SignatureScheme.ECDSAwithSHA3_512:
        case SignatureScheme.ECDSAwithRIPEMD160:
            return this.computeEcDSASignature(hash);
        case SignatureScheme.EDDSAwithSHA512:
            return this.computeEdDSASignature(hash);
        case SignatureScheme.SM2withSM3:
            return this.computeSM2Signature(hash);
        default:
            throw new Error('Unsupported signature schema.');
        }
    }

    /**
     * Computes EcDSA signature of message hash. Curve name is derrived from private key.
     *
     * @param hash Message hash
     */
    computeEcDSASignature(hash: string): string {
        const ec = new elliptic.ec(this.parameters.curve.preset);
        const signed = ec.sign(hash, this.key, { canonical: true });
        return Buffer.concat([
            signed.r.toArrayLike(Buffer, 'be', 32),
            signed.s.toArrayLike(Buffer, 'be', 32)
        ]).toString('hex');
    }

    /**
     * Computes EdDSA signature of message hash. Curve name is derrived from private key.
     *
     * @param hash Message hash
     */
    computeEdDSASignature(hash: string): string {
        const eddsa = new elliptic.eddsa(this.parameters.curve.preset);
        const signed = eddsa.sign(hash, this.key, null);
        return Buffer.concat([
            signed.R.toArrayLike(Buffer, 'be', 32),
            signed.S.toArrayLike(Buffer, 'be', 32)
        ]).toString('hex');
    }

    /**
     * Computes SM2 signature of message hash.
     *
     * Only default SM2 ID is supported.
     *
     * @param hash Message hash
     */
    computeSM2Signature(hash: string): string {
        const keyPair = sm2.SM2KeyPair(null, this.key);
        const signed = keyPair.sign(hexstring2ab(hash));

        const id = DEFAULT_SM2_ID;

        return str2hexstr(id + '\0') + signed.r + signed.s;
    }

    /**
     * Gets Wallet Import Format (WIF) representation of the PrivateKey.
     *
     */
    serializeWIF(): string {
        return wif.encode(128, Buffer.from(this.key, 'hex'), true);
    }
}
