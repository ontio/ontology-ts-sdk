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
import { ScryptParams } from '../../scrypt';
import { Address } from '../address';
import { CurveLabel } from '../CurveLabel';
import { JsonKey, KeyParameters } from '../Key';
import { KeyType } from '../KeyType';
import { computesSignature, getPublicKey } from '../ledger/ledgerProxy';
import { PrivateKey } from '../PrivateKey';
import { PublicKey } from '../PublicKey';
import { Signature } from '../Signature';
import { SignatureScheme } from '../SignatureScheme';

/**
 * Private Key implementation delegating signing and public key derivation to Ledger HW.
 */
export class LedgerKey extends PrivateKey {
    /**
     * Initializes Ledger Key based on the BIP44 index number.
     *
     * The key is compressed, otherwise Address.fromPubKey will give wrong results.
     *
     * @param index BIP44 index
     */
    static async create(index: number): Promise<LedgerKey> {
        const uncompressed = await getPublicKey(index);

        const ec = new elliptic.ec(CurveLabel.SECP256R1.preset);
        const keyPair = ec.keyFromPublic(uncompressed, 'hex');
        const compressed = keyPair.getPublic(true, 'hex');

        return new LedgerKey(index, compressed);
    }

    publicKey: PublicKey;   // transient

    index: number;

    constructor(index: number, pKey: string) {
        super('', KeyType.ECDSA, new KeyParameters(CurveLabel.SECP256R1));

        this.index = index;
        this.publicKey = new PublicKey(pKey, this.algorithm, this.parameters);
    }

    /**
     * Signs the data with the Ledger HW.
     *
     * If the signature schema is not provided, the default schema for this key type is used.
     *
     * @param msg Hex encoded input data
     * @param schema Signing schema to use
     * @param publicKeyId Id of public key
     */
    async sign(msg: string, schema?: SignatureScheme, publicKeyId?: string): Promise<Signature> {
        if (schema === undefined) {
            schema = SignatureScheme.ECDSAwithSHA256;
        }

        if (!this.isSchemaSupported(schema)) {
            throw new Error('Signature schema does not match key type.');
        }

        const signed = await computesSignature(this.index, msg);

        return new Signature(schema, signed, publicKeyId);
    }

    /**
     * Derives Public key out of Private key.
     *
     * Uses cached public key, so no further communication with the Ledger HW is necessary.
     */
    getPublicKey(): PublicKey {
        return this.publicKey;
    }

    /**
     * Only ECDSAwithSHA256 is supported for Ledger key.
     */
    isSchemaSupported(schema: SignatureScheme): boolean {
        return schema === SignatureScheme.ECDSAwithSHA256;
    }

    /**
     * Gets JSON representation of the Ledger Key.
     */
    serializeJson(): JsonKey {
        return {
            algorithm: this.algorithm.label,
            external: {
                pKey: this.publicKey.key,
                type: 'LEDGER'
            },
            parameters: this.parameters.serializeJson(),
            key: null
        };
    }

    /**
     * Decryption is not supported for Ledger Key. This operation is NOOP.
     */
    decrypt(keyphrase: string, address: Address, salt: string, params?: ScryptParams): PrivateKey {
        return this;
    }

    /**
     * Encryption is not supported for Ledger Key. This operation is NOOP.
     */
    encrypt(keyphrase: string, address: Address, salt: string, params?: ScryptParams): PrivateKey {
        return this;
    }
}
