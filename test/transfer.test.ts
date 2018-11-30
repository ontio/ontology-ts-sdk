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
import { BigNumber } from 'bignumber.js';
import { Account } from '../src/account';
import BigInt from '../src/common/bigInt';
import Fixed64 from '../src/common/fixed64';
import { HTTP_REST_PORT, ONT_NETWORK, REST_API, TEST_NODE, TEST_ONT_URL } from '../src/consts';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey } from '../src/crypto';
import { PublicKey } from '../src/crypto/PublicKey';
import { SignatureScheme } from '../src/crypto/SignatureScheme';
import RestClient from '../src/network/rest/restClient';
import RpcClient from '../src/network/rpc/rpcClient';
import * as scrypt from '../src/scrypt';
import { deserializeTransferTx, makeQueryAllowanceTx,
    makeQueryBalanceTx, makeTransferTx, makeWithdrawOngTx, ONG_CONTRACT, ONT_CONTRACT
} from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import { State } from '../src/smartcontract/nativevm/token';
import { Transaction } from '../src/transaction/transaction';
import { addSign, buildRestfulParam, buildRpcParam, buildTxParam } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
// tslint:disable-next-line:max-line-length
import { ab2hexstring, generateRandomArray, isBase64, num2hexstring, reverseHex, str2hexstr, StringReader } from '../src/utils';
import { WebsocketClient } from './../src/network/websocket/websocketClient';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';
import { comparePublicKeys } from '../src/transaction/program';

