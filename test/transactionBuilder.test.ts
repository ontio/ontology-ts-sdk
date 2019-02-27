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
import { Address, PrivateKey } from '../src/crypto';
import RestClient from '../src/network/rest/restClient';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { makeTransactionsByJson } from '../src/transaction/transactionBuilder';
import { signTransaction } from './../src/transaction/transactionBuilder';
import { DDO } from '../src';

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
        const txs = makeTransactionsByJson(json);
        signTransaction(txs[0], private2);
        const res = await restClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
    });

    test('makeTxFromJSON_transferONG', async () => {
        const socketClient = new WebsocketClient('ws://polaris1.ont.io:20335');
        const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
        const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        // tslint:disable:align
        const json = {
            "action": "invoke",
            "version": "v1.0.0",
            "id": "10ba038e-48da-487b-96e8-8d3b99b6d18a",
            "params": {
                "invokeConfig": {
                    "contractHash": "0200000000000000000000000000000000000000",
                    "functions": [{
                        "operation": "transfer",
                        "args": [{
                            "name": "arg0-from",
                            "value": "Address:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz"
                        },
                        {
                            "name": "arg1-to",
                            "value": "Address:AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX"
                        },
                        {
                            "name": "arg2-amount",
                            "value": "Long:1000000000"
                        }
                        ]
                    }],
                    "payer": "AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz",
                    "gasLimit": 20000,
                    "gasPrice": 500
                }
            }
        };
        const txs = makeTransactionsByJson(json);
        signTransaction(txs[0], adminPrivateKey);
        const res = await socketClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('makeTxFromJSON_regOntid', async () => {
        const socketClient = new WebsocketClient('ws://polaris1.ont.io:20335');
        const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
        const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        const pk = adminPrivateKey.getPublicKey().key;
        // tslint:disable:align
        const json = {
            "action": "invoke",
            "version": "v1.0.0",
            "id": "10ba038e-48da-487b-96e8-8d3b99b6d18a",
            "params": {
                "invokeConfig": {
                    "contractHash": "0300000000000000000000000000000000000000",
                    "functions": [{
                        "operation": "regIDWithPublicKey",
                        "args": [{
                            "name": "arg0-ontid",
                            "value": "String:did:ont:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz"
                        },
                        {
                            "name": "arg1-publickey",
                            "value": "ByteArray:" + pk
                        }
                        ]
                    }],
                    "payer": "AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz",
                    "gasLimit": 20000,
                    "gasPrice": 500
                }
            }
        };
        const txs = makeTransactionsByJson(json);
        signTransaction(txs[0], adminPrivateKey);
        const res = await socketClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('makeTxFromJSON_getDDO', async () => {
        const restClient = new RestClient();
        const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
        const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        const pk = adminPrivateKey.getPublicKey().key;
        // tslint:disable:align
        const json = {
            "action": "invoke",
            "version": "v1.0.0",
            "id": "10ba038e-48da-487b-96e8-8d3b99b6d18a",
            "params": {
                "invokeConfig": {
                    "contractHash": "0300000000000000000000000000000000000000",
                    "functions": [{
                        "operation": "getDDO",
                        "args": [{
                            "name": "arg0-ontid",
                            "value": "String:did:ont:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz"
                        }
                        ]
                    }],
                    "payer": "AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz",
                    "gasLimit": 20000,
                    "gasPrice": 500
                }
            }
        };
        const txs = makeTransactionsByJson(json);
        const res = await restClient.sendRawTransaction(txs[0].serialize(), true);
        const ddo = DDO.deserialize(res.Result.Result);
        console.log(ddo);
        expect(res.Error).toEqual(0);
    });

});
