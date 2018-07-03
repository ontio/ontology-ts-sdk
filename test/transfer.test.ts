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
import { makeQueryAllowanceTx, makeQueryBalanceTx,
    makeTransferTx, makeWithdrawOngTx, ONG_CONTRACT, ONT_CONTRACT
} from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import { State } from '../src/smartcontract/nativevm/token';
import { Transaction } from '../src/transaction/transaction';
import { addSign, buildRestfulParam, buildRpcParam, buildTxParam } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
import { ab2hexstring, generateRandomArray, isBase64, num2hexstring, str2hexstr, StringReader } from '../src/utils';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';

const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

const pri = new PrivateKey('75de8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf');
const pub = pri.getPublicKey();
const addr = Address.fromPubKey(pub);
// tslint:disable-next-line:no-console
// console.log('addr : ' + addr.toBase58());

const accountFrom = {
    // testnet
    // hexAddress: '018f0dcf09ec2f0040e6e8d7e54635dba40f7d63',
    // address: 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE',
    // privateKey: '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'
    privateKey: new PrivateKey('75de8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf'),
    address: new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve')
    // address: 'TA98LCZuzins3mUPfDyNRirpQ4YoeRNBan',
    // privateKey: '6248eefef096ec2eebdff7179a59cc36b5c632720e40fb7e9770dc11024543be'
};

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

// tslint:disable:no-console
const accPrivateKey = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419');
const accAddress = 'TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf';
const accHexAddress = '012845c2ed3b508d135066dba00f850a82b192fd';

// tslint:disable:max-line-length
const w = [{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AXmQDzzvpEtPkNwBEFsREzApTTDZFW6frD', 'enc-alg': 'aes-256-gcm', 'key': 'YfOr9im4rOciy3cV7JkVo9QCfrRT4IGLa/CZKUJfL29pM6Zi1oVEM67+8MezMIro', 'algorithm': 'ECDSA', 'salt': 'RCIo60eCJAwzkTYmIfp3GA==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '037c9e6c6a446b6b296f89b722cbf686b81e0a122444ef05f0f87096777663284b', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AY5W6p4jHeZG2jjW6nS1p4KDUhcqLkU6jz', 'enc-alg': 'aes-256-gcm', 'key': 'gpgMejEHzawuXG+ghLkZ8/cQsOJcs4BsFgFjSaqE7SC8zob8hqc6cDNhJI/NBkk+', 'algorithm': 'ECDSA', 'salt': 'tuLGZOimilSnypT91WrenQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03dff4c63267ae5e23da44ace1bc47d0da1eb8d36fd71181dcccf0e872cb7b31fa', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'ALZVrZrFqoSvqyi38n7mpPoeDp7DMtZ9b6', 'enc-alg': 'aes-256-gcm', 'key': 'guffI05Eafq9F0j3/eQxHWGo1VN/xpeIkXysEPeH51C2YHYCNnCWTWAdqDB7lonl', 'algorithm': 'ECDSA', 'salt': 'oZPg+5YotRWStVsRMYlhfg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '0205bc592aa9121428c4144fcd669ece1fa73fee440616c75624967f83fb881050', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AMogjmLf2QohTcGST7niV75ekZfj44SKme', 'enc-alg': 'aes-256-gcm', 'key': 'fAknSuXzMMC0nJ2+YuTpTLs6Hl5Dc0c2zHZBd2Q7vCuv8Wt97uYz1IU0t+AtrWts', 'algorithm': 'ECDSA', 'salt': '0BVIiUf46rb/e5dVZIwfrg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '030a34dcb075d144df1f65757b85acaf053395bb47b019970607d2d1cdd222525c', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AZzQTkZvjy7ih9gjvwU8KYiZZyNoy6jE9p', 'enc-alg': 'aes-256-gcm', 'key': 'IufXVQfrL3LI7g2Q7dmmsdoF7BdoI/vHIsXAxd4qkqlkGBYj3pcWHoQgdCF+iVOv', 'algorithm': 'ECDSA', 'salt': 'zUtzh0B4UW0wokzL+ILdeg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '021844159f97d81da71da52f84e8451ee573c83b296ff2446387b292e44fba5c98', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AKEqQKmxCsjWJz8LPGryXzb6nN5fkK1WDY', 'enc-alg': 'aes-256-gcm', 'key': 'PYEJ1c79aR7bxdzvBlj3lUMLp0VLKQHwSe+/OS1++1qa++gBMJJmJWJXUP5ZNhUs', 'algorithm': 'ECDSA', 'salt': 'uJhjsfcouCGZQUdHO2TZZQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '020cc76feb375d6ea8ec9ff653bab18b6bbc815610cecc76e702b43d356f885835', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AQNpGWz4oHHFBejtBbakeR43DHfen7cm8L', 'enc-alg': 'aes-256-gcm', 'key': 'ZG/SfHRArUkopwhQS1MW+a0fvQvyN1NnwonU0oZH8y1bGqo5T+dQz3rz1qsXqFI2', 'algorithm': 'ECDSA', 'salt': '6qiU9bgK/+1T2V8l14mszg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03aa4d52b200fd91ca12deff46505c4608a0f66d28d9ae68a342c8a8c1266de0f9', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' }
];
const testTransferFromMultiSignAddress = () => {
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
    const mulAddr = Address.fromMultiPubKeys(5, pks);
    console.log('mulAddr: ' + mulAddr.toBase58());
    console.log('pris: ' + JSON.stringify(pris));
    const payer = new Address(w[0].accounts[0].address);
    const tx = makeTransferTx('ONT', mulAddr,
        new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve'), 100, '0', '300000', payer);
    const multiPri = [pris[0], pris[1], pris[2], pris[3], pris[4]];
    for (const p of multiPri) {
        signTx(tx, 5, pks, p);
    }
    addSign(tx, pris[0]);
    const param = buildTxParam(tx);
    console.log(tx.serialize());
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);
};

