import { VmType } from './../src/transaction/payload/deployCode';
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

import { makeDeployCodeTransaction, signTransaction } from '../src/transaction/transactionBuilder';
import { reverseHex } from '../src/utils';

import { MAIN_ONT_URL, TEST_ONT_URL } from '../src/consts';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import TxSender from '../src/transaction/txSender';

import { Address } from '../src/crypto';
import { RestClient } from '../src/index';
import json from '../src/smartcontract/data/idContract.abi';
import { Account } from './../src/account';
import { PrivateKey } from './../src/crypto/PrivateKey';
// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('test deploy contract', () => {

    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    console.log(account.address.toBase58());

    const ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b';

    const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

    const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

    // tslint:disable-next-line:max-line-length
    const attestClaimAvmCode = '58c56b6a00527ac46a51527ac46a00c30548656c6c6f9c6416006a51c300c36a52527ac46a52c3650b006c756661006c756655c56b6a00527ac46a00c3681253797374656d2e52756e74696d652e4c6f6761516c7566';

    // const url = 'http://polaris1.ont.io:20334';
    const url = 'http://127.0.0.1:20334'; //TODO Why is it localhost address ?
    const restClient = new RestClient(url);
    test('test deploy with avm code', async () => {

        const tx = makeDeployCodeTransaction(attestClaimAvmCode,
            'name', '1.0', 'alice', 'testmail', 'desc', true, '500', '30000000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);
        const result = await restClient.sendRawTransaction(tx.serialize());
        // tslint:disable:no-console
        console.log(result);
        expect(result.Error).toEqual(0);
    }, 10000);

    test('get_contract', async () => {
        const contract = Address.fromVmCode(attestClaimAvmCode);
        const codeHash = contract.toHexString();
        // tslint:disable:no-console
        console.log('contract address: ' + contract.serialize());
        console.log('codeHash: ' + codeHash);
        const result = await restClient.getContract(codeHash);
        console.log(result);
        expect(result.Result).toBeTruthy();
    }, 10000);

    test('getContract', async () => {
        const restClient = new RestClient(MAIN_ONT_URL.REST_URL);   //TODO Should we use MAIN_ONT_URL in tests ?
        const hash = '36bb5c053b6b839c8f6b923fe852f91239b9fccc';
        const contract = reverseHex(hash);
        const res = await restClient.getContract(hash);
        console.log(res);
    });
});
