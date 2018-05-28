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

import { PrivateKey } from '../src/crypto';
import { extractKeyId, extractOntId, Message, retrievePublicKey } from '../src/message';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildRegisterOntidTx } from '../src/smartcontract/ontidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';

describe('test message', () => {
    const restUrl = 'http://polaris1.ont.io:20334';
    const privateKey = new PrivateKey('eaec4e682c93648d24e198da5ef9a9252abd5355c568cd74fba59f98c0b1a8f4');
    const publicKey = privateKey.getPublicKey();

    class TestMessage extends Message {
        static deserialize(jwt: string): TestMessage {
            return super.deserializeInternal(jwt, (m, s) => new TestMessage(m, s));
        }
        payloadToJSON(): any {
            return {};
        }

        // tslint:disable-next-line:no-empty
        payloadFromJSON(json: any): void {
        }
    }

    beforeAll(async () => {
        const ontId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w';
        const tx = buildRegisterOntidTx(ontId, publicKey, '0');
        signTransaction(tx, privateKey);

        const client = new WebsocketClient();
        await client.sendRawTransaction(tx.serialize(), false, true);
    }, 10000);

    test('test extractOntId and extractKeyId', () => {
        const publicKeyId = 'did:ont:TRAtosUZHNSiLhzBdHacyxMX4Bg3cjWy3r#keys-1';

        const ontId = extractOntId(publicKeyId);
        const keyId = extractKeyId(publicKeyId);

        expect(ontId).toBe('did:ont:TRAtosUZHNSiLhzBdHacyxMX4Bg3cjWy3r');
        expect(keyId).toBe(1);
    });

    test('test extractOntId and extractKeyId wrong', () => {
        const publicKeyId = 'did:ont:TRAtosUZHNSiLhzBdHacyxMX4Bg3cjWy3r#notkeys-1';

        expect(() => {
            const ontId = extractOntId(publicKeyId);
        }).toThrowError();

        expect(() => {
            const ontId = extractKeyId(publicKeyId);
        }).toThrowError();
    });

    test('test retrievePublicKey', async () => {
        const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-1';

        await expect(retrievePublicKey(publicKeyId, restUrl)).resolves.toBeDefined();
    }, 10000);

    test('test retrievePublicKey', async () => {
        const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-2';

        await expect(retrievePublicKey(publicKeyId, restUrl)).rejects.toThrowError();
    });

    test('test unsigned message serialization', async () => {
        const msg: TestMessage = new TestMessage({
            messageId: '1',
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823015
        }, undefined);

        expect(msg.serializeUnsigned()).toEqual('eyJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9udD' +
            'pUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWl' +
            'tZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzMDE1fQ');
    });

    test('test messageId generation', async () => {
        const msg: TestMessage = new TestMessage({
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823015
        }, undefined);

        expect(msg.metadata.messageId).toBeDefined();
    });

    test('test signature', async () => {
        const msg: TestMessage = new TestMessage({
            messageId: '1',
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823,
            expireAt: 1849046400
        }, undefined);

        const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-1';

        await msg.sign(restUrl, publicKeyId, privateKey);

        expect(msg.serialize()).toEqual('eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9' +
            'udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW' +
            '5BMWltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJleHAiOjE4NDkwNDY0MDB9.n0vL2Zhs' +
            'BBuo_whyesuoKSW3R7X4PRIs68NVX42A87u12AuaTFc7xpx67Z-PW2DsURQ1t8lGqe3jV3CgcmajCw');
    });

    test('test signature non existant key', async () => {
        const msg: TestMessage = new TestMessage({
            messageId: '1',
            issuer: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            subject: 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w',
            issuedAt: 1525800823015
        }, undefined);

        const publicKeyId = 'did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-2';

        await expect(msg.sign(restUrl, publicKeyId, privateKey)).rejects.toThrowError();
    });

    test('test unsigned message deserialization', async () => {
        const serialized = 'eyJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9udD' +
            'pUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWl' +
            'tZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzMDE1fQ';

        const msg = TestMessage.deserialize(serialized);

        expect(msg.metadata.messageId).toEqual('1');
        expect(msg.metadata.issuer).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.subject).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.issuedAt).toEqual(1525800823015);
        expect(msg.signature).toBeUndefined();
    });

    test('test signed message deserialization', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRp' +
            'ZDpvbnQ6VEdwb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiO' +
            'iIxIiwiaXNzIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic' +
            '3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxN' +
            'TI1ODAwODIzMDE1fQ.ems6wDdb9UncdNFq6qtOJuBKaMhE-fskAQAyId9T7oI8ZfkryLElEctQfF' +
            'YB2zWf4fVPTNwmYTz0noOeudb8ag';

        const msg = TestMessage.deserialize(serialized);

        expect(msg.metadata.messageId).toEqual('1');
        expect(msg.metadata.issuer).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.subject).toEqual('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w');
        expect(msg.metadata.issuedAt).toEqual(1525800823015);
        expect(msg.signature.algorithm).toBeDefined();
        expect(msg.signature.publicKeyId).toBe('did:ont:TGpoKGo26xmnA1imgLwLvYH2nhWnN62G9w#keys-1');
        expect(msg.signature.value).toBe('7a6b3ac0375bf549dc74d16aeaab4e26e04a68c844f9fb2401003221d' +
            'f53ee823c65f92bc8b12511cb507c5601db359fe1f54f4cdc26613cf49e839eb9d6fc6a');
    });

    test('test verify', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRp' +
            'ZDpvbnQ6VEdwb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiO' +
            'iIxIiwiaXNzIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic' +
            '3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxN' +
            'TI1ODAwODIzMDE1fQ.ems6wDdb9UncdNFq6qtOJuBKaMhE-fskAQAyId9T7oI8ZfkryLElEctQfF' +
            'YB2zWf4fVPTNwmYTz0noOeudb8ag';

        const msg = TestMessage.deserialize(serialized);

        const result = await msg.verify(restUrl);

        expect(result).toBeTruthy();
    });

    test('test verify tampered', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRp' +
            'ZDpvbnQ6VEdwb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiO' +
            'iIxIiwiaXNzIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic' +
            '3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzlhIiwiaWF0IjoxN' +
            'TI1ODAwODIzMDE1fQ.ems6wDdb9UncdNFq6qtOJuBKaMhE-fskAQAyId9T7oI8ZfkryLElEctQfF' +
            'YB2zWf4fVPTNwmYTz0noOeudb8ag';

        const msg = TestMessage.deserialize(serialized);

        const result = await msg.verify(restUrl);

        expect(result).toBeFalsy();
    });

    test('test verify expired', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9' +
            'udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW' +
            '5BMWltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJleHAiOjE1MjU4MDA4MjR9.7NfItSSE' +
            'pgSDfI8pf6zADaNdc1Dl_tSZoJzYSi21TFL2UKAAwvSHHFtVB7bQfxvaMLEgJ9pU_hP7bYUsiG48Qg';

        const msg = TestMessage.deserialize(serialized);

        const result = await msg.verify(restUrl);

        expect(result).toBeFalsy();
    });

    test('test verify not expired', async () => {
        const serialized = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDpvbnQ6VEd' +
            'wb0tHbzI2eG1uQTFpbWdMd0x2WUgybmhXbk42Mkc5dyNrZXlzLTEifQ.eyJqdGkiOiIxIiwiaXNzIjoiZGlkOm9' +
            'udDpUR3BvS0dvMjZ4bW5BMWltZ0x3THZZSDJuaFduTjYyRzl3Iiwic3ViIjoiZGlkOm9udDpUR3BvS0dvMjZ4bW' +
            '5BMWltZ0x3THZZSDJuaFduTjYyRzl3IiwiaWF0IjoxNTI1ODAwODIzLCJleHAiOjE4NDkwNDY0MDB9.n0vL2Zhs' +
            'BBuo_whyesuoKSW3R7X4PRIs68NVX42A87u12AuaTFc7xpx67Z-PW2DsURQ1t8lGqe3jV3CgcmajCw';

        const msg = TestMessage.deserialize(serialized);

        const result = await msg.verify(restUrl);

        expect(result).toBeTruthy();
    });
});
