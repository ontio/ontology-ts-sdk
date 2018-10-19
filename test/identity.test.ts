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

import axios from 'axios';
import { Address, PrivateKey } from '../src/crypto';
import { ERROR_CODE } from '../src/error';
import { Identity } from '../src/identity';
import { buildRegisterOntidTx } from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import * as utils from '../src/utils';
import { Account } from './../src/account';
import { signTransaction } from './../src/transaction/transactionBuilder';

describe('test identity', () => {

    // tslint:disable-next-line:one-variable-per-declaration
    let privateKey: PrivateKey,
        identityDataStr: string,
        identity: Identity,
        encryptedPrivateKey: PrivateKey,
        address: Address;

    beforeAll(() => {
        privateKey = PrivateKey.random();
    });

    test('test create', () => {
        identity = Identity.create(privateKey, '123456', 'mickey');
        address = identity.controls[0].address;
        encryptedPrivateKey = identity.controls[0].encryptedKey;
        identityDataStr = identity.toJson();
        console.log(identityDataStr);
        const itemp = Identity.parseJson(identityDataStr);
        expect(itemp).toBeDefined();
        expect(identityDataStr).toBeDefined();
        const pri = identity.exportPrivateKey('123456');
        expect(pri.key).toEqual(privateKey.key);
    });

    test('test import with correct password', () => {
        // tslint:disable:no-console
        console.log('encryptedkey: ' + encryptedPrivateKey.key);
        let a: Identity;

        try {
            a = Identity.importIdentity('mickey', encryptedPrivateKey, '123456', address, identity.controls[0].salt);
        } catch (err) {
            console.log(err);
        }
        expect(a.label).toBe('mickey');
    });

    test('test import with incorrect password', () => {
        try {
            const a = Identity.importIdentity('', encryptedPrivateKey, '123457', address, identity.controls[0].salt);
        } catch (err) {
            console.log(err);
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR);
        }
    });

    test('test_userAgent_devicecode', async () => {
        const pri = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
        const a = Identity.create(pri, '123456', '');
        // const encrypt = new PrivateKey('xLdlFLuWMUcHZagEAiFZEiCwm1eQYbSEONIwxxL4qPk=');
        // const pri = encrypt.decrypt('111111', new Address('TA8z22MRYHcFRKJznJWWGFz5brXBsmMTJZ'));
        // a.create(pri, '123456', 'test');
        const data = {
            OwnerOntId : a.ontid
        };
        const msg = JSON.stringify(data);
        const pkId = a.ontid + '#key-1';
        console.log('msg: ' + msg);
        const sig = pri.sign(msg, undefined, pkId);
        const body = {
            OwnerOntId: a.ontid,
            Signature : sig.serializePgp()
        };
        console.log('value: ' + body.Signature.Value);

        console.log('pk: ' + pri.getPublicKey().serializeHex());
        console.log(JSON.stringify(body));
        // const userAgent = 'http://192.168.50.121:9099/api/v1/ontpass/devicecode/gain';
        // const res = await axios.post(userAgent, body).then( (res) => {
        //     console.log(res.data);
        //     return res.data;
        // });
    });

});