const  testTransferTx = () => {
    // const params = {
    //     cost: 16384,
    //     blockSize: 8,
    //     parallel: 8,
    //     size: 64
    // };
    // const encPri = new PrivateKey('S5Y5DnUF4YB+pMBswO/NEQcguBwoBXjL/N9179rvahvYSfYD7EgNYjmro0vI3L6y');
    // const password = '123456';
    // const pk = PublicKey.deserializeHex(
    //     new StringReader('03001c6455aa8e209a5c8cd63b32a8b321b2b3d6c0153159c64fba73ec8363827d'));

    // const address = new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP');
    // const salt = Buffer.from('q0uJFA3mLo0g0VMH9r1fFA==', 'base64').toString('hex');
    // const pri = encPri.decrypt(password, address, salt, params);
    const sm2PriEnc = new PrivateKey(sm2Account.key, KeyType.SM2, new KeyParameters(CurveLabel.SM2P256V1));
    const sm2Pri = sm2PriEnc.decrypt('123456', new Address(sm2Account.address), sm2Account.salt);
    console.log('pri: ' + sm2Pri.key);
    const gasLimit = '300000';
    const gasPrice = '0';
    const tx = makeTransferTx('ONT', new Address('ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc'),
        new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP'), 100, gasPrice, gasLimit);
    signTransaction(tx, sm2Pri, SignatureScheme.SM2withSM3);
    // signTransaction(tx, pri);
    console.log('sigs: ' + JSON.stringify(tx.sigs));
    // const signTest = sm2Pri.sign(str2hexstr('test'), SignatureScheme.SM2withSM3).serializeHex();
    // console.log('sigTest: ' + signTest);
    // var tx = makeTransferTransaction('ONT', accountFrom.hexAddress,
    // '01716379e393d1a540615e022ede47b97e0577c6', value,
    // accountFrom.privateKey)
    // var tx = makeTransferTransaction('ONT', accHexAddress, accountToHexAddress, value, accPrivateKey)
    const param = buildTxParam(tx);
    console.log(tx.serialize());
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    // txSender.sendTxWithSocket(param, callback);

    // let param = buildTxParam(tx)
    // var callback = function(err, res, socket) {
    //     console.log('res : '+JSON.stringify(res))
    // }
    txSender.sendTxWithSocket(param, callback);

};

// tslint:disable-next-line:no-shadowed-variable
const testGetBalance = (address, addressName) => {
    const request = `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.getBalance}/${address}`;
    axios.get(request).then((res) => {
        const result = res.data.Result;
        // console.log(result)
        // result.ont = new BigNumber(result.ont).multipliedBy(1e-8).toNumber()
        // result.ong = new BigNumber(result.ong).multipliedBy(1e-8).toNumber()

        console.log(addressName + ' Get balance:' + JSON.stringify(result));
    }).catch((err) => {
        console.log(err);
    });
};

// 1202023cd636327150065fb4d3b354bd48ace5e402904f6f28f39f2fe22cd642986d9c
// c62bbce37fc96c90e2eea6de474b0031e560ef3630d2f6efe275f16f85ed1543

const userPri = new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67317f');
const userPk = userPri.getPublicKey();
const userAddr = Address.fromPubKey(userPk);

// tslint:disable-next-line:no-shadowed-variable
const testGetUnclaimedOng = (address) => {
    const restClient = new RestClient();
    restClient.getAllowance('ong', new Address(ONT_CONTRACT), address).then( (res) => {
        console.log(res);
    });
};

// tslint:disable-next-line:no-shadowed-variable
const testQueryAllowance = (from, to) => {
    const tx = makeQueryAllowanceTx('ong', from, to);
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
        console.log(res);
    });
};

