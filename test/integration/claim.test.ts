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

import { Account } from '../../src/account';
import { Claim, RevocationType } from '../../src/claim/claim';
import { Address, PrivateKey } from '../../src/crypto';
import { Identity } from '../../src/identity';
import { constructMerkleProof } from '../../src/merkle';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import { buildRegisterOntidTx } from '../../src/smartcontract/nativevm/ontidContractTxBuilder';
import { addSign, signTransaction } from '../../src/transaction/transactionBuilder';

import * as b64 from 'base64-url';
import { str2hexstr } from '../../src/utils';
import { TEST_ONT_URL_2} from "../../src/consts";

describe('test claim', () => {
    const restUrl = TEST_ONT_URL_2.REST_URL;
    const socketUrl = TEST_ONT_URL_2.SOCKET_URL;
    const privateKey = PrivateKey.random();
    const publicKey = privateKey.getPublicKey();
    const account = Account.create(privateKey, '123456', '');
    const identity = Identity.create(privateKey, '123456', '');
    const ontid =  identity.ontid;
    const address = account.address;
    const publicKeyId = ontid + '#keys-1';

    const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');

    let serialized: string;
    let signed: string;

    // tslint:disable:no-console
    console.log('did:' + ontid);
    /**
     * Registers new ONT ID to create transaction with Events and new block
     */
    beforeAll(async () => {
        const tx = buildRegisterOntidTx(ontid, publicKey, '2500', '30000');
        tx.payer = adminAddress;
        signTransaction(tx, adminPrivateKey);
        addSign(tx, privateKey);

        const client = new WebsocketClient(socketUrl);
        await client.sendRawTransaction(tx.serialize(), false, true);
    }, 10000);

    test('test serialization', () => {
        const claim = new Claim({
            messageId: '1',
            issuer: ontid,
            subject: ontid,
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

        serialized = claim.serialize();

        expect(serialized).toBeDefined();

    });

    test('test deserialization', async () => {
        const msg = Claim.deserialize(serialized);

        expect(msg.metadata.messageId).toEqual('1');
        expect(msg.metadata.issuer).toEqual(ontid);
        expect(msg.metadata.subject).toEqual(ontid);
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
            issuer: ontid,
            subject: ontid,
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

        signed = claim.serialize();

        expect(claim.signature).toBeDefined();
    });

    test('test verify', async () => {
        const msg = Claim.deserialize(signed);

        const result = await msg.verify(restUrl, false);

        expect(result).toBeTruthy();
    });

    
    test('test_claim', async () => {
        const ontid = 'did:ont:AeXrnQ7jvo3HbSPgiThkgJ7ifPQkzXhtpL';
        const publicKeyId = ontid + '#keys-1';
        const privateKey = new PrivateKey('4a8d6d61060998cf83acef4d6e7976d538b16ddeaa59a96752a4a7c0f7ec4860');
        const claim = new Claim({
            messageId: '2020/04/17',
            issuer: ontid,
            subject: ontid,
            issuedAt: 1525800823
        }, undefined, true);
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
        const res = await claim.attest(socketUrl, '2500', '20000', adminAddress, adminPrivateKey);
        const contract = '36bb5c053b6b839c8f6b923fe852f91239b9fccc';
        const proof = await constructMerkleProof(restUrl, res.Result.TxHash, contract);
        claim.proof = proof;
        // console.log(proof);

        const signed = claim.serialize();
        const msg = Claim.deserialize(signed);
       
        const result = await msg.verify(restUrl, true);
        const pk = privateKey.getPublicKey();
        const strs = signed.split('.');

        const signData = str2hexstr(strs[0] + '.' + strs[1]);
        const result2 = pk.verify(signData, msg.signature);
        console.log('result1: ' + result);
        console.log( 'result2: ' + result2);
        
        // console.log('Info: ', signed, result, claim);
    });

    test('bs64', () => {
        const str = 'eyJUeXBlIjoiTWVya2xlUHJvb2YiLCJUeG5IYXNoIjoiYjM4Zjc0Yjg4MDM2OTViMmVkZDM5ODlhZjI0NzU2MmZhZjI0ZGRhZWU5NzU0MTBkOTA0NmEzYzcxYjU3M2NjNyIsIkNvbnRyYWN0QWRkciI6IjM2YmI1YzA1M2I2YjgzOWM4ZjZiOTIzZmU4NTJmOTEyMzliOWZjY2MiLCJCbG9ja0hlaWdodCI6MTE3NjI5NDUsIk1lcmtsZVJvb3QiOiI5YzUwNTYxMjQwNzhmMTRlY2E1NTRjNzk5Nzk1ZjE4YjQ2ZTJhMTk4MTYzYmZiMjNlMjNiMThjOGIyYTRhMDhmIiwiTm9kZXMiOlt7IlRhcmdldEhhc2giOiIwMTkxMGM0MzNhYjlkZjcwNWI1YTI1NTJiZGNjODZjZWRhYjU5NGNkMzc1ZmQ4MTNmMzYzNTQyYWU4MzIwYzM3IiwiRGlyZWN0aW9uIjoiTGVmdCJ9LHsiVGFyZ2V0SGFzaCI6IjE4ZTAyZmY2OGE1ZDU4NmM1NDA0YzdjYTU5ODE1MDJiNzc3MDg5ZDFmYWY3ZjBlYWM2NDIzNTIwMmRiYTMxZTgiLCJEaXJlY3Rpb24iOiIifSx7IlRhcmdldEhhc2giOiIxOGUwMmZmNjhhNWQ1ODZjNTQwNGM3Y2E1OTgxNTAyYjc3NzA4OWQxZmFmN2YwZWFjNjQyMzUyMDJkYmEzMWU4IiwiRGlyZWN0aW9uIjoiIn0seyJUYXJnZXRIYXNoIjoiMThlMDJmZjY4YTVkNTg2YzU0MDRjN2NhNTk4MTUwMmI3NzcwODlkMWZhZjdmMGVhYzY0MjM1MjAyZGJhMzFlOCIsIkRpcmVjdGlvbiI6IiJ9LHsiVGFyZ2V0SGFzaCI6IjE4ZTAyZmY2OGE1ZDU4NmM1NDA0YzdjYTU5ODE1MDJiNzc3MDg5ZDFmYWY3ZjBlYWM2NDIzNTIwMmRiYTMxZTgiLCJEaXJlY3Rpb24iOiIifSx7IlRhcmdldEhhc2giOiIxOGUwMmZmNjhhNWQ1ODZjNTQwNGM3Y2E1OTgxNTAyYjc3NzA4OWQxZmFmN2YwZWFjNjQyMzUyMDJkYmEzMWU4IiwiRGlyZWN0aW9uIjoiIn0seyJUYXJnZXRIYXNoIjoiMThlMDJmZjY4YTVkNTg2YzU0MDRjN2NhNTk4MTUwMmI3NzcwODlkMWZhZjdmMGVhYzY0MjM1MjAyZGJhMzFlOCIsIkRpcmVjdGlvbiI6IiJ9LHsiVGFyZ2V0SGFzaCI6IjE4ZTAyZmY2OGE1ZDU4NmM1NDA0YzdjYTU5ODE1MDJiNzc3MDg5ZDFmYWY3ZjBlYWM2NDIzNTIwMmRiYTMxZTgiLCJEaXJlY3Rpb24iOiIifSx7IlRhcmdldEhhc2giOiIxOGUwMmZmNjhhNWQ1ODZjNTQwNGM3Y2E1OTgxNTAyYjc3NzA4OWQxZmFmN2YwZWFjNjQyMzUyMDJkYmEzMWU4IiwiRGlyZWN0aW9uIjoiTGVmdCJ9LHsiVGFyZ2V0SGFzaCI6ImU3NTczZWM4MjZlN2Y1ZGY5MWI4MDdlNWU3ZmZjNmY4ZDU3MmZmOTliN2E4YmViNGNmMTRkNzJlYWZmN2E3Y2UiLCJEaXJlY3Rpb24iOiIifSx7IlRhcmdldEhhc2giOiJlNzU3M2VjODI2ZTdmNWRmOTFiODA3ZTVlN2ZmYzZmOGQ1NzJmZjk5YjdhOGJlYjRjZjE0ZDcyZWFmZjdhN2NlIiwiRGlyZWN0aW9uIjoiTGVmdCJ9LHsiVGFyZ2V0SGFzaCI6IjhlNDY1MzBmYWM3NDE0ZjQwZTYwMGZhNTEyYTg2ZDgzZTcxNWIyMTVkY2I5Y2M5MzczMWIwZTVkM2M5MmZkZTkiLCJEaXJlY3Rpb24iOiJMZWZ0In0seyJUYXJnZXRIYXNoIjoiZWU1MWE0YmM3NzA2OGFhZDQzZWRmYjdjYjA1NTU0NzEwNjcwZTJiN2U1ZGI5MWY0NmE5ODE1MjUxMDc1ZTE2YiIsIkRpcmVjdGlvbiI6IkxlZnQifSx7IlRhcmdldEhhc2giOiJkNmYyNWU3NjQ0MjE3ZDY1MzI4NDVkNjJmZDdhMTYwZjgxMjcyYzk0ZGZjNTgzYTQ2NzNlNGVhZWQwMmZkMTAyIiwiRGlyZWN0aW9uIjoiTGVmdCJ9LHsiVGFyZ2V0SGFzaCI6Ijc5ZGVlZThjYTI1NjBlMjgzNDkxYTU4NjIxMGQ4MjE2YmZkN2JjNmQzMjYyYzVhNzA2NTI2OGM5Nzk4YjE4ZDEiLCJEaXJlY3Rpb24iOiJMZWZ0In0seyJUYXJnZXRIYXNoIjoiMjdmZDFiZDkwOWUwMTA2NGEyZmM4NzlhNTBkNTBiMTA5NTg5ZTZlMGYzNmE1OTAxYTQ5OTk3MmIwYzM2OGUxYiIsIkRpcmVjdGlvbiI6IiJ9LHsiVGFyZ2V0SGFzaCI6IjI3ZmQxYmQ5MDllMDEwNjRhMmZjODc5YTUwZDUwYjEwOTU4OWU2ZTBmMzZhNTkwMWE0OTk5NzJiMGMzNjhlMWIiLCJEaXJlY3Rpb24iOiJMZWZ0In0seyJUYXJnZXRIYXNoIjoiNDFlODRhZDc1MWE3MjRiMzcxM2FlMWE2Nzk4NjlmY2VjYTgzMzA4Nzc0NTk3NTI0NzkyNzQ0N2MwY2RmYTRkYSIsIkRpcmVjdGlvbiI6IkxlZnQifSx7IlRhcmdldEhhc2giOiJkMmU3ZjQyNzI3Y2Y5ZGY4MTJiYzE5ZjIwYmU5YjViZGZhNGJlMGY2MDAwZmY0ZTk4YTcyYTQ1MDY0MDczOGM3IiwiRGlyZWN0aW9uIjoiIn0seyJUYXJnZXRIYXNoIjoiZDJlN2Y0MjcyN2NmOWRmODEyYmMxOWYyMGJlOWI1YmRmYTRiZTBmNjAwMGZmNGU5OGE3MmE0NTA2NDA3MzhjNyIsIkRpcmVjdGlvbiI6IiJ9LHsiVGFyZ2V0SGFzaCI6ImQyZTdmNDI3MjdjZjlkZjgxMmJjMTlmMjBiZTliNWJkZmE0YmUwZjYwMDBmZjRlOThhNzJhNDUwNjQwNzM4YzciLCJEaXJlY3Rpb24iOiJMZWZ0In0seyJUYXJnZXRIYXNoIjoiMmQxNjVhMmU4YTIyOGVkMWQxYTQ1YmU5ZDZmMTQ3MDhiM2Y5NGZmMzNlNmU0YzFlZTYzYzE5MWJiMGJiMWE4NyIsIkRpcmVjdGlvbiI6IkxlZnQifSx7IlRhcmdldEhhc2giOiI4ZWUwZGEzNmY5MThhMTMzZWNkMmI2MWJkNGQ3YWMyZDY1NjFmMDhhYWJlMWU2NDllMWI5MTEwYmVhN2Q2NDc1IiwiRGlyZWN0aW9uIjoiIn0seyJUYXJnZXRIYXNoIjoiOGVlMGRhMzZmOTE4YTEzM2VjZDJiNjFiZDRkN2FjMmQ2NTYxZjA4YWFiZTFlNjQ5ZTFiOTExMGJlYTdkNjQ3NSIsIkRpcmVjdGlvbiI6IkxlZnQifV19===';
        console.log(b64.decode(str));
    })
});
