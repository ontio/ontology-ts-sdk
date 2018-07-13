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

import * as cryptoJS from 'crypto-js';
import { sha3_224, sha3_256, sha3_384, sha3_512 } from 'js-sha3';
import { sm3 } from 'sm.js';
import { DEFAULT_ALGORITHM } from '../consts';
import { hexstring2ab } from '../utils';
import { CurveLabel } from './CurveLabel';
import { KeyType } from './KeyType';
import { SignatureScheme } from './SignatureScheme';

/**
 * Specific parameters for the key type.
 */
export class KeyParameters {
    /**
     * Create KeyParameters from json.
     * @param json JsonKeyParameters
     */
    static deserializeJson(json: JsonKeyParameters): KeyParameters {
        return new KeyParameters(
        CurveLabel.fromLabel(json.curve)
        );
    }
    curve: CurveLabel;

    constructor(curve: CurveLabel) {
        this.curve = curve;
    }

    /**
     * Serialize KeyParameters to json.
     */
    serializeJson(): JsonKeyParameters {
        return {
            curve: this.curve.label
        };
    }
}

/**
 * Common representation of private or public key
 */
export class Key {
    /**
     * Algorithm used for key generation.
     */
    algorithm: KeyType;

    /**
     * Parameters of the algorithm.
     */
    parameters: KeyParameters;

    /**
     * Key data.
     */
    key: string;

    /**
     * Creates Key.
     *
     * If no algorithm or parameters are specified, default values will be used.
     * This is strongly discurraged, because it will forbid using other Key types.
     * Therefore use it only for testing.
     *
     * @param key Hex encoded key value
     * @param algorithm Key type
     * @param parameters Parameters of the key type
     */
    constructor(key: string, algorithm?: KeyType, parameters?: KeyParameters) {
        this.key = key;

        if (algorithm === undefined) {
            algorithm = KeyType.fromLabel(DEFAULT_ALGORITHM.algorithm);
        }

        if (parameters === undefined) {
            parameters = KeyParameters.deserializeJson(DEFAULT_ALGORITHM.parameters);
        }

        this.algorithm = algorithm;
        this.parameters = parameters;
    }

    /**
     * Computes hash of message using hashing function of signature schema.
     *
     * @param msg Hex encoded input data
     * @param scheme Signing schema to use
     */
    computeHash(msg: string, scheme: SignatureScheme): string {
        switch (scheme) {
        case SignatureScheme.ECDSAwithSHA224:
            return cryptoJS.SHA224(cryptoJS.enc.Hex.parse(msg)).toString();
        case SignatureScheme.ECDSAwithSHA256:
            return cryptoJS.SHA256(cryptoJS.enc.Hex.parse(msg)).toString();
        case SignatureScheme.ECDSAwithSHA384:
            return cryptoJS.SHA384(cryptoJS.enc.Hex.parse(msg)).toString();
        case SignatureScheme.ECDSAwithSHA512:
        case SignatureScheme.EDDSAwithSHA512:
            return cryptoJS.SHA512(cryptoJS.enc.Hex.parse(msg)).toString();
        case SignatureScheme.ECDSAwithSHA3_224:
            return sha3_224(hexstring2ab(msg));
        case SignatureScheme.ECDSAwithSHA3_256:
            return sha3_256(hexstring2ab(msg));
        case SignatureScheme.ECDSAwithSHA3_384:
            return sha3_384(hexstring2ab(msg));
        case SignatureScheme.ECDSAwithSHA3_512:
            return sha3_512(hexstring2ab(msg));
        case SignatureScheme.ECDSAwithRIPEMD160:
            return cryptoJS.RIPEMD160(cryptoJS.enc.Hex.parse(msg)).toString();
        case SignatureScheme.SM2withSM3:
            return (new sm3()).sum(hexstring2ab(msg), 'hex');
        default:
            throw new Error('Unsupported hash algorithm.');
        }
    }

    /**
     * Tests if signing schema is compatible with key type.
     *
     * @param schema Signing schema to use
     */
    isSchemaSupported(schema: SignatureScheme): boolean {
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
            return this.algorithm === KeyType.ECDSA;
        case SignatureScheme.EDDSAwithSHA512:
            return this.algorithm === KeyType.EDDSA;
        case SignatureScheme.SM2withSM3:
            return this.algorithm === KeyType.SM2;
        default:
            throw new Error('Unsupported signature schema.');
        }
    }

    /**
     * Gets JSON representation of the Key (Public/Private).
     */
    serializeJson(): JsonKey {
        return {
            algorithm: this.algorithm.label,
            parameters: this.parameters.serializeJson(),
            key: this.key
        };
    }
}

/**
 * Json representation of the Key.
 */
export interface JsonKey {
    algorithm: string;
    parameters: JsonKeyParameters;
    key: string | null;
    external?: any | null;
}

/**
 * Json representation of the Key parameters.
 */
export interface JsonKeyParameters {
    curve: string;
}
