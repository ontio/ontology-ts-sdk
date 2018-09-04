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

import { Issuer, User } from '../src/crypto';

describe('test Anonymous Crendential', () => {

    const curve = 'BN254';
    const AttributeName = ['24', 'master', 'male', 'handsome'];
    const Disclosure = [1, 0, 1, 0];

    const I = new Issuer(curve);
    const U = new User(curve);
    const V = new User(curve);

    beforeAll(() => {
        // privateKey = PrivateKey.random();
        // // console.log(privateKey.serializeJson())
        // console.log(privateKey.serializeWIF());
    });

    test('test create', () => {

        /* issuer setup */
        console.log('I.GenerateSk()');
        I.GenerateSk();
        console.log('I.GenerateKeyPair()');
        I.GenerateKeyPair();
        console.log('I.SetAttributeSet(AttributeName)');
        I.SetAttributeSet(AttributeName);

        console.log('I.GetPk()');
        const ipk = I.GetPk();
        console.log('I.Publish(I.ipk)');

        console.log('U.SetIpk(I.ipk)');
        U.SetIpk(ipk);
        console.log('U.GenerateSk()');
        U.GenerateSk();

        /* issuer generate a random nonce number */
        console.log('I.GenerateNonce()');
        const nonce = I.GenerateNonce();
        console.log('I.send(nonce)');

        /* user */
        console.log('U.GenerateCrendentialRequest(nonce)');
        const CR = U.GenerateCrendentialRequest(nonce);
        console.log('U.send(CrendentialRequest)');

        console.log('I.pk.VerifyCredentialRequest(CR)');
        const v = I.VerifyCredentialRequest(CR); // verify pi
        console.log(v);
        expect(v).toBe(true);

        console.log('I.Sign(CR.Nym, CR.attrs)');
        const Cred = I.Sign(CR.Nym, CR.attrs);
        console.log('I.send(Credential)');

        console.log('U.VerifyBBSplus(Credential), or call it verify issuer\'s reality');
        const uv = U.VerifyBBSplus(Cred);
        console.log(uv);
        expect(uv).toBe(true);

        console.log('U.SetCred(Credential)');
        U.SetCredential(Cred);

        /*
         * @inputs
         *   D: Disclosure of attributes.
         *   Nonce: a non-sense string for fresh.
         * @output
        */
        console.log('U.prove(Credential)');
        const proof = U.Prove(Disclosure);

        /* U ---> V */
        console.log('U.send(proof)');

        console.log('V.SetIpk(I.ipk)');
        V.SetIpk(ipk);

        console.log('V.Verify(U.proof, U.Disclosure, U.attrs)');
        const r = V.Verify(proof, Disclosure, U.attrs);
        console.log(r);

        expect(r).toBe(true);

        console.log('BINGO~');

    });
});
