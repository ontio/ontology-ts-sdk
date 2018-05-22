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
import axios from 'axios';
import * as bigInteger from 'bigi';
import * as base58 from 'bs58';
import * as cryptoJS from 'crypto-js';
import * as ecurve from 'ecurve';
import * as secureRandom from 'secure-random';
import * as wif from 'wif';
import { ADDR_VERSION, REST_API, TEST_ONT_URL } from './consts';
import {
    Address,
    CurveLabel,
    KeyParameters,
    KeyType,
    PK_STATUS,
    PrivateKey,
    PublicKey,
    PublicKeyStatus,
    Signature,
    SignatureScheme
} from './crypto';
import { ERROR_CODE } from './error';
import { getSingleSigUInt160, u160ToAddress } from './helpers';
import { verifyLeafHashInclusion } from './merkle';
import RestClient from './network/rest/restClient';
import * as scrypt from './scrypt';
import { buildGetDDOTx, buildGetPublicKeyStateTx } from './smartcontract/ontidContractTxBuilder';
import { DDO } from './transaction/ddo';
import { buildRestfulParam, sendRawTxRestfulUrl } from './transaction/transactionBuilder';
import { VmType } from './transaction/vmcode';
import { ab2hexstring, hexstr2str, hexstring2ab, num2hexstring, str2hexstr, StringReader } from './utils';
export * from './helpers';

export function generateRandomArray(len: number): ArrayBuffer {
    return secureRandom(len);
}

/**
 * @deprecated Replaced by PrivateKey.random()
 */
export function generatePrivateKey(): ArrayBuffer {
    return generateRandomArray(32);
}

/**
 * @deprecated Replaced by PrivateKey.random()
 */
export function generatePrivateKeyStr(): string {
    return ab2hexstring(generatePrivateKey());
}

/**
 * @deprecated Replaced by PrivateKey.getPublicKey()
 */
export function getPublicKey(privateKey: string, encode: boolean): any {
    const ecparams = ecurve.getCurveByName('secp256r1');
    const curvePt = ecparams.G.multiply(bigInteger.fromBuffer(hexstring2ab(privateKey)));

    return curvePt.getEncoded(encode);
}

/**
 * @deprecated Not used.
 */
export function getPublicKeyPoint(privateKey: string) {
    const ecparams = ecurve.getCurveByName('secp256r1');
    const curvePt = ecparams.G.multiply(bigInteger.fromBuffer(hexstring2ab(privateKey)));
    const x = curvePt.affineX.toBuffer(32);
    const y = curvePt.affineY.toBuffer(32);

    return {
        x : ab2hexstring(x),
        y : ab2hexstring(y)
    };
}

/**
 * @deprecated Not used and not very useful method. Replaced by PublicKey.deserializeHex()
 */
export function deserializePublickKey(serializedPk: string) {
    const curveType = parseInt(serializedPk.substr(0, 2), 16);
    const data = serializedPk.substring(2);
    const curve = '';
    const ECKey = '';
    let type  = '';
    switch (curveType) {
    case 0x12:
        type = 'ECDSA';
        break;
    case 0x13:
        type = 'SM2';
        break;
    case 0x14:
        type = 'EDDSA';
        break;
    default :
        throw new Error('Invalid curve type');
    }
    return {
        curve,
        ECKey,
        type
    };
}

/**
 * @deprecated Not used.
 */
export function createSignatureScript(publicKeyEncoded: string): string {
    return '21' + publicKeyEncoded + 'ac';
}

export function sha256(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const sha = cryptoJS.SHA256(hex).toString();
    return sha;
}

export function ripemd160(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const ripemd = cryptoJS.RIPEMD160(hex).toString();
    return ripemd;
}

export function hash160(SignatureScript: string): string {
    return ripemd160(sha256(SignatureScript));
}

/**
 * @deprecated Replaced by PrivateKey.sign()
 */
export function signatureData(data: string, privateKey: string): string {
    const pk = new PrivateKey(privateKey);
    return pk.sign(data).value;
}

/**
 * compute the checksum from address for decrypt
 * @param address in base58 format
 */
