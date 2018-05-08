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

import * as b64 from 'base64-url';
import { SignatureScheme } from "./SignatureScheme";
import { num2hexstring } from "../utils";

/**
 * Signature generated by signing data with Private Key.
 */
export class Signature {
    algorithm: SignatureScheme;
    value: string;

    /**
     * Public key Id used for create this signature.
     * 
     */
    publicKeyId?: string;

    constructor(algorithm: SignatureScheme, value: string, publicKeyId?: string) {
        this.algorithm = algorithm;
        this.value = value;
        this.publicKeyId = publicKeyId;
    }

    /**
     * Serializes signature to Hex representation. 
     * 
     */
    serializeHex(): string {
        return num2hexstring(this.algorithm.hex) + this.value;
    }

    /**
     * Serializes signature to PGP representation with optional PublicKeyId.
     * 
     * @param keyId Whole Public Key Id in the form <ONTID>#keys-<id>
     */
    serializePgp(keyId?: string): PgpSignature {
        const encoded = new Buffer(this.value, 'hex').toString('base64');

        return {
            PublicKeyId: keyId,
            Format: 'pgp',
            Value: encoded,
            Algorithm: this.algorithm.label
        };
    }

    /**
     * Serializes signature to base64url format.
     */
    serializeJWT(): string {
        return b64.encode(this.value, 'hex');
    }

    static deserializeJWT(encoded: string, algorithm: SignatureScheme, publicKeyId: string): Signature {
        const decoded = b64.decode(encoded, 'hex');

        return new Signature(
            algorithm,
            decoded,
            publicKeyId
        );
    }

    static deserializePgp(pgpSignature: PgpSignature): Signature {
        return new Signature(
            SignatureScheme.fromLabel(pgpSignature.Algorithm),
            new Buffer(pgpSignature.Value, 'base64').toString('hex')
        );
    }
};

/**
 * PGP representation of the signature with embedded KeyId
 */
export interface PgpSignature {
    PublicKeyId?: string;
    Format: 'pgp';
    Algorithm: string;
    Value: string;
};
