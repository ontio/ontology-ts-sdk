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
import Fixed64 from '../src/common/fixed64';
import { HTTP_REST_PORT, ONT_NETWORK, REST_API, TEST_NODE, TEST_ONT_URL } from '../src/consts';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey } from '../src/crypto';
import RestClient from '../src/network/rest/restClient';
import RpcClient from '../src/network/rpc/rpcClient';
import * as scrypt from '../src/scrypt';
import { makeClaimOngTx, makeQueryAllowanceTx, makeTransferFromManyTx, makeTransferToMany,
    makeTransferTx, ONG_CONTRACT, ONT_CONTRACT, makeQueryBalanceTx
} from '../src/smartcontract/ontAssetTxBuilder';
import { State } from '../src/smartcontract/token';
import { Transaction } from '../src/transaction/transaction';
import { buildRestfulParam, buildRpcParam, buildTxParam } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
import { ab2hexstring, StringReader, generateRandomArray } from '../src/utils';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';
import { PublicKey } from '../src/crypto/PublicKey';

const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

const pri = new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67318f');
const pub = pri.getPublicKey();
const addr = Address.fromPubKey(pub);
console.log('addr : ' + addr.toBase58());

const accountFrom = {
    // testnet
    // hexAddress: '018f0dcf09ec2f0040e6e8d7e54635dba40f7d63',
    // address: 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE',
    // privateKey: '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'
    privateKey: new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67318f'),
    address: new Address('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL')
    // address: 'TA98LCZuzins3mUPfDyNRirpQ4YoeRNBan',
    // privateKey: '6248eefef096ec2eebdff7179a59cc36b5c632720e40fb7e9770dc11024543be'
};

const accPrivateKey = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419');
const accAddress = 'TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf';
const accHexAddress = '012845c2ed3b508d135066dba00f850a82b192fd';

const  testTransferTx = () => {
    const params = {
        cost: 16384,
        blockSize: 8,
        parallel: 8,
        size: 64
    };
    // const encPri = new PrivateKey('nLbO4KNV8GyO4Ihoj5qCobBczOsTvVWk1QqQ4zsu3aUmNyYxmga4cHgf0MJ3gM6M');
    // const password = '123456';
    // const pk = PublicKey.deserializeHex(
    //     new StringReader('12020213b91af30cba992aa24b232237af1093396dff9f252c3855dcf7129c517883f3'));
    // const addr = Address.fromPubKey(pk);
    // console.log('pk: ' + JSON.stringify(pk));
    // console.log('addr: ' + addr.toBase58());
    // const address = new Address('TJuDPBCkzdrLx4jkiZWPhNdEjc8nwK5QTh');
    // const salt = Buffer.from('aCLRjtYznvxaxte3qrHDNw==', 'base64').toString('hex');
    // const pri = encPri.decrypt(password, address, salt, params);

    const gasLimit = '300000';
    const gasPrice = '0';
    const tx = makeTransferTx('ONT', accountFrom.address,
        new Address('AWc6N2Yawk12Jt14F7sjGGos4nFc8UztVe'), 10000, gasPrice, gasLimit);
    signTransaction(tx, accountFrom.privateKey);
    // var tx = makeTransferTransaction('ONT', accountFrom.hexAddress,
    // '01716379e393d1a540615e022ede47b97e0577c6', value,
    // accountFrom.privateKey)
    // var tx = makeTransferTransaction('ONT', accHexAddress, accountToHexAddress, value, accPrivateKey)
    const param = buildTxParam(tx);
    // tslint:disable:no-console
    console.log(tx.serialize());
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);

    // let param = buildTxParam(tx)
    // var callback = function(err, res, socket) {
    //     console.log('res : '+JSON.stringify(res))
    // }
    // txSender.sendTxWithSocket(param, callback)

};

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

const testGetUnclaimedOng = (address) => {
    const restClient = new RestClient();
    restClient.getAllowance('ong', new Address(ONT_CONTRACT), address).then( (res) => {
        console.log(res);
    });
};

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

    const params = {
        cost: 16384,
        blockSize: 8,
        parallel: 8,
        size: 64
    };
    const encPri = new PrivateKey('nLbO4KNV8GyO4Ihoj5qCobBczOsTvVWk1QqQ4zsu3aUmNyYxmga4cHgf0MJ3gM6M');
    const password = '123456';
    const pk = PublicKey.deserializeHex(
        new StringReader('12020213b91af30cba992aa24b232237af1093396dff9f252c3855dcf7129c517883f3'));
    const address = new Address('TJuDPBCkzdrLx4jkiZWPhNdEjc8nwK5QTh');
    const salt = Buffer.from('aCLRjtYznvxaxte3qrHDNw==', 'base64').toString('hex');
    const pri = encPri.decrypt(password, address, salt, params);
    const tx = makeClaimOngTx(address, address, 10000, address, gasPrice, gasLimit);
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
console.log('pk: ' + pri3.getPublicKey().serializeHex());

const testTransferFromMany = () => {

    const tx = makeTransferFromManyTx('ONT', [address1, address2], address3, ['100', '200'], '0', '30000');
    const pris = [ [pri1], [pri2]];
    signTx(tx, pris);
    const param = buildTxParam(tx);
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);
};

const testTransferToMany = () => {
    const tx = makeTransferToMany('ONT', address1, [address2, address3], ['100', '200'], '0', '30000');
    signTransaction(tx, pri1);
    const param = buildTxParam(tx);
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);
};

const testQueryBalance = (asset, address:Address) => {
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
// testGetBalance('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL', '');

// testClaimOng();

// testTransferFromMany()

// testTransferToMany()

const from = new Address('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL');
// testGetUnclaimedOng(from);

// testQueryAllowance(from, from);
const address = new Address('AQkGLumU1tnyJBGV1ZUmD229iQf9KRTTDL');
testQueryBalance('ong', address);

// console.log('add: ' + new Address('TAsW5tthjNBX4FG6ifGMTAswCBdB2YWGaG').serialize());
