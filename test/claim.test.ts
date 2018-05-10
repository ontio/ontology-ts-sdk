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

import { Claim, RevocationType } from '../src/claim/Claim'
import { PrivateKey, Signature, KeyType } from '../src/crypto';

describe('test claim', () => {
    const restUrl = 'http://polaris1.ont.io:20334';
    const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-1';
    const privateKey = new PrivateKey('eaec4e682c93648d24e198da5ef9a9252abd5355c568cd74fba59f98c0b1a8f4');

    test('test serialization', () => {
        const claim = new Claim({
            messageId: '1',
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823
        }, undefined, false);
        claim.version = '0.7.0';
        claim.context = 'https://example.com/template/v1';
        claim.content = {
            Name: 'Bob Dylan',
            Age: '22'
        };
        claim.revocation = {
            type: RevocationType.AttestContract,
            addr: '8055b362904715fd84536e754868f4c8d27ca3f6'
        };

        expect(claim.serialize()).toEqual('eyJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9udDpUR3B' +
            'vS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x' +
            '3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJ2ZXIiOiIwLjcuMCIsIkBjb250ZXh0IjoiaHR0cHM' +
            '6Ly9leGFtcGxlLmNvbS90ZW1wbGF0ZS92MSIsImNsbSI6eyJOYW1lIjoiQm9iIER5bGFuIiwiQWdlIjoiMjIifSw' +
            'iY2xtLXJldiI6eyJ0eXBlIjoiQXR0ZXN0Q29udHJhY3QiLCJhZGRyIjoiODA1NWIzNjI5MDQ3MTVmZDg0NTM2ZTc' +
            '1NDg2OGY0YzhkMjdjYTNmNiJ9fQ');
    });

    test('test deserialization', async () => {
        const serialized = 'eyJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9udDpUR3B' +
            'vS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x' +
            '3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJ2ZXIiOiIwLjcuMCIsIkBjb250ZXh0IjoiaHR0cHM' +
            '6Ly9leGFtcGxlLmNvbS90ZW1wbGF0ZS92MSIsImNsbSI6eyJOYW1lIjoiQm9iIER5bGFuIiwiQWdlIjoiMjIifSw' +
            'iY2xtLXJldiI6eyJ0eXBlIjoiQXR0ZXN0Q29udHJhY3QiLCJhZGRyIjoiODA1NWIzNjI5MDQ3MTVmZDg0NTM2ZTc' +
            '1NDg2OGY0YzhkMjdjYTNmNiJ9fQ';

        const msg = Claim.deserialize(serialized);

        expect(msg.metadata.messageId).toEqual('1');
        expect(msg.metadata.issuer).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.subject).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.issuedAt).toEqual(1525800823);
        expect(msg.signature).toBeUndefined();
        expect(msg.version).toEqual('0.7.0');
        expect(msg.context).toEqual('https://example.com/template/v1');
        expect(msg.content.Name).toEqual('Bob Dylan');
        expect(msg.content.Age).toEqual('22');
        expect(msg.revocation.type).toEqual(RevocationType.AttestContract);
        expect(msg.revocation.addr).toEqual('8055b362904715fd84536e754868f4c8d27ca3f6');
        expect(msg.revocation.url).toBeUndefined();
    });

    test('test signature', async () => {
        const claim = new Claim({
            messageId: '1',
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823
        }, undefined, false);
        claim.version = '0.7.0';
        claim.context = 'https://example.com/template/v1';
        claim.content = {
            Name: 'Bob Dylan',
            Age: '22'
        };
        claim.revocation = {
            type: RevocationType.AttestContract,
            addr: '8055b362904715fd84536e754868f4c8d27ca3f6'
        };

        await claim.sign(restUrl, publicKeyId, privateKey);

        expect(claim.serialize()).toEqual('eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9ud' +
            'DpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMW' +
            'ltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJ2ZXIiOiIwLjcuMCIsIkBjb250ZXh0IjoiaHR' +
            '0cHM6Ly9leGFtcGxlLmNvbS90ZW1wbGF0ZS92MSIsImNsbSI6eyJOYW1lIjoiQm9iIER5bGFuIiwiQWdlIjoiMjIi' +
            'fSwiY2xtLXJldiI6eyJ0eXBlIjoiQXR0ZXN0Q29udHJhY3QiLCJhZGRyIjoiODA1NWIzNjI5MDQ3MTVmZDg0NTM2Z' +
            'Tc1NDg2OGY0YzhkMjdjYTNmNiJ9fQ.E8dJT8yOonnfb-N9PZt6pgyqGwSCHKW5xu3kF1yZpU6ahPxvhHtAM0oJhnu' +
            'IoyMINvOvjzcxiVZ1-69UAozy6w');
    });

    test('test verify', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9ud' +
            'DpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMW' +
            'ltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJ2ZXIiOiIwLjcuMCIsIkBjb250ZXh0IjoiaHR' +
            '0cHM6Ly9leGFtcGxlLmNvbS90ZW1wbGF0ZS92MSIsImNsbSI6eyJOYW1lIjoiQm9iIER5bGFuIiwiQWdlIjoiMjIi' +
            'fSwiY2xtLXJldiI6eyJ0eXBlIjoiQXR0ZXN0Q29udHJhY3QiLCJhZGRyIjoiODA1NWIzNjI5MDQ3MTVmZDg0NTM2Z' +
            'Tc1NDg2OGY0YzhkMjdjYTNmNiJ9fQ.E8dJT8yOonnfb-N9PZt6pgyqGwSCHKW5xu3kF1yZpU6ahPxvhHtAM0oJhnu' +
            'IoyMINvOvjzcxiVZ1-69UAozy6w';

        const msg = Claim.deserialize(serialized);

        const result = await msg.verify(restUrl, false);

        expect(result).toBeTruthy();
    });

    test('test verify with missing attest', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9ud' +
            'DpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMW' +
            'ltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJ2ZXIiOiIwLjcuMCIsIkBjb250ZXh0IjoiaHR' +
            '0cHM6Ly9leGFtcGxlLmNvbS90ZW1wbGF0ZS92MSIsImNsbSI6eyJOYW1lIjoiQm9iIER5bGFuIiwiQWdlIjoiMjIi' +
            'fSwiY2xtLXJldiI6eyJ0eXBlIjoiQXR0ZXN0Q29udHJhY3QiLCJhZGRyIjoiODA1NWIzNjI5MDQ3MTVmZDg0NTM2Z' +
            'Tc1NDg2OGY0YzhkMjdjYTNmNiJ9fQ.E8dJT8yOonnfb-N9PZt6pgyqGwSCHKW5xu3kF1yZpU6ahPxvhHtAM0oJhnu' +
            'IoyMINvOvjzcxiVZ1-69UAozy6w';

        const msg = Claim.deserialize(serialized);

        const result = await msg.verify(restUrl, true);

        expect(result).toBeFalsy();
    });
});
