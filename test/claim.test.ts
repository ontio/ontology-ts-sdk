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

import {Claim , Metadata } from '../src/claim'
import { PrivateKey, Signature } from '../src/crypto';
import { str2hexstr } from '../src/utils';

describe('test claim', () => {

    var claimData = {
        name : 'zhangsan',
        age : 25
    }
    var context = 'claim:standard0001'
    var metaData = new Metadata()
    metaData.CreateTime = "2017-01-01T22:01:20Z";
    metaData.Issuer = "did:ont:8uQhQMGzWxR8vw5P3UWH1j";
    metaData.Subject = "did:ont:4XirzuHiNnTrwfjCMtBEJ6";
    metaData.Expires = "2018-01-01";
    metaData.Revocation = "RevocationList";
    //metaData.Crl = "http://192.168.1.1/rev.crl";

    var claim : Claim,
        privateKey : PrivateKey

    beforeAll(() => {
        privateKey = PrivateKey.random()
    })

    test('test sign claim', () => {
        claim = new Claim(context, claimData, metaData)
        let signed = claim.sign(privateKey)
        expect(signed).toBeDefined()
    })

    test('make a signature', ()=>{
        const {Id, Metadata, Context, Content} = claim
        //!!! the order of attributes matters
        let obj = {
            Context: Context,
            Id: Id,
            Content: Content,
            Metadata: Metadata
        }
        let signed = privateKey.sign(str2hexstr(JSON.stringify(obj)))
        let signatureValue = claim.Signature
        expect(signed.serializePgp()).toEqual(signatureValue)
    })

    test('verify a signature', () => {
        let publicKey = privateKey.getPublicKey()
        let data = Object.assign({}, {
            Context : claim.Context,
            Id : claim.Id,
            Content : claim.Content,
            Metadata : claim.Metadata
        })
        const result = publicKey.verify(
            str2hexstr(JSON.stringify(data)), 
            Signature.deserializePgp(claim.Signature)
        );
        expect(result).toBeTruthy()
    })
})