export function getChecksumFromAddress(addr: Address) {
    const address = addr.toBase58();
    const addressSha256 = cryptoJS.SHA256(address).toString();
    const addressSha2562 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(addressSha256)).toString();
    const addressHash = addressSha2562.slice(0, 8);
    return addressHash;
}

export function getChecksumFromOntid(did: string) {
    const address = did.substr(8);
    return getChecksumFromAddress(new Address(address));
}

/**
 * @deprecated Replaced by PublicKey.verify()
 */
export function verifySignature(data: string, signature: string, publicKey: any) {
    const pk = new PublicKey(publicKey);
    return pk.verify(data, new Signature(pk.algorithm.defaultSchema, signature));
}

export function getContractHash(avmCode: string, vmType: VmType = VmType.NEOVM) {
    let scriptHash = hash160(avmCode);
    scriptHash = num2hexstring(vmType) + scriptHash.substr(2);
    return scriptHash;
}

export function getPrivateKeyFromWIF(wifkey: string): string {
    return ab2hexstring(wif.decode(wifkey, 128).privateKey);
}

export function getWIFFromPrivateKey(privateKey: string): string {
    return wif.encode(128, Buffer.from(privateKey, 'hex'), true);
}

export function generateOntid(nonce: string) {
    const programHash = getSingleSigUInt160(nonce);
    const ontid = 'did:ont:' + u160ToAddress(programHash);
    return ontid;
}

/**
 * @param claim json object
 */
export function verifyOntidClaim(claim: any) {
    if (!claim.Metadata || !claim.Metadata.Issuer) {
        throw new Error('Invalid claim.');
    }
    const issuerDid = claim.Metadata.Issuer;
    const tx = buildGetDDOTx(issuerDid);
    const param = buildRestfulParam(tx);
    const url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true);
    return axios.post(url, param).then( (res: any) => {
        if (res.data.Result && res.data.Result.length > 0) {
            // tslint:disable-next-line:no-console
            console.log('ddo hexstr: ' + res.data.Result[0]);
            const ddo = DDO.deserialize(res.data.Result[0]);
            // tslint:disable-next-line:no-console
            console.log('ddo: ' + JSON.stringify(ddo));
            if (ddo.publicKeys.length > 0) {
                const pkWithId = ddo.publicKeys[0];
                const signature = claim.Signature;
                claim.delete('Signature');
                return pkWithId.pk.verify(
                    str2hexstr(JSON.stringify(claim)),
                    Signature.deserializePgp(signature)
                );
            } else {
                return false;
            }
        }
    });
}

const getDDO = (ontid: string, url?: string) => {
    const tx = buildGetDDOTx(ontid);
    const param = buildRestfulParam(tx);
    url = url || TEST_ONT_URL.REST_URL;
    const requestUrl = sendRawTxRestfulUrl(url , true);
    return axios.post(requestUrl, param).then((res: any) => {
        if (res.data.Result && res.data.Result.length > 0) {
            // tslint:disable-next-line:no-console
            console.log('ddo hexstr: ' + res.data.Result[0]);
            const ddo = DDO.deserialize(res.data.Result[0]);
            // tslint:disable-next-line:no-console
            console.log('ddo: ' + JSON.stringify(ddo));
            return ddo;
        }
    });
};

export const getMerkleProof = (txHash: string, url?: string) => {
    url = url || TEST_ONT_URL.REST_URL;
    const requestUrl = `${url}${REST_API.getMerkleProof}/${txHash}`;
    // tslint:disable-next-line:no-console
    console.log(requestUrl);
    return axios.get(requestUrl).then((res: any) => {
        // tslint:disable-next-line:no-console
        console.log('merkle : ' + JSON.stringify(res.data));
        return res.data.Result;
    });
};

const getRovocationList = (url: string) => {
    return axios.get(url).then((res) => {
        return res.data;
    });
};

const VerifyOntidClaimResult = {
    CLAIM_NOT_ONCHAIN : 'CLAIM_NOT_ONCHAIN',
    INVALID_SIGNATURE : 'INVALID_SIGNATURE',
    PK_IN_REVOKED     : 'PK_IN_REVOKED',
    NO_ISSUER_PK      : 'NO_ISSUER_PK',
    EXPIRED_CLAIM     : 'EXPIRED_CLAIM',
    REVOKED_CLAIM     : 'REVOKED_CLAIM',
    VALID_CLAIM       : 'VALID_CLAIM'
};

