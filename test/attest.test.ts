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

import * as uuid from 'uuid';
import { Claim, RevocationType } from '../src/claim/claim';
import { KeyType, PrivateKey, Signature } from '../src/crypto';
import { now } from '../src/utils';

describe('test attest claim', () => {
    const sockUrl = 'ws://polaris1.ont.io:20335';
    const restUrl = 'http://polaris1.ont.io:20334';
    const ontId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w';
    const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-1';
    const privateKey = new PrivateKey('eaec4e682c93648d24e198da5ef9a9252abd5355c568cd74fba59f98c0b1a8f4');

    function randomClaim(): Claim {
        return new Claim({
            issuer: ontId,
            subject: ontId,
            issuedAt: now()
        }, undefined);
    }

    function claimWithId(id: string): Claim {
        return new Claim({
            messageId: id,
            issuer: ontId,
            subject: ontId,
            issuedAt: now()
        }, undefined);
    }

    test('test attest new', async () => {
        const claim = randomClaim();
        const result = await claim.attest(sockUrl, privateKey);

        expect(result).toBeTruthy();
    }, 10000);

    test('test attest existing', async () => {
        const claim = claimWithId('4df086e3-713d-489d-96fe-8c1bb08ce3ea');
        const result = await claim.attest(sockUrl, privateKey);

        expect(result).toBeFalsy();
    }, 10000);

    test('test revoke existing', async () => {
        const claim = randomClaim();

        const resultAttest = await claim.attest(sockUrl, privateKey);
        expect(resultAttest).toBeTruthy();

        const resultRevoke = await claim.revoke(sockUrl, privateKey);
        expect(resultRevoke).toBeTruthy();
    }, 20000);

    test('test revoke non existing', async () => {
        const claim = randomClaim();
        const resultRevoke = await claim.revoke(sockUrl, privateKey);

        expect(resultRevoke).toBeFalsy();
    }, 10000);

    test('test getStatus ATTESTED', async () => {
        const claim = claimWithId('4df086e3-713d-489d-96fe-8c1bb08ce3ea');
        const result = await claim.getStatus(restUrl);

        expect(result).toBeTruthy();
    }, 10000);

    test('test getStatus ATTESTED by different attester', async () => {
        const claim = claimWithId('4df086e3-713d-489d-96fe-8c1bb08ce3ea');
        claim.metadata.issuer = 'did:ont:TVgarJ2yuWDqXk5WjUwHZEgFqJZUKDNX1C';
        const result = await claim.getStatus(restUrl);

        expect(result).toBeFalsy();
    }, 10000);

    test('test getStatus NOT FOUND', async () => {
        const claim = randomClaim();
        const result = await claim.getStatus(restUrl);

        expect(result).toBeFalsy();
    }, 10000);

    test('test revoke existing and status', async () => {
        const claim = randomClaim();

        const resultAttest = await claim.attest(sockUrl, privateKey);
        expect(resultAttest).toBeTruthy();

        const resultRevoke = await claim.revoke(sockUrl, privateKey);
        expect(resultRevoke).toBeTruthy();

        const result = await claim.getStatus(restUrl);
        expect(result).toBeFalsy();
    }, 20000);
});
