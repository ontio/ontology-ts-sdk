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
import * as bip39 from 'bip39';
import * as cryptoJS from 'crypto-js';
import * as ecurve from 'ecurve';
import * as wif from 'wif';
import { REST_API, TEST_ONT_URL } from './consts';
import {
    Address,
    PrivateKey,
    PublicKey,
    Signature
} from './crypto';
import { generateRandomArray, hash160 } from './helpers';
import { VmType } from './transaction/vmcode';
import { ab2hexstring, hexstring2ab, num2hexstring } from './utils';
export * from './helpers';

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
    // const data = serializedPk.substring(2);
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

export function generateMnemonic(hexstr: string) {
    return bip39.entropyToMnemonic(hexstr);
}

export function parseMnemonic(str: string) {
    return bip39.mnemonicToEntropy(str);
}

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

// const getRovocationList = (url: string) => {
//     return axios.get(url).then((res) => {
//         return res.data;
//     });
// };

// export async function verifyMerkleProof(claim: any ) {
//     const txHash = claim.Proof.TxnHash;
//     const blockHeight = claim.Proof.BlockHeight;
//     const merkle = await getMerkleProof(txHash);

//     const leafHash = merkle.TransactionsRoot;
//     const leafIndex = merkle.BlockHeight;
//     const proof = merkle.TargetHashes;
//     const rootHash = merkle.CurBlockRoot;
//     const treeSize = merkle.CurBlockHeight;

//     // 1. verify blockHeight
//     if (blockHeight !== leafIndex) {
//         return false;
//     }
//     // 2. verify merkle
//     const verifyMerkleResult = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize);
//     return verifyMerkleResult;
// }