describe('test transfer asset', () => {
    const socketClient = new WebsocketClient('ws://polaris1.ont.io:20335');
    const restClient = new RestClient('http://polaris1.ont.io:20334');
    const gasLimit = '20000';
    const gasPrice = '500';
    const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');

    const sm2Account = {
        'address': 'ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc',
        'label': 'sm2Account',
        'lock': false,
        'algorithm': 'SM2',
        'parameters': { curve: 'sm2p256v1' },
        'key': 'jQUCWPZZN1tN0ghtsYHuLZoBGdFfUaRaofKSHEYctMIKLdN3Otv52Oi9d3ujNW2p',
        'enc-alg': 'aes-256-gcm',
        'salt': 'jn+zIuiOC5lrn+vrySF1Lw==',
        'isDefault': false,
        'publicKey': '1314031220580679fda524f575ac48b39b9f74cb0a97993df4fac5798b04c702d07a39',
        'signatureScheme': 'SM3withSM2'
    };
    test('test_transfer_asset_ONT', async () => {
        const from = adminAddress;
        const to = new Address('AH9B261xeBXdKH4jPyafcHcLkS2EKETbUj');
        const tx = makeTransferTx('ONT', from, to, 17, gasPrice, gasLimit);
        signTransaction(tx, adminPrivateKey);
        console.log(tx.payload.serialize());
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);
    
    test('test_transfer_asset_ONG', async () => {
        const from = adminAddress;
        const to = new Address('AH9B261xeBXdKH4jPyafcHcLkS2EKETbUj');
        const tx = makeTransferTx('ONG', from, to, 1.23 * 1e9, gasPrice, gasLimit);
        signTransaction(tx, adminPrivateKey);
        console.log(tx.payload.serialize());
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);

    test('test get balance', async () => {
        const to = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');
        const result = await restClient.getBalance(to);
        console.log(result);
        expect(result).toBeTruthy();
    }, 10000);

    test('test transfer assets with sm2 account', async () => {
        const sm2PriEnc = new PrivateKey(sm2Account.key, KeyType.SM2, new KeyParameters(CurveLabel.SM2P256V1));
        const sm2Pri = sm2PriEnc.decrypt('123456', new Address(sm2Account.address), sm2Account.salt);
        console.log('pri: ' + sm2Pri.key);
        const tx = makeTransferTx('ONT', new Address('ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc'),
            new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP'), 100, gasPrice, gasLimit);
        signTransaction(tx, sm2Pri, SignatureScheme.SM2withSM3);
        const result = await restClient.sendRawTransaction(tx.serialize());
        expect(result.Error).toEqual(0);
    }, 10000);

    test('test transfer with multi assign address', async () => {
        // tslint:disable:max-line-length
        const w = [{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AXmQDzzvpEtPkNwBEFsREzApTTDZFW6frD', 'enc-alg': 'aes-256-gcm', 'key': 'YfOr9im4rOciy3cV7JkVo9QCfrRT4IGLa/CZKUJfL29pM6Zi1oVEM67+8MezMIro', 'algorithm': 'ECDSA', 'salt': 'RCIo60eCJAwzkTYmIfp3GA==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '037c9e6c6a446b6b296f89b722cbf686b81e0a122444ef05f0f87096777663284b', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AY5W6p4jHeZG2jjW6nS1p4KDUhcqLkU6jz', 'enc-alg': 'aes-256-gcm', 'key': 'gpgMejEHzawuXG+ghLkZ8/cQsOJcs4BsFgFjSaqE7SC8zob8hqc6cDNhJI/NBkk+', 'algorithm': 'ECDSA', 'salt': 'tuLGZOimilSnypT91WrenQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03dff4c63267ae5e23da44ace1bc47d0da1eb8d36fd71181dcccf0e872cb7b31fa', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'ALZVrZrFqoSvqyi38n7mpPoeDp7DMtZ9b6', 'enc-alg': 'aes-256-gcm', 'key': 'guffI05Eafq9F0j3/eQxHWGo1VN/xpeIkXysEPeH51C2YHYCNnCWTWAdqDB7lonl', 'algorithm': 'ECDSA', 'salt': 'oZPg+5YotRWStVsRMYlhfg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '0205bc592aa9121428c4144fcd669ece1fa73fee440616c75624967f83fb881050', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AMogjmLf2QohTcGST7niV75ekZfj44SKme', 'enc-alg': 'aes-256-gcm', 'key': 'fAknSuXzMMC0nJ2+YuTpTLs6Hl5Dc0c2zHZBd2Q7vCuv8Wt97uYz1IU0t+AtrWts', 'algorithm': 'ECDSA', 'salt': '0BVIiUf46rb/e5dVZIwfrg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '030a34dcb075d144df1f65757b85acaf053395bb47b019970607d2d1cdd222525c', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AZzQTkZvjy7ih9gjvwU8KYiZZyNoy6jE9p', 'enc-alg': 'aes-256-gcm', 'key': 'IufXVQfrL3LI7g2Q7dmmsdoF7BdoI/vHIsXAxd4qkqlkGBYj3pcWHoQgdCF+iVOv', 'algorithm': 'ECDSA', 'salt': 'zUtzh0B4UW0wokzL+ILdeg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '021844159f97d81da71da52f84e8451ee573c83b296ff2446387b292e44fba5c98', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AKEqQKmxCsjWJz8LPGryXzb6nN5fkK1WDY', 'enc-alg': 'aes-256-gcm', 'key': 'PYEJ1c79aR7bxdzvBlj3lUMLp0VLKQHwSe+/OS1++1qa++gBMJJmJWJXUP5ZNhUs', 'algorithm': 'ECDSA', 'salt': 'uJhjsfcouCGZQUdHO2TZZQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '020cc76feb375d6ea8ec9ff653bab18b6bbc815610cecc76e702b43d356f885835', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AQNpGWz4oHHFBejtBbakeR43DHfen7cm8L', 'enc-alg': 'aes-256-gcm', 'key': 'ZG/SfHRArUkopwhQS1MW+a0fvQvyN1NnwonU0oZH8y1bGqo5T+dQz3rz1qsXqFI2', 'algorithm': 'ECDSA', 'salt': '6qiU9bgK/+1T2V8l14mszg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03aa4d52b200fd91ca12deff46505c4608a0f66d28d9ae68a342c8a8c1266de0f9', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' }
        ];
        const params = {
            cost: 16384,
            blockSize: 8,
            parallel: 8,
            size: 64
        };
        const pks = [];
        const pris = [];
        for (const v of w) {
            pks.push(new PublicKey(v.accounts[0].publicKey));
            const p = new PrivateKey(v.accounts[0].key);
            pris.push(p.decrypt('1', new Address(v.accounts[0].address), v.accounts[0].salt, params));
        }

        const mulAddr = Address.fromMultiPubKeys(2, [pks[0], pks[1]]);
        console.log('mulAddr: ' + mulAddr.toBase58());
        const tx = makeTransferTx('ONT', mulAddr,
            new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve'), 100, gasPrice, gasLimit, mulAddr);
        const multiPri = [pris[0], pris[1]];
        for (const p of multiPri) {
            signTx(tx, 2, [pks[0], pks[1]], p);
        }
        console.log('tx:' + JSON.stringify(tx));
        const result = await restClient.sendRawTransaction(tx.serialize());
        console.log(result);

        // const mulAddr = Address.fromMultiPubKeys(5, pks);
        // console.log('mulAddr: ' + mulAddr.toBase58());
        // // console.log('pris: ' + JSON.stringify(pris));
        // const payer = mulAddr;
        // const tx = makeTransferTx('ONT', mulAddr,
        //     new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve'), 100, gasPrice, gasLimit, payer);
        // const multiPri = [pris[0], pris[1], pris[2], pris[3], pris[4]];
        // for (const p of multiPri) {
        //     signTx(tx, 5, pks, p);
        // }
        // console.log('tx:' + JSON.stringify(tx));
        // const result = await restClient.sendRawTransaction(tx.serialize());
        // console.log(result);
        // expect(result.Error).toEqual(0);
    }, 10000);

    test('test get allowance with tx', async () => {
        const from = adminAddress;
        const to = new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP');
        const tx = makeQueryAllowanceTx('ong', new Address(ONT_CONTRACT), from);
        const result = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(result);
        if (result.Result) {
            const num = parseInt(reverseHex(result.Result.Result), 16);
            console.log(num);
        }
        expect(result).toBeTruthy();
    }, 10000);

    test('test get ongs to withdraw with rest api', async () => {
        const addr = adminAddress;
        const result = await restClient.getAllowance('ong', new Address(ONT_CONTRACT), addr);
        console.log(result);
        expect(result).toBeTruthy();
    }, 10000);

    test('test withdraw ong', async () => {
        const address = adminAddress;
        const amount = 1 * 1e9; // multiply 1e9 to set the precision
        const tx = makeWithdrawOngTx(address, address, amount, address, gasPrice, gasLimit);
        signTransaction(tx, adminPrivateKey);
        const result = await restClient.sendRawTransaction(tx.serialize());
        console.log(result);
        expect(result).toBeTruthy();
    }, 10000);

    test('test amount number', () => {
        const expectAmount = '90071992547409911';
        const from = new Address('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        const to = new Address('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        const tx = makeTransferTx('ONG', from, to, expectAmount, '500', '30000');

        const transferAmount = deserializeTransferTx(tx.serialize()).amount;
        console.log('Expected Amount', expectAmount);
        console.log('Transfer Amount', transferAmount);
        expect(transferAmount).toEqual(expectAmount);
    });

    test('sort_pk', () => {
        const pk1 = new PublicKey('03a3c7a40461238a210d306ce4a79db69800449173e47b9e2fa92b7815d7517872');
        const pk2 = new PublicKey('023c5b6e0e4fe8647d1065ecd09c60d251e1e168999202423e3be5d174866f9349');
        const pks = [pk1, pk2];
        console.log(pks);
        const add1 = Address.fromMultiPubKeys(2, [pk1, pk2]);
        console.log('add1: ' + add1.toBase58());
        pks.sort(comparePublicKeys);
        console.log(pks);
        const add2 = Address.fromMultiPubKeys(2, [pk2, pk1]);
        console.log('add2: ' + add2.toBase58());
    });
});
