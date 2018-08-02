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
import { sm2 } from 'sm.js';
import { DEFAULT_SM2_ID } from '../consts';
import { hexstr2str, hexstring2ab, num2hexstring, StringReader } from '../utils';
import { CurveLabel } from './CurveLabel';
import { Key, KeyParameters } from './Key';
import { KeyType } from './KeyType';
import { Signable } from './signable';
import { Signature } from './Signature';
import { SignatureScheme } from './SignatureScheme';

/**
 * Class to manage the public key with some userful functions.
 */
export class PublicKey extends Key {
    /**
     * Creates PublicKey from Hex representation.
     *
     * @param sr String reader
     * @param length Byte length of the serialized object
     *
     */
    static deserializeHex(sr: StringReader, length: number = 33): PublicKey {
        if (length === 33) { // ECDSA
            const algorithm = KeyType.ECDSA;
            const curve = CurveLabel.SECP256R1;
            const pk = sr.read(33);
            return new PublicKey(pk, algorithm, new KeyParameters(curve));
        } else {
            const algorithmHex = parseInt(sr.read(1), 16);
            const curveHex = parseInt(sr.read(1), 16);
            const pk = sr.read(length - 2);

            return new PublicKey(
                pk,
                KeyType.fromHex(algorithmHex),
                new KeyParameters(CurveLabel.fromHex(curveHex))
            );
        }
    }

    /**
     * Verifies if the signature was created with private key corresponding to supplied public key
     * and was not tampered with using signature schema.
     *
     * @param msg Hex encoded input data or Signable object
     * @param signature Signature object
     */
    verify(msg: string | Signable, signature: Signature): boolean {
        if (!this.isSchemaSupported(signature.algorithm)) {
            throw new Error('Signature schema does not match key type.');
        }

        // retrieves content to sign if not provided directly
        if (typeof msg !== 'string') {
            msg = msg.getSignContent();
        }

        let hash: string;
        if (signature.algorithm === SignatureScheme.SM2withSM3) {
            // library sm.js (SM2withSM3) has implemented hashing as part of verification, therefore it is skipped
            hash = msg;
        } else {
            hash = this.computeHash(msg, signature.algorithm);
        }

        return this.verifySignature(hash, signature.value, signature.algorithm);
    }

    /**
     * Serializes public key to Hex representation.
     *
     * Length definition is not included.
     */
    serializeHex(): string {
        let result = '';
        switch (this.algorithm) {
        case KeyType.ECDSA:
            result += this.key;
            break;
        case KeyType.EDDSA:
        case KeyType.SM2:
            result += num2hexstring(this.algorithm.hex);
            result += num2hexstring(this.parameters.curve.hex);
            result += this.key;
            break;
        }
        return result;
    }

    /**
     * For internal use.
     * @param hash Message hash
     * @param signature Hex encoded signature
     * @param schema Signature scheme to use
     */
    verifySignature(hash: string, signature: string, schema: SignatureScheme): boolean {
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
            return this.verifyEcDSASignature(hash, signature);
        case SignatureScheme.EDDSAwithSHA512:
            return this.verifyEdDSASignature(hash, signature);
        case SignatureScheme.SM2withSM3:
            return this.verifySM2Signature(hash, signature);
        default:
            throw new Error('Unsupported signature schema.');
        }
    }

    /**
     * Verifies EcDSA signature of message hash. Curve name is derrived from private key.
     *
     * @param hash Message hash
     * @param signature Hex encoded signature
     */
    verifyEcDSASignature(hash: string, signature: string): boolean {
        const r = signature.substr(0, 64);
        const s = signature.substr(64, 64);

        const ec = new elliptic.ec(this.parameters.curve.preset);
        return ec.verify(hash, { r, s }, this.key, 'hex');
    }

    /**
     * Verifies EdDSA signature of message hash. Curve name is derrived from private key.
     *
     * @param hash Message hash
     * @param signature Hex encoded signature
     */
    verifyEdDSASignature(hash: string, signature: string): boolean {
        const r = signature.substr(0, 64);
        const s = signature.substr(64, 64);

        const eddsa = new elliptic.eddsa(this.parameters.curve.preset);
        return eddsa.verify(hash, { r, s }, this.key, 'hex');
    }

    /**
     * Verifies SM2 signature of message hash.
     *
     * Only default SM2 ID is supported.
     *
     * @param hash Message hash
     * @param signature Hex encoded signature
     */
    verifySM2Signature(hash: string, signature: string): boolean {
        const reader = new StringReader(signature);

        const id = hexstr2str(reader.readNullTerminated());
        if (id !== DEFAULT_SM2_ID && id !== '') {
            throw new Error('Unsupported SM2 id used.');
        }

        const r = reader.read(32);
        const s = reader.read(32);

        const keyPair = sm2.SM2KeyPair(this.key);
        return keyPair.verify(hexstring2ab(hash), r, s);
    }
}

/**
 * Public key status enumaration.
 */
export class PublicKeyStatus {
    static values: PublicKeyStatus[] = [];

    static IN_USE = new PublicKeyStatus('in use');

    static REVOKED = new PublicKeyStatus('revoked');

    /**
     * Finds Public key status corresponding to specified label representation.
     *
     * @param label Hex encoded label
     */
    static fromHexLabel(hexLabel: string): PublicKeyStatus {
        const label = hexstr2str(hexLabel);

        const item = PublicKeyStatus.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    label: string;

    constructor(label: string) {
        this.label = label;

        PublicKeyStatus.values.push(this);
    }
}
