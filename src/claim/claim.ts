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
import { Address, PrivateKey, Signature, SignatureScheme } from '../crypto';
import RestClient from '../network/rest/restClient';
import { WebsocketClient } from '../network/websocket/websocketClient';
import {
    buildCommitRecordTx,
    buildGetRecordStatusTx,
    buildRevokeRecordTx
} from '../smartcontract/neovm/attestClaimTxBuilder';
import { signTransactionAsync } from '../transaction/transactionBuilder';
import { hexstr2str, StringReader } from '../utils';
import { AttestNotifyEvent } from './attestNotifyEvent';
import { ClaimProof } from './claimProof';
import { Message, Metadata } from './message';

/**
 * Type of revocation.
 */
export enum RevocationType {
    AttestContract = 'AttestContract',
    RevocationList = 'RevocationList'
}

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
}

/**
 * Verifiable claim.
 *
 * TODO: override verify to add claim proof verification.
 */
export class Claim extends Message {
    static deserialize(jwt: string): Claim {
        return super.deserializeInternal(jwt, (m: any, s: any) => new Claim(m, s));
    }

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
     *
     * TODO: return more than boolean
     *
     * const VerifyOntidClaimResult = {
     *   CLAIM_NOT_ONCHAIN : 'CLAIM_NOT_ONCHAIN',
     *   INVALID_SIGNATURE : 'INVALID_SIGNATURE',
     *   PK_IN_REVOKED     : 'PK_IN_REVOKED',
     *   NO_ISSUER_PK      : 'NO_ISSUER_PK',
     *   EXPIRED_CLAIM     : 'EXPIRED_CLAIM',
     *   REVOKED_CLAIM     : 'REVOKED_CLAIM',
     *   VALID_CLAIM       : 'VALID_CLAIM'
     * };
     *
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
     * @param gasPrice gasPrice
     * @param gasLimit gasLimit
     * @param payer payer
     */
    async attest(url: string, gasPrice: string, gasLimit: string,
                 payer: Address, privateKey: PrivateKey): Promise<boolean> {
        const attesterId = this.metadata.issuer;
        const subjectId = this.metadata.subject;
        const claimId = this.metadata.messageId;
        if (claimId === undefined) {
            throw new Error('Claim id not specified.');
        }

        const client = new WebsocketClient(url);
        const tx = buildCommitRecordTx(claimId, attesterId, subjectId, gasPrice, gasLimit, payer);
        await signTransactionAsync(tx, privateKey);
        const response = await client.sendRawTransaction(tx.serialize(), false, true);

        const event = AttestNotifyEvent.deserialize(response);
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(event));
        return event.Result.Notify[0].States[0] === 'Push';
    }

    /**
     * Revokes claim attest from blockchain.
     *
     * @param gas the cost of the transactoin
     * @param payer the payer of the cost
     * @param privateKey Private key to sign the transaction
     * @param url Websocket endpoint of Ontology node
     * @param gasPrice gasPrice
     * @param gasLimit gasLimit
     * @param payer payer
     */
    async revoke(url: string, gasPrice: string,
                 gasLimit: string, payer: Address, privateKey: PrivateKey): Promise<boolean> {
        const attesterId = this.metadata.issuer;
        const claimId = this.metadata.messageId;
        if (claimId === undefined) {
            throw new Error('Claim id not specified.');
        }
        const client = new WebsocketClient(url);
        const tx = buildRevokeRecordTx(claimId, attesterId, gasPrice, gasLimit, payer);
        await signTransactionAsync(tx, privateKey);
        const response = await client.sendRawTransaction(tx.serialize(), false, true);

        const event = AttestNotifyEvent.deserialize(response);

        return event.Result.Notify[0].States[0] === 'Push';
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
        // tslint:disable-next-line:no-console
        console.log(result);

        return result.status === Status.ATTESTED && result.issuerId === attesterId;
    }

    protected payloadToJSON(): any {
        return {
            'ver': this.version,
            '@context': this.context,
            'clm': this.content,
            'clm-rev': this.revocation
        };
    }

    protected payloadFromJSON(json: any): void {
        this.version = json.ver;
        this.context = json['@context'];
        this.content = json.clm;
        this.revocation = json['clm-rev'];
    }

    /**
     * Serializes the header into JWT/JWT-X encoded header.
     *
     * Override default implementation by adding proof if available.
     *
     * @param algorithm Signature algorithm used
     * @param publicKeyId The ID of a signature public key
     */
    protected serializeHeader(algorithm: SignatureScheme | undefined, publicKeyId: string | undefined): string {
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
 * fixme: Ontology node changed the response
 */
export class GetStatusResponse {
    static deserialize(r: any): GetStatusResponse {
        const response = new GetStatusResponse();

        if (r.Result !== undefined && r.Result.Result === '') {
            response.status = Status.NOTFOUND;
            return response;
        }
        const sr = new StringReader(r.Result.Result);
        sr.read(1); // data type
        sr.readNextLen(); // data length
        sr.read(1); // data type
        const claimId = hexstr2str(sr.readNextBytes());
        sr.read(1); // data type
        const issuerId = hexstr2str(sr.readNextBytes());
        sr.read(1); // data type
        const subjectId = hexstr2str(sr.readNextBytes());
        sr.read(1); // data type
        let status = sr.readNextBytes();
        response.claimId = claimId;
        response.issuerId = issuerId;
        response.subjectId = subjectId;
        if (!status) {// status is revoked
            status = '00';
        }
        response.status =  status as Status;
        return response;
    }

    claimId: string;
    issuerId: string;
    subjectId: string;
    status: Status;
    // status: Status;
    // attesterId: string;
    // time: string;
}

export enum Status {
    REVOKED = '00',
    ATTESTED = '01',
    NOTFOUND = '-1'
}
