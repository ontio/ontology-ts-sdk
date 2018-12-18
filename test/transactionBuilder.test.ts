import { Address, PrivateKey } from '../src/crypto';
import RestClient from '../src/network/rest/restClient';
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
import { makeTransactionByJson } from '../src/transaction/transactionBuilder';
import { signTransaction } from './../src/transaction/transactionBuilder';

describe('test AbiInfo', () => {

    test('makeTransactionByJson', async () => {
        const private2 = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');
        const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');
        const restClient = new RestClient();
        const json = {
            action: 'invoke',
            params: {
                login: true,
                message: 'invoke smart contract test',
                invokeConfig: {
                    contractHash: 'cd948340ffcf11d4f5494140c93885583110f3e9',
                    functions: [{
                        operation: 'transferNativeAsset',
                        args: [{
                            name: 'arg0',
                            value: 'String:ont'
                        }, {
                            name: 'arg1',
                            value: 'Address:AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX'
                        }, {
                            name: 'arg2',
                            value: 'Address:AecaeSEBkt5GcBCxwz1F41TvdjX3dnKBkJ'
                        }, {
                            name: 'arg3',
                            value: 10
                        }]
                    }],
                    gasLimit: 20000,
                    gasPrice: 500,
                    payer: 'AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX'
                }
            }
        };
        const txs = makeTransactionByJson(json);
        signTransaction(txs[0], private2);
        const res = await restClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
    });
});
