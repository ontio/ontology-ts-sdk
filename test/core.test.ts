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

 
import * as core from '../src/core'
import * as utils from '../src/utils'
import * as scrypt from '../src/scrypt'
import { ab2hexstring } from '../src/utils';
import { verifySignature, getMerkleProof, verifyExpiration, getPkStatus, verifyClaimSignature, getOntidFromPrivateKey, generateOntid, getPublicKey, sha256 } from '../src/core';
import { PK_STATUS } from '../src/crypto';
import {Claim, Metadata } from '../src/claim'

describe('test core', ()=>{

    var privateKey:string,
        wifKey:string

    beforeAll(() => {
        privateKey = utils.ab2hexstring( core.generatePrivateKey() )
    })

    test('test getWIFFromPrivateKey', () => {
        wifKey = core.getWIFFromPrivateKey(privateKey)
        expect(wifKey).toBeDefined()
    })

    test('test getPrivateKeyFromWIF', () => {
        let key = core.getPrivateKeyFromWIF(wifKey)
        expect(key).toEqual(privateKey)
    })

    test('get public key', () => {
        let pkBuffer = core.getPublicKey(privateKey, true)
        let pk = utils.ab2hexstring(pkBuffer)
        console.log('get pk: ' + pk)
        expect(pk).toBeDefined()
    })

    test('encrypt private key', () => {
        let privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
        let encrypt = scrypt.encrypt(privateKey, '123456')
        console.log('encrypt: '+ encrypt)
    })

    test('sign and verify', () => {
        let privateKey = '7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95'
        let data = 'hello world'
        let signed = core.signatureData(data, privateKey)
        console.log('signed: ' + signed)

        let pk = core.getPublicKey(privateKey, true)
        let verifyResult = core.verifySignature(data, signed, pk)
        console.log('verifyResult: ' + verifyResult)
        expect(verifyResult).toBeTruthy()
    })

    var claim = {
        "Context": "claim:github_authentication",
        "Content": {
            "GistCreateTime": "2018-04-02T13:33:46Z",
            "Email": "919506719@qq.com",
            "Alias": "zg919506719",
            "Bio": "Android",
            "Id": "17962347",
            "GistUrl": "https://gist.github.com/4c6eeed8c4e2eb8618ac503b6fc0d930",
            "Avatar": "https://avatars2.githubusercontent.com/u/17962347?v=4",
            "Name": "朱刚"
        },
        "Signature": {
            "Format": "pgp",
            "Value": "6d5ae8f66b6c9e1dbdbe1be6aa66f2dae58f4ea92514de34143fe35634c411fc966806c6edf77f28da6559baab9bcd97a0eb7516412c28355ddbb9a548a9afb1",
            "Algorithm": "ECDSAwithSHA256"
        },
        "Metadata": {
            "Issuer": "did:ont:TVvLUjRmkco7S5LgJ1fjNpnnJCYyS1uFHF",
            "CreateTime": "2018-04-02T13:33:57Z",
            "Subject": "did:ont:TVvLUjRmkco7S5LgJ1fjNpnnJCYyS1uFHF"
        },
        "Id": "0653401141e15edcb3fea6e39c38bd3fcaa178d66b22384c3eb8cdb75aac259e"
    }

    // test('verify pkStatus', async () => {
    //     let issuerDid = claim.Metadata.Issuer
    //     let didEnd = issuerDid.indexOf('#')
    //     let issuerOntid = issuerDid.substring(0, didEnd)
    //     //issuer is : ONTID#PkId
    //     let issuerPkId = issuerDid.substr(didEnd + 1)
    //     let result = await getPkStatus(issuerOntid, issuerPkId)
    //     expect(result.status).toEqual(PK_STATUS.IN_USE)
    // })


    test('verify claim signature', () => {
        let privateKey = core.generatePrivateKeyStr()
        let pk = ab2hexstring(getPublicKey(privateKey,true))
        let ontid = generateOntid(privateKey)
        const context = 'claim:standard0001'
        const meta = new Metadata()
        meta.CreateTime = (new Date()).toISOString()
        meta.Issuer = ontid
        meta.Subject = ontid
        const content = {
            "name" : "mickey",
            "age"  : 26
        }
        let claim = new Claim(context, content, meta)
        claim.sign(privateKey)
        console.log(claim)
        console.log(pk)
        let result = verifyClaimSignature(claim, pk)
        expect(result).toBeTruthy()
    })

    // test('verify getMerkleProof', async () => {
    //     let txHash = '82c17d7430140a1f3863b8f6f03db07bbdfbdb7da22ffdb2358a1d2e185f8bf3'
    //     let res = await getMerkleProof(txHash)
    //     console.log(res)
    // })

})