/**
 * @param claim claim json object
 * @param url the node to send tx, eg: http://192.168.3.111:20334
 */
export async function verifyOntidClaimAsync(claim: any, url?: string) {
    if (!claim.Metadata || !claim.Metadata.Issuer) {
        throw new Error('Invalid claim.');
    }

    // verify expiration
    const verifyExpirationResult = verifyExpiration(claim.Metadata.Expires);
    if (!verifyExpirationResult) {
        return VerifyOntidClaimResult.EXPIRED_CLAIM;
    }

    const issuerDid = claim.Metadata.Issuer;
    const didEnd = issuerDid.indexOf('#');
    const issuerOntid = issuerDid.substring(0, didEnd);
    // issuer is : ONTID#PkId
    const issuerPkId = issuerDid.substr(didEnd + 1);
    // pkStatus = { publicKey, status : [IN USE, Revoked] }
    const pkStatus = await getPkStatus(issuerOntid, issuerPkId);
    if (!pkStatus) {
        return VerifyOntidClaimResult.NO_ISSUER_PK;
    }
    if (pkStatus && pkStatus.status === PK_STATUS.REVOKED) {
        return VerifyOntidClaimResult.PK_IN_REVOKED;
    }

    // verify signature
    const pk = pkStatus.pk;
    // the order of claim's attributes matters.
    const result = verifyClaimSignature(claim, pk);
    if (!result) {
        return VerifyOntidClaimResult.INVALID_SIGNATURE;
    }
    const verifyMerkleResult = await verifyMerkleProof(claim);

    if (!verifyMerkleResult) {
        return VerifyOntidClaimResult.CLAIM_NOT_ONCHAIN;
    }

    // verify revoke - optional
    if (claim.Metadata.Revocation) {
        // const url = claim.Metadata.Crl;
        if (claim.Metadata.Revocation === 'RevocationList' && claim.Metadata.Crl) {
            //
        } else if (claim.Metadata.Revocation === 'RevocationUrl') {
            //
        }
    }

    return VerifyOntidClaimResult.VALID_CLAIM;
}

export function verifyExpiration(dateString: string) {
    const expiration = new Date(dateString);
    if (expiration.toString() === 'Invalid Date') {
        throw new Error('Invalid date string: ' + dateString);
    }
    const d = new Date();
    if (d > expiration) {
        return false;
    } else {
        return true;
    }
}

export async function getPkStatus(ontid: string, pkId: number): Promise<PublicKeyStatus | undefined> {
    const tx = buildGetPublicKeyStateTx(ontid, pkId);
    const restClient = new RestClient();
    const res = await restClient.sendRawTransaction(tx.serialize(), true);

    if (res.Result[0] && res.Result[0].length > 0) {
        return PublicKeyStatus.deserialize(res.Result[0]);
    }
}

export function verifyClaimSignature(claim: any, pk: PublicKey) {
    const signatureOriginal = Object.assign({}, {
        Context: claim.Context,
        Id: claim.Id,
        Content: claim.Content,
        Metadata: claim.Metadata
    });
    return pk.verify(
        str2hexstr(JSON.stringify(signatureOriginal)),
        Signature.deserializePgp(claim.Signature)
    );
}

export async function verifyMerkleProof(claim: any ) {
    const txHash = claim.Proof.TxnHash;
    const blockHeight = claim.Proof.BlockHeight;
    const merkle = await getMerkleProof(txHash);

    const leafHash = merkle.TransactionsRoot;
    const leafIndex = merkle.BlockHeight;
    const proof = merkle.TargetHashes;
    const rootHash = merkle.CurBlockRoot;
    const treeSize = merkle.CurBlockHeight;

    // 1. verify blockHeight
    if (blockHeight !== leafIndex) {
        return false;
    }
    // 2. verify merkle
    const verifyMerkleResult = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize);
    return verifyMerkleResult;
}
