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

import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { RestClient, WebsocketClient } from '../src/index';
import Nep5TxBuilder from '../src/smartcontract/neovm/nep5TxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';
import { hexstr2str, reverseHex } from '../src/utils';
import { Address } from './../src/crypto/address';

describe('test nep5', () => {
    const private1 = new PrivateKey('523c5fcf74823831756f0bcb3634234f10b3beb1c05595058534577752ad2d9f');
    const private2 = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');
    const private3 = new PrivateKey('1094e90dd7c4fdfd849c14798d725ac351ae0d924b29a279a9ffa77d5737bd96');

    const account1 = Account.create(private1, '123456', 'Account1'); // ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6
    const account2 = Account.create(private2, '123456', 'Account2'); // AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX
    const account3 = Account.create(private3, '123456', 'Account3'); // AVXf5w8WD2y6jV1Lzi36oSKYNif1C7Surc
    console.log(account1.address.toBase58());
    console.log(account2.address.toBase58());
    console.log(account3.address.toBase58());

    const codeHash = 'cacbaf1024af9eb19f981c084548df14510d85ae';

    const contractAddr = new Address(reverseHex(codeHash));
    const gasPrice = '500';
    const gasLimit = '30000';
    const restClient = new RestClient('http://127.0.0.1:20334');
    const socketClient = new WebsocketClient('http://127.0.0.1:20335');


    test('test_init', async () => {
        const tx = Nep5TxBuilder.init(contractAddr, gasPrice, gasLimit, account1.address);
        signTransaction(tx, private1);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });

    test('test_queryBalance', async () => {
        const tx = Nep5TxBuilder.queryBalanceOf(contractAddr, account1.address);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = parseInt(reverseHex(res.Result.Result), 16);
        // tslint:disable-next-line:no-console
        console.log(val);
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_transfer', async () => {
        const tx = Nep5TxBuilder.makeTransferTx(contractAddr, account2.address, account1.address,
            1000000000, gasPrice, gasLimit, account2.address);
        signTransaction(tx, private2);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
        // const response = await restClient.sendRawTransaction(tx.serialize());
        // console.log(response);
        // expect(response.Error).toEqual(0);
    }, 10000);

    test('test_totalSupply', async () => {
        const tx = Nep5TxBuilder.queryTotalSupply(contractAddr);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const val = parseInt(reverseHex(res.Result.Result), 16);
        // tslint:disable-next-line:no-console
        expect(val).toBeGreaterThan(0);
    }, 10000);

    test('test_name', async () => {
        const tx = Nep5TxBuilder.queryName(contractAddr);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val =  hexstr2str(res.Result.Result);
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toEqual('CPX Token');
    }, 10000);

    test('test_symbol', async () => {
        const tx = Nep5TxBuilder.querySymbol(contractAddr);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const val = hexstr2str(res.Result.Result);
        // tslint:disable-next-line:no-console
        console.log(val);
        expect(val).toEqual('CPX');
    });

    test('test_decimals', async () => {
        const tx = Nep5TxBuilder.queryDecimals(contractAddr);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const val = res.Result;
        console.log(val);
        // tslint:disable-next-line:no-console
        expect(val).toBeTruthy();
    }, 10000);

});
