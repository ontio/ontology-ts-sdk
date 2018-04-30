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

import * as elliptic from 'elliptic';
import * as secureRandom from 'secure-random';
import { hexstring2ab, ab2hexstring } from '../utils';
import { decrypt, encrypt, ScryptParams, checkDecrypted } from '../scrypt';
import { DEFAULT_ALGORITHM } from '../consts';
import { Key, JsonKey, KeyParameters, JsonKeyParameters } from './Key';
import { KeyType } from './KeyType';
import { SignatureSchema } from './SignatureSchema';
import { PublicKey } from './PublicKey';
import { Signature } from './Signature';

export class PrivateKey extends Key {
    /**
     * Signs the data with supplied private key using signature schema.
     * 
     * If the signature schema is not provided, the default schema for this key type is used.
     * 
     * @param msg Hex encoded input data
     * @param schema Signing schema to use
     */
    sign(msg: string, schema?: SignatureSchema): Signature {
        if (schema === undefined) {
            schema = this.algorithm.defaultSchema;
        }

        if (!this.isSchemaSupported(schema)) {
            throw new Error('Signature schema does not match key type.');
        }

        const hash = this.computeHash(msg, schema);
        const signed = this.computeSignature(hash, schema);
        
        return new Signature(schema, signed);
    }

    /**
     * Generates random Private key with default parameters.
     */
    static random(): PrivateKey {
        return PrivateKey.deserializeJson({
            algorithm: DEFAULT_ALGORITHM.algorithm,
            parameters: DEFAULT_ALGORITHM.parameters as JsonKeyParameters,
            key: ab2hexstring(secureRandom(32))
        });
    }

    /**
     * Derives Public key out of Private key.
     */
    getPublicKey(): PublicKey {
        switch(this.algorithm) {
            case KeyType.ECDSA:
                return this.getEcDSAPublicKey();
            case KeyType.EDDSA:
                return this.getEdDSAPublicKey();
            case KeyType.SM2:
            default:
                throw new Error('Unsupported signature schema.');
        }
    }

    /**
     * Decrypts encrypted private key with supplied password.
     * 
     * @param keyphrase Password to decrypt with
     * @param params Optional Scrypt params
     */
    decrypt(keyphrase: string, params?: ScryptParams): PrivateKey {
        const decrypted = decrypt(this.key, keyphrase, params);
        const decryptedKey = new PrivateKey(decrypted, this.algorithm, this.parameters);
        checkDecrypted(this.key, decrypted, decryptedKey.getPublicKey().key);

        return decryptedKey;
    }

    /**
     * Encrypts private key with supplied password.
     * 
     * @param keyphrase Password to encrypt with
     * @param params Optional Scrypt params
     */
    encrypt(keyphrase: string, params?: ScryptParams): PrivateKey {
        const encrypted = encrypt(this.key, this.getPublicKey().key, keyphrase, params);
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
     * Computes signature of message hash using specified signature schema.
     * 
     * @param hash Message hash
     * @param schema Signature schema to use
     */
    computeSignature(hash: string, schema: SignatureSchema): string {
        switch(schema) {
            case SignatureSchema.ECDSAwithSHA224:
            case SignatureSchema.ECDSAwithSHA256:
            case SignatureSchema.ECDSAwithSHA384:
            case SignatureSchema.ECDSAwithSHA512:
            case SignatureSchema.ECDSAwithSHA3_224:
            case SignatureSchema.ECDSAwithSHA3_256:
            case SignatureSchema.ECDSAwithSHA3_384:
            case SignatureSchema.ECDSAwithSHA3_512:
            case SignatureSchema.ECDSAwithRIPEMD160:
                return this.computeEcDSASignature(hash);
            case SignatureSchema.EDDSAwithSHA512:
                return this.computeEdDSASignature(hash);
            case SignatureSchema.SM2withSM3:
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
        const signed = ec.sign(hash, this.key, null);
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
     * Creates PrivateKey from Json representation.
     * 
     * @param json Json private key representation
     * 
     */
    static deserializeJson(json: JsonKey): PrivateKey {
        return new PrivateKey(
            json.key,
            KeyType.fromLabel(json.algorithm),
            KeyParameters.deserializeJson(json.parameters)
        );
    }
};
