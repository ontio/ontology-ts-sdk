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

import { BigNumber } from 'bignumber.js';
import { Account } from '../src/account';
import { TEST_ONT_URL } from '../src/consts';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { RestClient, WebsocketClient } from '../src/index';
import { Oep8TxBuilder } from '../src/smartcontract/neovm/oep8TxBuilder';
import { addSign, signTransaction } from '../src/transaction/transactionBuilder';
import { hexstr2str, reverseHex } from '../src/utils';
import { Result } from './../src/claim/attestNotifyEvent';
import { Address } from './../src/crypto/address';
import { Oep8State, TransferFrom } from './../src/smartcontract/neovm/oep8TxBuilder';

describe('test oep8', () => {
    const private1 = new PrivateKey('5f2fe68215476abb9852cfa7da31ef00aa1468782d5ca809da5c4e1390b8ee45');
    const private2 = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');
    const private3 = new PrivateKey('1094e90dd7c4fdfd849c14798d725ac351ae0d924b29a279a9ffa77d5737bd96');

    // const account1 = Account.create(private1, '123456', 'Account1'); // AQf4Mzu1YJrhz9f3aRkkwSm9n3qhXGSh4p
    // const account2 = Account.create(private2, '123456', 'Account2'); // AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX
    // const account3 = Account.create(private3, '123456', 'Account3'); // AVXf5w8WD2y6jV1Lzi36oSKYNif1C7Surc
    const address1 = new Address('AQf4Mzu1YJrhz9f3aRkkwSm9n3qhXGSh4p');
    const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');
    const address3 = new Address('AVXf5w8WD2y6jV1Lzi36oSKYNif1C7Surc');
    // console.log(account1.address.toBase58());
    // console.log(account2.address.toBase58());
    // console.log(account3.address.toBase58());

    const codeHash = 'b2ae73193b07043e75de65edd4ad74b0fa6148b3';

    const contractAddr = new Address(reverseHex(codeHash));
    const oep8 = new Oep8TxBuilder(contractAddr);
    const gasPrice = '500';
    const gasLimit = '200000';
    // const url = TEST_ONT_URL.REST_URL;
    const url = 'http://127.0.0.1:';
    const restClient = new RestClient();
    const socketClient = new WebsocketClient();
    // tokenId is from 1 to 7;
    const tokenIds = [1, 2, 3, 4, 5, 6, 7];

    test('test_init', async () => {
        const tx = oep8.makeInitTx(gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });

    test('test_query_Balance', async () => {
        const tx = oep8.makeQueryBalanceOfTx(address1, 1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        if (!res.Result.Result) { // balance is 0
            const balance = 0;
            expect(balance).toEqual(0);
            console.log(balance);
            return;
        }
        const val = parseInt(reverseHex(res.Result.Result), 16);
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_queryBalances', async () => {
        const tx = oep8.makeQueryBalancesTx(address1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        if (res.Result.Result) { // balance is 0
            const vals = res.Result.Result.map((v) => v ? parseInt(reverseHex(v), 16) : 0);
            console.log('Token Ids: ["1", "2", "3", "4", "5", "6", "7", "8"]');
            console.log('Balances: ' + vals);
            expect(vals[0]).toBeGreaterThan(0);
        }
        // tslint:disable-next-line:no-console
    }, 10000);

    test('test_totalBalance', async () => {
        const tx = oep8.makeQueryTotalBalanceTx(address2);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        if (!res.Result.Result) { // balance is 0
            const balance = 0;
            expect(balance).toEqual(0);
            console.log(balance);
            return;
        }
        const val = parseInt(reverseHex(res.Result.Result), 16);
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_makeTransfer', async () => {
        const tx = oep8.makeTransferTx(address1, address2, 1, '1', gasPrice, gasLimit, address2);
        signTransaction(tx, private2);
        addSign(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);

    test('test_totalSupply', async () => {
        const tx = oep8.makeQueryTotalSupplyTx(1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const val = parseInt(reverseHex(res.Result.Result), 16);
        // tslint:disable-next-line:no-console
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_name', async () => {
        const tx = oep8.makeQueryNameTx(1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = hexstr2str(res.Result.Result);
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeDefined();
    }, 10000);

    test('test_symbol', async () => {
        const tx = oep8.makeQuerySymbolTx(1);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = hexstr2str(res.Result.Result);
        // tslint:disable-next-line:no-console
        console.log(val);
        expect(val).not.toBeNull();
    });

    test('test_decimals', async () => {
        const tx = oep8.makeQueryDecimalsTx();
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const val = res.Result;
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeTruthy();
    }, 10000);

     // Amount to approve can not exceed balance.
    test('test_approve', async () => {
        const tx = oep8.makeApproveTx(address1, address3, 1, '10', gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Result.State).toEqual(1);
    });

    test('test_queryAllowance', async () => {
        const tx = oep8.makeQueryAllowanceTx(address1, address3, 4);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        // const val = parseInt(reverseHex(res.Result.Result), 16);
        const val = new BigNumber(reverseHex(res.Result.Result), 16).toString();
        console.log(val);
        expect(res).toBeDefined(); // it will change after transferFrom
    });

    test('test_transferFrom_error', async () => {
        const tx = oep8.makeTransferFromTx(address3, address1, address3, 1, '15', gasPrice, gasLimit, address3);
        signTransaction(tx, private3);
        let res;
        res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(res));
        expect(res.Error).toEqual(-1);
    });

    test('test_transferFrom_right', async () => {
        const tx = oep8.makeTransferFromTx(address3, address1, address3, 1, '9', gasPrice, gasLimit, address3);
        signTransaction(tx, private3);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Result.State).toEqual(1);
    });

    test('test_transferMulti', async () => {
        const state1 = new Oep8State(address1, address2, 3, '3');
        const state2 = new Oep8State(address1, address3, 3, '4');
        const tx = oep8.makeTransferMultiTx([state1, state2], gasPrice, gasLimit, address3);
        signTransaction(tx, private3);
        addSign(tx, private1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        expect(res.Result.State).toEqual(1);
    });

    test('test_approveMulti', async () => {
        const state1 = new Oep8State(address1, address2, 4, '4');
        const state2 = new Oep8State(address1, address3, 4, '5');
        const tx = oep8.makeApproveMulti([state1, state2], gasPrice, gasLimit, address2);
        signTransaction(tx, private2); // payer's signature
        addSign(tx, private1); // sender's signature
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        expect(res.Result.State).toEqual(1);
    });

    test('test_transferFromMulti', async () => {
        const tf1 = new TransferFrom(address2, address1, address2, 4, '4');
        const tf2 = new TransferFrom(address3, address1, address3, 4, '5');
        const tx = oep8.makeTransferFromMulti([tf1, tf2], gasPrice, gasLimit, address3);
        signTransaction(tx, private3);
        addSign(tx, private2); // spender1
        addSign(tx, private2); // spender2
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        expect(res.Result.State).toEqual(1);
    });


    test('test_compound', async () => {
        const tx = oep8.makeCompoundTx(address1, 100000, gasPrice, gasLimit, address1);
        signTransaction(tx, private1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        /*
{"Action":"Notify","Desc":"SUCCESS","Error":0,"Result":{"TxHash":"1a2186eac5bdf214706c71cf3e889a1141c3fd76a70d261e5de2e931554e3482","State":1,"GasConsumed":0,"Notify":[{"Contra
ctAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","01","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","02","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","03","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","04","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","05","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","06","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98","States":["7472616e73666572","aa6e06c79f864152ab7f3139074aad822ffea855","00","07","04"]},{"ContractAddress":"c411141fa6ec39a34aac291dbec5c1622eb5ae98",
"States":["7472616e73666572","00","aa6e06c79f864152ab7f3139074aad822ffea855","08","04"]}]},"Version":"1.0.0"}
        */
        expect(res.Result.State).toEqual(1);
        const compoundResult = res.Result.Notify[7];
        const compoundedNum = compoundResult.States[4] ? parseInt(compoundResult.States[4], 16) : 0;
        expect(compoundedNum).toBeGreaterThan(0);
    });
});
