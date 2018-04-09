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

import * as cryptoJS from 'crypto-js'
import * as base58 from 'bs58'
import * as ecurve from 'ecurve'
import * as bigInteger from 'bigi'
import { ab2hexstring, hexstring2ab, StringReader, hexstr2str, num2hexstring } from './utils'
import { ADDR_VERSION, TEST_ONT_URL, REST_API } from './consts'
import * as scrypt from './scrypt'
import {ERROR_CODE} from './error'
import { VmType } from './transaction/vmcode';
import { buildRestfulParam, sendRawTxRestfulUrl} from './transaction/transactionBuilder'
import axios from 'axios'
import { DDO } from './transaction/ddo'
import { getPublicKeyStatus, buildGetDDOTx } from './smartcontract/ontidContract'
import { verifyLeafHashInclusion } from './merkle'

var ec = require('elliptic').ec
var wif = require('wif')
var secureRandom = require('secure-random')

export function generateRandomArray(len: number): ArrayBuffer {
    return secureRandom(len);
}

export function generatePrivateKey(): ArrayBuffer {
    return generateRandomArray(32);
}

export function generatePrivateKeyStr() : string {
    return ab2hexstring(generatePrivateKey())
}

export function getPublicKey(privateKey: string, encode: boolean): any {
    var ecparams = ecurve.getCurveByName('secp256r1');
    var curvePt = ecparams.G.multiply(bigInteger.fromBuffer(hexstring2ab(privateKey)));

    return curvePt.getEncoded(encode);
};

export function getPublicKeyPoint(privateKey: string) {
    var ecparams = ecurve.getCurveByName('secp256r1')
    var curvePt = ecparams.G.multiply(bigInteger.fromBuffer(hexstring2ab(privateKey)));
    var x = curvePt.affineX.toBuffer(32)
    var y = curvePt.affineY.toBuffer(32)
    return {
        x : ab2hexstring(x),
        y : ab2hexstring(y)
    }
}

export function deserializePublickKey(serializedPk : string) {
    const curveType = parseInt(serializedPk.substr(0, 2), 16)
    const data = serializedPk.substring(2)
    let curve = '',
        ECKey = '',
        type  = ''
    switch (curveType) {
        case 0x12:
            type = 'ECDSA'
        break;
        case 0x13:
            type = 'SM2'
        break;
        case 0x14:
            type = 'ECDSA'
        break;
        default :
            throw new Error('Invalid curve type')
    }
    return {
        curve,
        ECKey,
        type
    }
}

export function createSignatureScript(publicKeyEncoded: string): string {
    return "21" + publicKeyEncoded + "ac";
}

