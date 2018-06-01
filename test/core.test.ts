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
import * as bip39 from 'bip39';
import { Claim, Metadata } from '../src/claim';
import * as core from '../src/core';
import { generateOntid, getMerkleProof, getPublicKey, sha256, verifySignature } from '../src/core';
import { CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey } from '../src/crypto';
import * as utils from '../src/utils';
import { Signature } from './../src/crypto/Signature';
import { SignatureScheme } from './../src/crypto/SignatureScheme';
import { StringReader } from './../src/utils';
// tslint:disable : no-console
describe('test core', () => {

    let privateKey: string;
    let wifKey: string;

    beforeAll(() => {
        privateKey = utils.ab2hexstring( core.generatePrivateKey() );
    });

    test('test getWIFFromPrivateKey', () => {
        const pri = 'e467a2a9c9f56b012c71cf2270df42843a9d7ff181934068b4a62bcdd570e8be';
        wifKey = core.getWIFFromPrivateKey(pri);
        // expect(wifKey).toBeDefined();
        expect(wifKey).toEqual('L4shZ7B4NFQw2eqKncuUViJdFRq6uk1QUb6HjiuedxN4Q2CaRQKW');
    });

    test('test getPrivateKeyFromWIF', () => {
        const wif = 'L4shZ7B4NFQw2eqKncuUViJdFRq6uk1QUb6HjiuedxN4Q2CaRQKW';
        const key = core.getPrivateKeyFromWIF(wif);
        expect(key).toEqual('e467a2a9c9f56b012c71cf2270df42843a9d7ff181934068b4a62bcdd570e8be');
    });

    test('get public key', () => {
        const pkBuffer = core.getPublicKey(privateKey, true);
        const pk = utils.ab2hexstring(pkBuffer);
        console.log('get pk: ' + pk);
        expect(pk).toBeDefined();
    });

    test('encrypt private key', () => {
        // tslint:disable-next-line:no-shadowed-variable
        const privateKey = new PrivateKey('b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9');
        const encrypt = privateKey.encrypt('123456');
        console.log('encrypt: ' + encrypt.key);
    });

    test('sign and verify', () => {
        // tslint:disable-next-line:no-shadowed-variable
        const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
        const data = 'helloworld';
        const msg = utils.str2hexstr('helloworld');
        console.log('msg: ' + msg);
        const signed = privateKey.sign(msg);
        console.log('signed: ' + signed.serializeHex());
        console.log('base64: ' + new Buffer(signed.serializeHex(), 'hex').toString('base64'));
        const pk = privateKey.getPublicKey();
        console.log('pub: ' + pk.serializeHex());
        const verifyResult = pk.verify(msg, signed);
        console.log('verifyResult: ' + verifyResult);
        expect(verifyResult).toBeTruthy();
    });

    const claim = {
        Context: 'claim:github_authentication',
        Content: {
            GistCreateTime: '2018-04-02T13:33:46Z',
            Email: '919506719@qq.com',
            Alias: 'zg919506719',
            Bio: 'Android',
            Id: '17962347',
            GistUrl: 'https://gist.github.com/4c6eeed8c4e2eb8618ac503b6fc0d930',
            Avatar: 'https://avatars2.githubusercontent.com/u/17962347?v=4',
            Name: '朱刚'
        },
        Signature: {
            Format: 'pgp',
            // tslint:disable-next-line:max-line-length
            Value: '6d5ae8f66b6c9e1dbdbe1be6aa66f2dae58f4ea92514de34143fe35634c411fc966806c6edf77f28da6559baab9bcd97a0eb7516412c28355ddbb9a548a9afb1',
            Algorithm: 'ECDSAwithSHA256'
        },
        Metadata: {
            Issuer: 'did:ont:TVvLUjRmkco7S5LgJ1fjNpnnJCYyS1uFHF',
            CreateTime: '2018-04-02T13:33:57Z',
            Subject: 'did:ont:TVvLUjRmkco7S5LgJ1fjNpnnJCYyS1uFHF'
        },
        Id: '0653401141e15edcb3fea6e39c38bd3fcaa178d66b22384c3eb8cdb75aac259e'
    };

    // test('verify pkStatus', async () => {
    //     let issuerDid = claim.Metadata.Issuer
    //     let didEnd = issuerDid.indexOf('#')
    //     let issuerOntid = issuerDid.substring(0, didEnd)
    //     //issuer is : ONTID#PkId
    //     let issuerPkId = issuerDid.substr(didEnd + 1)
    //     let result = await getPkStatus(issuerOntid, issuerPkId)
    //     expect(result.status).toEqual(PK_STATUS.IN_USE)
    // })

    // test('verify getMerkleProof', async () => {
    //     let txHash = '82c17d7430140a1f3863b8f6f03db07bbdfbdb7da22ffdb2358a1d2e185f8bf3'
    //     let res = await getMerkleProof(txHash)
    //     console.log(res)
    // })

    test('test_verifySignature', () => {
        const pub = PublicKey.deserializeHex(
            new StringReader('12020290cd6eaa63bf52a3318e770364ff1a21360f907680959ca4dce11136fbded6a1'));
        const content = 'helloworld';
        const sig = 'AfR69Xn4I0Pk0Auj+gtYvoXNABsJgzdCJw+VsEjRJxh4xr9Bf6juddwulY3pm7duG8BepZe6KrM5qbSzV/cQXW8=';
        const value = Buffer.from(sig, 'base64').toString('hex');
        console.log('value: ' + value);
        const signature = new Signature(SignatureScheme.ECDSAwithSHA256, value);
        const result = pub.verify(content, signature);
        console.log(result);
        expect(result).toBeTruthy();
    });

    // entropy: 67a144559c029099e66c24175a3143a7
// MnmenoicCodes: guilt any betray day cinnamon erupt often loyal blanket spice extend exact
// seed: 54670753cc5f20e9a99d21104c1743037891a8aadb62146bdd0fd422edf38166358fb8b7253b4abbc0799f386d81e472352da1413eaa817638a4a887db03fdf5
// prikey: 54670753cc5f20e9a99d21104c1743037891a8aadb62146bdd0fd422edf38166

    test('test_mnemonicWithJava', () => {
        const entropy = '67a144559c029099e66c24175a3143a7';
        const mne = bip39.entropyToMnemonic(entropy);
        expect(mne).toEqual('guilt any betray day cinnamon erupt often loyal blanket spice extend exact');

        const pri = core.generatePrivatekeyFromMnemonic(mne);
        expect(pri.key).toEqual('54670753cc5f20e9a99d21104c1743037891a8aadb62146bdd0fd422edf38166');
    });



});
