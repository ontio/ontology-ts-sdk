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
import * as uuid from 'uuid';
import { PrivateKey, PublicKey, PublicKeyStatus, Signature, SignatureScheme } from '../crypto';
import RestClient from '../network/rest/restClient';
import { buildGetDocumentTx } from '../smartcontract/nativevm/ontidContractTxBuilder';
import { buildGetDDOTx, buildGetPublicKeyStateTx } from '../smartcontract/nativevm/ontidContractTxBuilder';
import { DDO } from '../transaction/ddo';
import { hexstr2str, now, str2hexstr } from '../utils';

/**
 * Factory method type used for creating concrete instances of Message.
 */
export type MessageFactory<T extends Message> = (
    metadata: Metadata,
    signature: Signature | undefined,
    useProof: boolean | undefined
) => T;

/**
 * Metadata about the message.
 */
export interface Metadata {
    /**
     * Message id.
     *
     * Will be assigned if not provided.
     */
    messageId?: string;

    /**
     * Issuer.
     */
    issuer: string;

    /**
     * Recipient.
     */
    subject: string;

    /**
     * Creation time.
     */
    issuedAt: number;

    /**
     * Expiration time.
     */
    expireAt?: number;
}

/**
 * Common representation of Message in JWT form.
 */
export abstract class Message {

    /**
     * Deserializes the message from JWT format.
     *
     * A concrete instance will be creater through the message factory method. This method
     * is called from concrete class.
     *
     * @param jwt Encoded message
     * @param creator Factory method
     */
    protected static deserializeInternal<T extends Message>(jwt: string, creator: MessageFactory<T>): T {
        const parts = jwt.split('.', 4);

        if (parts.length < 2) {
            throw new Error('Invalid message.');
        }

        const header = Message.deserializeHeader(parts[0]);
        const payload = Message.deserializePayload(parts[1]);
        let signature: Signature | undefined;

        if (parts.length > 2) {
            if (header.algorithm !== undefined && header.publicKeyId !== undefined) {
                signature = Signature.deserializeJWT(parts[2], header.algorithm, header.publicKeyId);
            } else {
                throw new Error('Signature scheme was not specified.');
            }
        }
        let useProof: boolean | undefined;
        if (parts.length === 4) {
            useProof = true;
        }
        const msg = creator(payload.metadata, signature, useProof);
        msg.payloadFromJSON(payload.rest);
        return msg;
    }

    /**
     * Deserializes payload part of JWT message.
     *
     * @param encoded JWT encoded payload
     */
    private static deserializePayload(encoded: string) {
        const stringified = b64.decode(encoded);
        const { jti, iss, sub, iat, exp, ...rest } = JSON.parse(stringified);

        return {
            metadata: {
                messageId: jti,
                issuer: iss,
                subject: sub,
                issuedAt: iat,
                expireAt: exp
            } as Metadata,
            rest
        };
    }

    /**
     * Deserializes the header from JWT encoded header.
     *
     * @param encoded JWT encoded header
     */
    private static deserializeHeader(encoded: string) {
        const stringified = b64.decode(encoded);
        const header = JSON.parse(stringified);
        // console.log('header: ' + JSON.stringify(header));
        return {
            algorithm: header.alg !== undefined ? SignatureScheme.fromLabelJWS(header.alg) : undefined,
            publicKeyId: header.kid
        };
    }

    metadata: Metadata;
    signature?: Signature;

    constructor(metadata: Metadata, signature: Signature | undefined) {
        this.metadata = metadata;
        this.signature = signature;

        if (this.metadata.messageId === undefined) {
            this.metadata.messageId = uuid();
        }
    }

