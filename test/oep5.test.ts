import RestClient from '../src/network/rest/restClient';
import { Address } from './../src/crypto/address';
import { PrivateKey } from './../src/crypto/PrivateKey';
import { WebsocketClient } from './../src/network/websocket/websocketClient';
import { Oep5Param, Oep5TxBuilder } from './../src/smartcontract/neovm/oep5TxBuilder';

import { addSign, signTransaction } from './../src/transaction/transactionBuilder';
import { hexstr2str, reverseHex } from './../src/utils';
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

describe('test oep5', () => {
    const private1 = new PrivateKey('5f2fe68215476abb9852cfa7da31ef00aa1468782d5ca809da5c4e1390b8ee45');
    const private2 = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');
    const private3 = new PrivateKey('1094e90dd7c4fdfd849c14798d725ac351ae0d924b29a279a9ffa77d5737bd96');

    const address1 = new Address('AQf4Mzu1YJrhz9f3aRkkwSm9n3qhXGSh4p');
    const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');
    const address3 = new Address('AVXf5w8WD2y6jV1Lzi36oSKYNif1C7Surc');

    const codeHash = '93ce027f647dd2bd99545b089a77aca0f9ddb155';

    const contractAddr = new Address(reverseHex(codeHash));
    const oep5 = new Oep5TxBuilder(contractAddr);
    const gasPrice = '500';
    const gasLimit = '281571';
    // const url = TEST_ONT_URL.REST_URL;
    const url = 'http://polaris1.ont.io:';
    const restClient = new RestClient(url + '20334');
    const socketClient = new WebsocketClient(url + '20335');
    let tokenId1 = '';
    let tokenId2 = '';
    let tokenId3 = '';
    let tokenId4 = '';

    beforeAll(async () => {
        const tx1 = oep5.makeQueryTokenIDByIndexTx(1);
        const res1 = await restClient.sendRawTransaction(tx1.serialize(), true);
        tokenId1 = res1.Result.Result;

        const tx2 = oep5.makeQueryTokenIDByIndexTx(2);
        const res2 = await restClient.sendRawTransaction(tx2.serialize(), true);
        tokenId2 = res2.Result.Result;

        const tx3 = oep5.makeQueryTokenIDByIndexTx(3);
        const res3 = await restClient.sendRawTransaction(tx3.serialize(), true);
        tokenId3 = res3.Result.Result;

        const tx4 = oep5.makeQueryTokenIDByIndexTx(4);
        const res4 = await restClient.sendRawTransaction(tx4.serialize(), true);
        tokenId4 = res4.Result.Result;
    });

    test('init', async () => {
        const tx = oep5.makeInitTx(gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });

    test('getBalance', async () => {
        const tx = oep5.makeQueryBalanceOfTx(address2);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        const val = res.Result.Result ? parseInt(reverseHex(res.Result.Result), 16) : 0;
        // tslint:disable-next-line:no-console
        console.log(val);
        expect(val).toBeGreaterThan(0);
    });

    test('queryTokenID_1_ByIndex', async () => {
        const tx = oep5.makeQueryTokenIDByIndexTx(1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        tokenId1 = res.Result.Result;
        console.log(tokenId1);
        // tslint:disable-next-line:no-console
        expect(tokenId1).toBeDefined();
    });

    test('queryTokenID_2_ByIndex', async () => {
        const tx = oep5.makeQueryTokenIDByIndexTx(2);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        tokenId2 = res.Result.Result;
        // tslint:disable-next-line:no-console
        expect(tokenId2).toBeDefined();
    });
    test('queryTokenID_3_ByIndex', async () => {
        const tx = oep5.makeQueryTokenIDByIndexTx(3);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        tokenId3 = res.Result.Result;
        // tslint:disable-next-line:no-console
        expect(tokenId3).toBeDefined();
    });

    test('transfer', async () => {
        console.log(tokenId1);
        const oep5Param = new Oep5Param(address2, tokenId1);
        const tx = oep5.makeTransferTx(oep5Param, gasPrice, gasLimit, address2);
        signTransaction(tx, private2); // payer's signature
        addSign(tx, private1); // add owner's signature if payer and owner are not the same
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);

    test('test_totalSupply', async () => {
        const tx = oep5.makeQueryTotalSupplyTx();
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const val = parseInt(reverseHex(res.Result.Result), 16);
        // tslint:disable-next-line:no-console
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_name', async () => {
        const tx = oep5.makeQueryNameTx();
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = hexstr2str(res.Result.Result);
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeDefined();
    }, 10000);

    test('test_symbol', async () => {
        const tx = oep5.makeQuerySymbolTx();
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = hexstr2str(res.Result.Result);
        // tslint:disable-next-line:no-console
        console.log(val);
        expect(val).toBeDefined();
    });

    test('test_ownerOf', async () => {
        const tx = oep5.makeOwnerOfTx(tokenId3);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        const address = new Address(res.Result.Result).toBase58();
        console.log(address);
        // tslint:disable-next-line:no-console
        expect(res).toBeTruthy();
    }, 10000);

    test('test_approve', async () => {
        const tx = oep5.makeApproveTx(new Oep5Param(address3, tokenId3), gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });

    test('test_getApproved', async () => {
        const tx = oep5.makeGetApprovedTx(tokenId3);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        const address = new Address(res.Result.Result).toBase58();
        console.log(address);
        // tslint:disable-next-line:no-console
        expect(res).toBeTruthy();
    }, 10000);

    test('test_takeOwnership', async () => {
        const tx = oep5.makeTakeOwnershipTx(new Oep5Param(address3, tokenId3), gasPrice, gasLimit, address3);
        signTransaction(tx, private3);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Result.State).toEqual(1);
    });

    test('test_transferMulti', async () => {
        const param1 = new Oep5Param(address2, tokenId2);
        const param2 = new Oep5Param(address2, tokenId4);
        console.log(tokenId1);
        console.log(tokenId4);
        const tx = oep5.makeTransferMultiTx([param1, param2], gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        // addSign(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });
});
