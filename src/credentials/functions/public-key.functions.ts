import { DDO } from '../..';
import { extractKeyId } from '../../claim/message';
import { PublicKey, PublicKeyStatus } from '../../crypto';
import RestClient from '../../network/rest/restClient';
import {
    buildGetDDOTx,
    buildGetDocumentTx,
    buildGetPublicKeyStateTx
} from '../../smartcontract/nativevm/ontidContractTxBuilder';
import { hexstr2str } from '../../utils';

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
    const getDocumentTx = buildGetDocumentTx(ontId);
    const response = await client.sendRawTransaction(getDocumentTx.serialize(), true);

    if (response.Result && response.Result.Result) {
        try {
            const obj = JSON.parse(hexstr2str(response.Result.Result));
            const publicKey = obj.publicKey.find((pk: any) => pk.id.split('#')[0] === ontId);

            if (publicKey === undefined) {
                throw new Error('Not found');
            }

            return new PublicKey(publicKey.publicKeyHex);
        } catch (err) {
            throw new Error(err);
        }

    } else {
        const getDDOTx = buildGetDDOTx(ontId);
        const response2 = await client.sendRawTransaction(getDDOTx.serialize(), true);

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
    const getPublicKeyStateTx = buildGetPublicKeyStateTx(ontId, keyId);
    const response = await client.sendRawTransaction(getPublicKeyStateTx.serialize(), true);
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