const testClaimOng = () => {
    // const pri = userPri;
    // const hexAddress = userAddr;
    // console.log(hexAddress);
    const gasPrice = '0';
    const gasLimit = '30000';
    // const address = accountFrom.address;
    // const params = {
    //     cost: 16384,
    //     blockSize: 8,
    //     parallel: 8,
    //     size: 64
    // };
    // const encPri = new PrivateKey('S5Y5DnUF4YB+pMBswO/NEQcguBwoBXjL/N9179rvahvYSfYD7EgNYjmro0vI3L6y');
    // const password = '123456';
    // const pk = PublicKey.deserializeHex(
    //     new StringReader('03001c6455aa8e209a5c8cd63b32a8b321b2b3d6c0153159c64fba73ec8363827d'));
    // const address = new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP');
    // const salt = Buffer.from('q0uJFA3mLo0g0VMH9r1fFA==', 'base64').toString('hex');
    // const pri = encPri.decrypt(password, address, salt, params);
    const tx = makeWithdrawOngTx(address, address, 23792995720000, address, gasPrice, gasLimit);
    signTransaction(tx, pri);
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize()).then( (res) => {
        console.log(res.Result);
        const txhash = res.Result;
        // restClient.getSmartCodeEvent(txhash).then((resp) => {
        //     console.log('resp: ' + JSON.stringify(resp));
        // });

        setTimeout( () => {
            restClient.getSmartCodeEvent(txhash).then((respon) => {
                console.log('respon: ' + JSON.stringify(respon));
            });
        }, 6000);
    });
    // tslint:disable:no-console
    console.log(tx.serialize());
    const param = buildTxParam(tx);
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    // txSender.sendTxWithSocket(param, callback);
};

const pri1 = new PrivateKey('c19f16785b8f3543bbaf5e1dbb5d398dfa6c85aaad54fc9d71203ce83e505c07');
const address1 = new Address('TA4WVfUB1ipHL8s3PRSYgeV1HhAU3KcKTq');
const pri2 = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419');
const address2 = new Address('TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf');

const pri3 = new PrivateKey('a53213c27eb1de0796b9d0b44c96e7e30228f1466d8657c47b471a4700777c0c');
const address3 = new Address('01716379e393d1a540615e022ede47b97e0577c6');
// console.log('pk: ' + pri3.getPublicKey().serializeHex());

// const testTransferFromMany = () => {

//     const tx = makeTransferFromManyTx('ONT', [address1, address2], address3, ['100', '200'], '0', '30000');
//     const pris = [ [pri1], [pri2]];
//     signTx(tx, pris);
//     const param = buildTxParam(tx);
//     const callback = (err, res, socket) => {
//         console.log('res : ' + JSON.stringify(res));
//     };
//     txSender.sendTxWithSocket(param, callback);
// };

// const testTransferToMany = () => {
//     const tx = makeTransferToMany('ONT', address1, [address2, address3], ['100', '200'], '0', '30000');
//     signTransaction(tx, pri1);
//     const param = buildTxParam(tx);
//     const callback = (err, res, socket) => {
//         console.log('res : ' + JSON.stringify(res));
//     };
//     txSender.sendTxWithSocket(param, callback);
// };

// tslint:disable-next-line:no-shadowed-variable
const testQueryBalance = (asset, address: Address) => {
    // const address = new Address('TJuDPBCkzdrLx4jkiZWPhNdEjc8nwK5QTh');

    const tx = makeQueryBalanceTx(asset, address);
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
        console.log('res: ' + JSON.stringify(res));
        const value = parseInt(res.Result.Result, 16);
        console.log('queryBalance result: ' + value);
    });
};

// testTransferTx();

// const add = u160ToAddress('01716379e393d1a540615e022ede47b97e0577c6');
testGetBalance('ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc', '');

// testClaimOng();

// testTransferFromMany()

// testTransferToMany()

// const from = new Address('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL');
// testGetUnclaimedOng(accountFrom.address);

// testQueryAllowance(from, from);
const address = new Address('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL');
// testQueryBalance('ong', address);

// console.log('add: ' + new Address('TAsW5tthjNBX4FG6ifGMTAswCBdB2YWGaG').serialize());

// testTransferFromMultiSignAddress();

// AZW8eBkXh5qgRjmeZjqY2KFGLXhKcX4i2Y // yes
// AJNFkMEcPn4Dcg2qZ6MuiGrW4G2kgxTdPw // no
