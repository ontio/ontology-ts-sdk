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
import { Account, DDO, Identity } from '../../src';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey } from '../../src/crypto';
import RestClient from '../../src/network/rest/restClient';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import { Parameter, ParameterType } from '../../src/smartcontract/abi/parameter';
import { Transaction } from '../../src/transaction/transaction';
import { addSign, makeInvokeTransaction, makeTransactionsByJson } from '../../src/transaction/transactionBuilder';
import { signTransaction } from '../../src/transaction/transactionBuilder';
import { reverseHex } from '../../src/utils';
import {TEST_ONT_URL_1, TEST_ONT_URL_2} from "../../src/consts";

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
                            value: 1000000000
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

        const raw = '00d16009495df401000000000000204e000000000000aa6e06c79f864152ab7f3139074aad822ffea8555e0400ca9a3b14fa88f5244be19659bbd24477caeeacac7cbf781b14aa6e06c79f864152ab7f3139074aad822ffea855036f6e7454c1137472616e736665724e6174697665417373657467e9f31031588538c9404149f5d411cfff408394cd0001414043443452de4b5374af440118b0a0c9f25fc31324ea23e9c5754fa335cfac776a795893d3accb6386a8d54ef616b2c9ead411704e3328a3e124584be8b174e5de232102df6f28e327352a44720f2b384e55034c1a7f54ba31785aa3a338f613a5b7cc26ac';
        const expectedTx = Transaction.deserialize(raw);
        const match = txs[0].payload.code === expectedTx.payload.code;
        expect(match).toEqual(false);

        const res = await restClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
    });

    test('makeTransactionByJsonLedgerIncompatible', async () => {
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
                            value: 1000000000
                        }]
                    }],
                    gasLimit: 20000,
                    gasPrice: 500,
                    payer: 'AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX'
                }
            }
        };
        const txs = makeTransactionsByJson(json, false);
        signTransaction(txs[0], private2);

        const raw = '00d16009495df401000000000000204e000000000000aa6e06c79f864152ab7f3139074aad822ffea8555e0400ca9a3b14fa88f5244be19659bbd24477caeeacac7cbf781b14aa6e06c79f864152ab7f3139074aad822ffea855036f6e7454c1137472616e736665724e6174697665417373657467e9f31031588538c9404149f5d411cfff408394cd0001414043443452de4b5374af440118b0a0c9f25fc31324ea23e9c5754fa335cfac776a795893d3accb6386a8d54ef616b2c9ead411704e3328a3e124584be8b174e5de232102df6f28e327352a44720f2b384e55034c1a7f54ba31785aa3a338f613a5b7cc26ac';
        const expectedTx = Transaction.deserialize(raw);
        const match = txs[0].payload.code === expectedTx.payload.code;
        expect(match).toEqual(true);

        const res = await restClient.sendRawTransaction(txs[0].serialize(), false);
        console.log(res);
    });

    test('makeInvokeTransaction', async () => {
        const privateKey = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');
        const address = 'AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX';

        const addressParam1 = new Address(address);
        const addressParam2 = new Address('AecaeSEBkt5GcBCxwz1F41TvdjX3dnKBkJ');

        const param = new Parameter('arg0', ParameterType.String, 'ont');
        const param2 = new Parameter('arg1', ParameterType.ByteArray, addressParam1.serialize());
        const param3 = new Parameter('arg2', ParameterType.ByteArray, addressParam2.serialize());
        const param4 = new Parameter('arg3', ParameterType.Integer, 1000000000);

        const args = [param, param2, param3, param4];

        const contractHash = 'cd948340ffcf11d4f5494140c93885583110f3e9';
        const contractAddr = new Address(reverseHex(contractHash));

        const tx = makeInvokeTransaction('transferNativeAsset', args, contractAddr, 500, 20000, addressParam1);
        const tx2 = makeInvokeTransaction('transferNativeAsset', args, contractAddr, 500, 20000, addressParam1, false);

        signTransaction(tx, privateKey);
        signTransaction(tx2, privateKey);

        const raw = '00d16009495df401000000000000204e000000000000aa6e06c79f864152ab7f3139074aad822ffea8555e0400ca9a3b14fa88f5244be19659bbd24477caeeacac7cbf781b14aa6e06c79f864152ab7f3139074aad822ffea855036f6e7454c1137472616e736665724e6174697665417373657467e9f31031588538c9404149f5d411cfff408394cd0001414043443452de4b5374af440118b0a0c9f25fc31324ea23e9c5754fa335cfac776a795893d3accb6386a8d54ef616b2c9ead411704e3328a3e124584be8b174e5de232102df6f28e327352a44720f2b384e55034c1a7f54ba31785aa3a338f613a5b7cc26ac';
        const expectedTx = Transaction.deserialize(raw);
        const match = tx.payload.code === expectedTx.payload.code;
        expect(match).toEqual(false);

        const match2 = tx2.payload.code === expectedTx.payload.code;
        expect(match2).toEqual(true);
    });

    test('makeTxFromJSON_transferONG', async () => {
        const socketClient = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL);
        const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
        const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        // tslint:disable:align
        const json = {
            action: 'invoke',
            version: 'v1.0.0',
            id: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
            params: {
                invokeConfig: {
                    contractHash: '0200000000000000000000000000000000000000',
                    functions: [{
                        operation: 'transfer',
                        args: [{
                            name: 'arg0-from',
                            value: 'Address:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz'
                        },
                        {
                            name: 'arg1-to',
                            value: 'Address:AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX'
                        },
                        {
                            name: 'arg2-amount',
                            value: 'Long:1000000000'
                        }
                        ]
                    }],
                    payer: 'AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz',
                    gasLimit: 20000,
                    gasPrice: 2500
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
        const socketClient = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL);
        const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
        const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        const privateKey = PrivateKey.random(
            KeyType.ECDSA,
            new KeyParameters(CurveLabel.SECP256R1)
        );
        const identity = Identity.create(
            privateKey,
            '123456',
            'test'
        );
        // tslint:disable:align
        const json = {
            action: 'invoke',
            version: 'v1.0.0',
            id: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
            params: {
                invokeConfig: {
                    contractHash: '0300000000000000000000000000000000000000',
                    functions: [{
                        operation: 'regIDWithPublicKey',
                        args: [
                            {
                                name: 'arg0-ontid',
                                value: 'String:' + identity.ontid
                            },
                            {
                                name: 'arg1-publickey',
                                value: 'ByteArray:' + privateKey.getPublicKey().key
                            }
                        ]
                    }],
                    payer: adminAddress.value,
                    gasLimit: 20000,
                    gasPrice: 2500
                }
            }
        };
        const txs = makeTransactionsByJson(json);
        signTransaction(txs[0], adminPrivateKey);
        addSign(txs[0], privateKey);
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
            action: 'invoke',
            version: 'v1.0.0',
            id: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
            params: {
                invokeConfig: {
                    contractHash: '0300000000000000000000000000000000000000',
                    functions: [{
                        operation: 'getDDO',
                        args: [{
                            name: 'arg0-ontid',
                            value: 'String:did:ont:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz'
                        }
                        ]
                    }],
                    payer: 'AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz',
                    gasLimit: 20000,
                    gasPrice: 2500
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