    /**
     * Signs the message and store the signature inside the request.
     *
     * If the algorithm is not specified, then default algorithm for Private key type is used.
     *
     * @param url Restful endpoint of Ontology node
     * @param publicKeyId The ID of a signature public key
     * @param privateKey Private key to sign the request with
     * @param algorithm Signature algorithm used
     */
    async sign(
        url: string,
        publicKeyId: string,
        privateKey: PrivateKey,
        algorithm?: SignatureScheme
    ): Promise<void> {
        await retrievePublicKey(publicKeyId, url);

        if (algorithm === undefined) {
            algorithm = privateKey.algorithm.defaultSchema;
        }

        const msg = this.serializeUnsigned(algorithm, publicKeyId);
        const msgHex = str2hexstr(msg);
        this.signature = await privateKey.signAsync(msgHex, algorithm, publicKeyId);
    }

    /**
     * Verifies the signature and check ownership of specified ONT ID through smart contract call.
     *
     * @param url Restful endpoint of Ontology node
     * @returns Boolean if the ownership is confirmed
     */
    async verify(url: string): Promise<boolean> {
        const signature = this.signature;

        if (signature !== undefined && signature.publicKeyId !== undefined) {
            try {
                if (!this.verifyKeyOwnership()) {
                    return false;
                }

                if (!this.verifyExpiration()) {
                    return false;
                }

                const state = await retrievePublicKeyState(signature.publicKeyId, url);

                if (state === PublicKeyStatus.REVOKED) {
                    return false;
                }

                const publicKey = await retrievePublicKey(signature.publicKeyId, url);
                const msg = this.serializeUnsigned(signature.algorithm, signature.publicKeyId);
                const msgHex = str2hexstr(msg);
                return publicKey.verify(msgHex, signature);
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Serializes the message without signature into JWT format.
     *
     * Header might contain algorithm and public key id.
     *
     * @param algorithm Signature algorithm used
     * @param publicKeyId The ID of a signature public key
     */
    serializeUnsigned(algorithm?: SignatureScheme, publicKeyId?: string): string {
        const headerEncoded = this.serializeHeader(algorithm, publicKeyId);
        const payloadEncoded = this.serializePayload();

        return headerEncoded + '.' + payloadEncoded;
    }

    /**
     * Serializes the message into JWT format.
     *
     */
    serialize(): string {
        const signature = this.signature;

        if (signature !== undefined) {
            const signatureEncoded = signature.serializeJWT();
            return this.serializeUnsigned(signature.algorithm, signature.publicKeyId) + '.' + signatureEncoded;
        } else {
            return this.serializeUnsigned();
        }
    }

    /**
     * Serializes the header into JWT encoded header.
     *
     * @param algorithm Signature algorithm used
     * @param publicKeyId The ID of a signature public key
     */
    protected serializeHeader(
        algorithm: SignatureScheme | undefined,
        publicKeyId: string | undefined
    ): string {
        let header;
        if (algorithm !== undefined) {
            header = {
                alg: algorithm.labelJWS,
                typ: 'JWT',
                kid: publicKeyId
            };
        } else {
            header = {
                typ: 'JWT'
            };
        }

        const stringified = JSON.stringify(header);
        return b64.encode(stringified, 'utf-8');
    }

    /**
     * Converts claim data to JSON for serialization.
     */
    protected abstract payloadToJSON(): any;

    /**
     * Retrieves data from JSON.
     *
     * @param json JSON object with data
     */
    protected abstract payloadFromJSON(json: any): void;

    /**
     * Verifies if the expiration date has passed
     */
    private verifyExpiration(): boolean {
        if (this.metadata.expireAt !== undefined) {
            return now() < this.metadata.expireAt;
        } else {
            return true;
        }
    }

    /**
     * Verifies if the declared public key id belongs to issuer.
     */
    private verifyKeyOwnership(): boolean {
        const signature = this.signature;

        if (signature !== undefined && signature.publicKeyId !== undefined) {
            const ontId = extractOntId(signature.publicKeyId);

            return ontId === this.metadata.issuer;
        } else {
            return false;
        }
    }

    /**
     * Serializes payload part of JWT message.
     */
    private serializePayload(): string {
        const metadata = {
            jti: this.metadata.messageId,
            iss: this.metadata.issuer,
            sub: this.metadata.subject,
            iat: this.metadata.issuedAt,
            exp: this.metadata.expireAt
        };
        const rest = this.payloadToJSON();

        const stringified = JSON.stringify({...metadata, ...rest});
        return b64.encode(stringified, 'utf-8');
    }
}

/**
 * Simple implementation for Message
 */
export class SimpleMessage extends Message {

    static deserialize(jwt: string): SimpleMessage {
        return super.deserializeInternal(jwt, (m, s) => new SimpleMessage(m, s));
    }

    payload: any = {};

    payloadToJSON(): any {
        return this.payload;
    }

    // tslint:disable-next-line:no-empty
    payloadFromJSON(json: any): void {
        return this.payload = json;
    }
}

/**
 * Gets the public key associated with ONT ID from blockchain.
 *
 * @param publicKeyId The ID of a signature public key
 * @param url Restful endpoint of Ontology node
 */
export async function retrievePublicKey(publicKeyId: string, url: string): Promise<PublicKey> {
    const ontId = extractOntId(publicKeyId);
    const keyId = extractKeyId(publicKeyId);

    const client = new RestClient(url);
    const tx = buildGetDocumentTx(ontId);
    const response = await client.sendRawTransaction(tx.serialize(), true);

    if (response.Result && response.Result.Result) {
        // const ddo = DDO.deserialize(response.Result.Result);
        try {
            const obj = JSON.parse(hexstr2str(response.Result.Result));
            const publicKey = obj.publicKey.find((pk: any) => pk.id.split('#')[0] === ontId);

            if (publicKey === undefined) {
                throw new Error('Not found');
            }

            return new PublicKey(publicKey.pk);
        } catch (err) {
            throw new Error(err);
        }

    } else {
        const tx2 = buildGetDDOTx(ontId);
        const response2 = await client.sendRawTransaction(tx2.serialize(), true);

        if (response2.Result && response2.Result.Result) {
            const ddo = DDO.deserialize(response2.Result.Result);

            const publicKey = ddo.publicKeys.find((pk) => pk.id === keyId);

            if (publicKey === undefined) {
                throw new Error('Not found');
            }

            return publicKey.pk;
        } else {
            throw new Error('Not found');
        }
    }
}

/**
 * Gets the state of public key associated with ONT ID from blockchain.
 *
 * @param publicKeyId The ID of a signature public key
 * @param url Restful endpoint of Ontology node
 */
export async function retrievePublicKeyState(publicKeyId: string, url: string): Promise<PublicKeyStatus> {
    const ontId = extractOntId(publicKeyId);
    const keyId = extractKeyId(publicKeyId);

    const client = new RestClient(url);
    const tx = buildGetPublicKeyStateTx(ontId, keyId);
    const response = await client.sendRawTransaction(tx.serialize(), true);
    if (response.Result && response.Result.Result) {
        return PublicKeyStatus.fromHexLabel(response.Result.Result);
    } else {
        throw new Error('Not found');
    }
}

/**
 * Extracts ONT ID from public key Id.
 *
 * @param publicKeyId The ID of a signature public key
 */
export function extractOntId(publicKeyId: string): string {
    const index = publicKeyId.indexOf('#keys-');

    if (index === -1) {
        throw new Error('Is not a publicKeId.');
    }

    return publicKeyId.substr(0, index);
}

/**
 * Extracts key id from public key Id.
 *
 * @param publicKeyId The ID of a signature public key
 */
export function extractKeyId(publicKeyId: string): number {
    const index = publicKeyId.indexOf('#keys-');

    if (index === -1) {
        throw new Error('Is not a publicKeId.');
    }

    // return num2hexstring(
    //     Number(publicKeyId.substr(index + '#keys-'.length))
    // );
    return Number(publicKeyId.substr(index + '#keys-'.length));
}
