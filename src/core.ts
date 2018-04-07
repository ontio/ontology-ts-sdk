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
import { ADDR_VERSION } from './consts'
import * as scrypt from './scrypt'
import {ERROR_CODE} from './error'
import { VmType } from './transaction/vmcode';

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

export function verifySignature(data : string, signature : string, publicKey : string) {
    let msg = cryptoJS.enc.Hex.parse(data)
    let msgHash = cryptoJS.SHA256(msg)

    let elliptic = new ec('p256')
    const result = elliptic.verify(data.toString(), signature, publicKey, null)
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


export function verifyOntidClaim(claim : any) {
    if(!claim.Metadata || !claim.Metadata.Issuer) {
        throw new Error('Invalid claim.')
    }
    let issuer = claim.Metadata.Issuer
    //TODO
}