export function getHash(SignatureScript: string): string {
    var ProgramHexString = cryptoJS.enc.Hex.parse(SignatureScript);
    var ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();

    return cryptoJS.RIPEMD160(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();
}

export function getMultiSigUInt160() {
//TODO
}

export function getSingleSigUInt160(publicKeyEncoded: string): string {
    var PkHexString = cryptoJS.enc.Hex.parse(publicKeyEncoded);
    var PkSha256 = cryptoJS.SHA256(PkHexString).toString();
    var PkRipemd160 = cryptoJS.RIPEMD160(cryptoJS.enc.Hex.parse(PkSha256)).toString();

    //for normal account
    return "01" + PkRipemd160.substr(2);
}

export function u160ToAddress(programhash: string): string {
    var data = ADDR_VERSION + programhash;

    var ProgramHexString = cryptoJS.enc.Hex.parse(data);
    var ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
    var ProgramSha256_2 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();
    var ProgramSha256Buffer = hexstring2ab(ProgramSha256_2);

    var datas = data + ProgramSha256_2.slice(0, 8);

    return base58.encode(hexstring2ab(datas));
};

export function addressToU160(addressEncoded : string) {
    let decoded = base58.decode(addressEncoded)
    let programHash = ab2hexstring(decoded).substr(2,40)
    let add58 = u160ToAddress(programHash)
    if(add58 !== addressEncoded) {
        throw new Error('[addressToU160] decode encodeed varify failed')
    }
    return programHash
}

export function signatureData(data: string, privateKey: string): string {
    let msg = cryptoJS.enc.Hex.parse(data);
    let msgHash = cryptoJS.SHA256(msg);

    let elliptic = new ec('p256')
    const sig = elliptic.sign(msgHash.toString(), privateKey, null)
    const signatureValue = Buffer.concat([
        sig.r.toArrayLike(Buffer, 'be', 32),
        sig.s.toArrayLike(Buffer, 'be', 32)
    ])

    return signatureValue.toString('hex');
}


/* 
@data original value of signature
@signature 
@publicKey the public key of the signer. is array-like or buffer
*/
export function verifySignature(data: string, signature: string, publicKey: any) {
    let msg = cryptoJS.enc.Hex.parse(data)
    let msgHash = cryptoJS.SHA256(msg)

    let elliptic = new ec('p256')
    let r = signature.substr(0, 64)
    let s = signature.substr(64, 64)
    const result = elliptic.verify(msgHash.toString(), { r, s }, publicKey, null)
    return result
}

export function AddContract(txData: string, sign: string, publicKeyEncoded: string): string {
    let signatureScript = createSignatureScript(publicKeyEncoded);

    // sign num
    var data = txData + "01";
    // sign struct len
    data = data + "41";
    // sign data len
    data = data + "40";
    // sign data
    data = data + sign;
    // Contract data len
    data = data + "23";
    // script data
    data = data + signatureScript;

    return data;
}

export function getContractHash(avmCode : string, vmType : VmType = VmType.NEOVM) {
    let scriptHash = getHash(avmCode)
    scriptHash = num2hexstring(vmType) + scriptHash.substr(2)
    return scriptHash
}

export function getPrivateKeyFromWIF(wifkey: string): string {
    return ab2hexstring(wif.decode(wifkey, 128).privateKey);
}

export function getWIFFromPrivateKey(privateKey: string): string {
    return wif.encode(128, Buffer.from(privateKey, 'hex'), true);
}


export function generateOntid(nonce : string) {
    let programHash = getHash(nonce);
    let ontid = "did:ont:" + u160ToAddress(programHash);
    return ontid
}

export function getOntidFromPrivateKey(encryptedPrivateKey : string, password : string) {
    let privateKey = scrypt.decrypt(encryptedPrivateKey, password); 
    return generateOntid(privateKey)
}

export function checkPrivateKey(encryptedPrivateKey : string, password : string) {
    let privateKey
    try {
       privateKey = scrypt.decrypt(encryptedPrivateKey, password);
    } catch{
        return false
    }
    
    return true
}

/* 
@claim claim json object
*/
export function verifyOntidClaim(claim : any) {
    if(!claim.Metadata || !claim.Metadata.Issuer) {
        throw new Error('Invalid claim.')
    }
    let issuerDid = claim.Metadata.Issuer
    let tx = buildGetDDOTx(issuerDid)
    let param = buildRestfulParam(tx)
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    return axios.post(url, param).then( (res:any) => {
        if (res.data.Result && res.data.Result.length > 0) {
            console.log('ddo hexstr: '+ res.data.Result[0])
            const ddo = DDO.deserialize(res.data.Result[0])
            console.log('ddo: ' + JSON.stringify(ddo))
            if(ddo.publicKeys.length > 0) {
                const pk = ddo.publicKeys[0].pk
                const signature = claim.Signature.Value
                claim.delete('Signature')
                return verifySignature(JSON.stringify(claim), signature, hexstring2ab(pk))
            } else {
                return false
            }
        }
    })
}

const getDDO = (ontid : string, url ?: string) => {
    let tx = buildGetDDOTx(ontid)
    let param = buildRestfulParam(tx)
    url = url || TEST_ONT_URL.REST_URL
    let requestUrl = sendRawTxRestfulUrl(url , true)
    return axios.post(requestUrl, param).then((res: any) => {
        if (res.data.Result && res.data.Result.length > 0) {
            console.log('ddo hexstr: ' + res.data.Result[0])
            const ddo = DDO.deserialize(res.data.Result[0])
            console.log('ddo: ' + JSON.stringify(ddo))
            return ddo
        }
    })
}

export const getMerkleProof = (txHash : string, url ?: string) => {
    url = url || TEST_ONT_URL.REST_URL
    let requestUrl = `${url}${REST_API.getMerkleProof}/${txHash} `
    return axios.get(requestUrl).then((res:any)=> {
        console.log('merkle : ' + JSON.stringify(res.data))
        return res.data.Result
    })
} 

const getRovocationList = (url : string) => {
    return axios.get(url).then(res => {
        return res.data
    })
}

const VerifyOntidClaimResult = {
    CLAIM_NOT_ONCHAIN : 'CLAIM_NOT_ONCHAIN',
    INVALID_SIGNATURE : 'INVALID_SIGNATURE',
    PK_IN_REVOKEED    : 'PK_IN_REVOKED',
    EXPIRED_CLAIM     : 'EXPIRED_CLAIM',
    REVOKED_CLAIM     : 'REVOKED_CLAIM',
    VALID_CLAIM       : 'VALID_CLAIM'
}

/* 
*@claim : claim json object
*@url : the node to send tx, eg: http://192.168.3.111:20334
*/

export async function verifyOntidClaimAsync(claim : any, url ?: string) {
    if (!claim.Metadata || !claim.Metadata.Issuer) {
        throw new Error('Invalid claim.')
    }

    //verify expiration
    const expiration = new Date( claim.Metadata.Expires )
    let d = new Date()
    if(d > expiration) {
        return VerifyOntidClaimResult.EXPIRED_CLAIM
    }

    // verify signature 
    let issuerDid = claim.Metadata.Issuer
    //issuer is : ONTID#PkId
    let issuerPkId = issuerDid.substr(issuerDid.indexOf('#') + 1)
    //pkStatus = { publicKey, status : [IN USE, Revoked] }
    let pkStatus = await getPublicKeyStatus(issuerDid, issuerPkId, url)
    if (pkStatus.status === 'Revoked') {
        return VerifyOntidClaimResult.PK_IN_REVOKEED
    }

    //verify signature
    const pk = pkStatus.publicKey.substr(0,4) === '1202' ? pkStatus.publicKey.substr(4) : pkStatus.publicKey
    //the order of claim's attributes matters.
    let signature = Object.assign({}, {
        Context: claim.Context,
        Id: claim.Id,
        Content: claim.Content,
        Metadata: claim.Metadata,
    })

    let result = verifySignature(JSON.stringify(claim), JSON.stringify(signature), hexstring2ab(pk))
    if(!result) {
        return VerifyOntidClaimResult.INVALID_SIGNATURE
    }
    if(claim.Proof) {
        // verify merkle
        let merkle = claim.Proof
        const leafHash = merkle.BlockRoot
        const leafIndex = merkle.BlockHeight
        const proof = merkle.TargetHashes
        const rootHash = merkle.CurBlockRoot
        const treeSize = merkle.CurBlockHeight

        let verifyMerkleResult = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize)
        if (!verifyMerkleResult) {
            return VerifyOntidClaimResult.CLAIM_NOT_ONCHAIN
        }
    }
    

    //verify revoke - optional
    if(claim.Metadata.Revocation) {
        let url = claim.Metadata.Crl        
        if(claim.Metadata.Revocation === 'RevocationList' && claim.Metadata.Crl) {
            
        } else if(claim.Metadata.Revocation === 'RevocationUrl') {

        }
    }

    return VerifyOntidClaimResult.VALID_CLAIM
}