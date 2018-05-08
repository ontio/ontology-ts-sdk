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
import { Message, Metadata } from "../message";
import { Signature, SignatureScheme } from "../crypto";
import { ClaimProof } from "./ClaimProof";

/**
 * Type of revocation.
 */
export enum RevocationType {
    AttestContract = 'AttestContract',
    RevocationList = 'RevocationList'
};

/**
 * Revocation definition.
 */
export interface Revocation {
    /**
     * Type of revocation.
     */
    type: RevocationType;

    /**
     * Url of revocation list if type is RevocationList
     */
    url?: string;

    /**
     * Address of attest contract if type is AttestContract
     */
    addr?: string;
};

/**
 * Verifiable claim.
 * 
 * TODO: override verify to add claim proof verification and revocation verification.
 */
export class Claim extends Message {
    version: string;
    context: string;
    content: any;
    revocation?: Revocation;
    
    useProof: boolean;
    proof?: ClaimProof;

    constructor(metadata: Metadata, signature: Signature | undefined, useProof?: boolean) {
        super(metadata, signature);
        this.useProof = useProof === true;
    }

    protected payloadToJSON(): any {
        return {
            ver: this.version,
            '@context': this.context,
            clm: this.content,
            'clm-rev': this.revocation
        };
    }

    protected payloadFromJSON(json: any): void {
        this.version = json.ver;
        this.context = json['@context'];
        this.content = json.clm;
        this.revocation = json['clm-rev'];
    }

    static deserialize(jwt: string): Claim {
        return super.deserializeInternal(jwt, (m, s) => new Claim(m, s));
    }

    /**
     * Serializes the claim into JWT/JWT-X format.
     * 
     * Override default implementation by adding proof if available.
     */
    serialize(): string {
        if (this.useProof) {
            const jwt = super.serialize();
            const proof = this.serializeProof();
    
            return jwt + '.' + proof;
        } else {
            return super.serialize();
        }
    }

    /**
     * Serializes the header into JWT/JWT-X encoded header.
     * 
     * Override default implementation by adding proof if available.
     * 
     * @param algorithm Signature algorithm used
     * @param publicKeyId The ID of a signature public key 
     */
    protected serializeHeader(
        algorithm: SignatureScheme | undefined, 
        publicKeyId: string | undefined
    ): string {
        if (this.useProof) {
            if (algorithm === undefined || publicKeyId === undefined) {
                throw new Error('Signature is needed fow JWT-X.');
            } else {
                const header = {
                    alg: algorithm.labelJWS,
                    typ: 'JWT-X',
                    kid: publicKeyId
                };
    
                const stringified = JSON.stringify(header);
                return b64.encode(stringified, 'utf-8');
            } 
        } else {
            return super.serializeHeader(algorithm, publicKeyId);
        }
    }

    /**
     * Serializes the proof into JWT-X.
     */
    protected serializeProof(): string {
        const stringified = JSON.stringify(this.proof);
        return b64.encode(stringified, 'utf-8');
    }
}
