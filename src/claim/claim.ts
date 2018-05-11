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
import { Signature, SignatureScheme, PrivateKey } from "../crypto";
import { hexstr2str, ab2hexstring } from '../utils';
import { ClaimProof } from "./claimProof";
import { buildCommitRecordTx, buildRevokeRecordTx, buildGetRecordStatusTx } from '../smartcontract/recordContract';
import { WebsocketClient } from '../network/websocket/websocketClient';
import { AttestNotifyEvent } from './attestNotifyEvent';
import RestClient from '../network/rest/restClient';

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
 * TODO: override verify to add claim proof verification.
 */
export class Claim extends Message {
    version: string;
    context: string;
    content: any;
    revocation?: Revocation;
    
    useProof: boolean;
    proof?: ClaimProof;

    constructor(metadata: Metadata, signature?: Signature | undefined, useProof?: boolean) {
        super(metadata, signature);
        this.useProof = useProof === true;
    }

    /**
     * Overrides default message verification with added attest verification.
     * @param url Restful endpoint of Ontology node
     * @param checkAttest Should be the attest tested
     */
    async verify(url: string, checkAttest = true): Promise<boolean> {
        const result = await super.verify(url);

        if (result && checkAttest) {
            return this.getStatus(url);
        } else {
            return result;
        }
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
        return super.deserializeInternal(jwt, (m:any, s:any) => new Claim(m, s));
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
     * Attests the claim onto blockchain.
     * 
     * @param url Websocket endpoint of Ontology node
     * @param privateKey Private key to sign the transaction
     */
    async attest(url: string, privateKey: PrivateKey): Promise<boolean> {
        const attesterId = this.metadata.issuer;
        const claimId = this.metadata.messageId;
        if (claimId === undefined) {
            throw new Error('Claim id not specified.');
        }

        const client = new WebsocketClient(url);
        const tx = buildCommitRecordTx(claimId, attesterId, privateKey);
        const response = await client.sendRawTransaction(tx.serialize(), false, true);

        const event = AttestNotifyEvent.deserialize(response);
        return event.Result[0].States[0] === 'Push';
    }

    /**
     * Revokes claim attest from blockchain.
     * 
     * @param privateKey Private key to sign the transaction
     * @param url Websocket endpoint of Ontology node
     */
    async revoke(url: string, privateKey: PrivateKey): Promise<boolean> {
        const attesterId = this.metadata.issuer;
        const claimId = this.metadata.messageId;
        if (claimId === undefined) {
            throw new Error('Claim id not specified.');
        }

        const client = new WebsocketClient(url);
        const tx = buildRevokeRecordTx(claimId, attesterId, privateKey);
        const response = await client.sendRawTransaction(tx.serialize(), false, true);
        
        const event = AttestNotifyEvent.deserialize(response);

        return event.Result[0].States[0] === 'Push';
    }

    /**
     * Gets status of the claim attest.
     * 
     * @param url Restful endpoint of Ontology node
     */
    async getStatus(url: string): Promise<boolean> {
        const attesterId = this.metadata.issuer;
        const claimId = this.metadata.messageId;
        if (claimId === undefined) {
            throw new Error('Claim id not specified.');
        }

        const client = new RestClient(url);
        const tx = buildGetRecordStatusTx(claimId);
        
        const response = await client.sendRawTransaction(tx.serialize(), true);
        const result = GetStatusResponse.deserialize(response);

        return result.status === Status.ATTESTED && result.attesterId === attesterId;
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

/**
 * Helper class for deserializing GetStatus response.
 */
class GetStatusResponse {
    status: Status;
    attesterId: string;
    time: string;

    static deserialize(r: any): GetStatusResponse {
        const response = new GetStatusResponse();

        if (r.Result === '') {
            response.status = Status.NOTFOUND;
            return response;
        }

        const decoded = hexstr2str(r.Result);
        const data = decoded.split('#');

        if (data.length != 3) {
            throw new Error('Failed to decode response.');
        }

        response.status = data[0] as Status;
        response.attesterId = data[1];
        response.time = data[2];
        return response;
    }
}

enum Status {
    REVOKED = '0',
    ATTESTED = '1',
    NOTFOUND = '-1'
};
