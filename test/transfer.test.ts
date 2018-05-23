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
import { HTTP_REST_PORT, ONT_NETWORK, REST_API, TEST_NODE, TEST_ONT_URL } from '../src/consts';
import { getSingleSigUInt160 } from '../src/core';
import * as core from '../src/core';
import { CurveLabel, KeyParameters, KeyType, PrivateKey } from '../src/crypto';
import { Address } from '../src/crypto';
import { addressToU160, u160ToAddress } from '../src/helpers';
import RestClient from '../src/network/rest/restClient';
import RpcClient from '../src/network/rpc/rpcClient';
import * as scrypt from '../src/scrypt';
import { makeClaimOngTx, makeTransferFromManyTx, makeTransferToMany, makeTransferTx
} from '../src/smartcontract/ontAssetTxBuilder';
import { State } from '../src/smartcontract/token';
import { Transaction } from '../src/transaction/transaction';
import { buildRestfulParam, buildRpcParam, buildTxParam, makeTransferTransaction
} from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
import { ab2hexstring, StringReader } from '../src/utils';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';
const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

const accountFrom = {
    // testnet
    // hexAddress: '018f0dcf09ec2f0040e6e8d7e54635dba40f7d63',
    // address: 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE',
    // privateKey: '9a31d585431ce0aa0aab1f0a432142e98a92afccb7bcbcaff53f758df82acdb3'

    // local
    hexAddress: '013c7fd22a239be26196629ec9f4185c18ddc9f7',
    address: 'TA5k9pH3HopmscvgQYx8ptfCAPuj9u2HxG',
    privateKey: new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67318f')
    // address: 'TA98LCZuzins3mUPfDyNRirpQ4YoeRNBan',
    // privateKey: '6248eefef096ec2eebdff7179a59cc36b5c632720e40fb7e9770dc11024543be'
};

const accPrivateKey = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419');
const accAddress = 'TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf';
const accHexAddress = '012845c2ed3b508d135066dba00f850a82b192fd';

const  testTransferTx = () => {

    const tx = makeTransferTx('ONT', new Address(accountFrom.address),
        new Address('TA7o8xgm6AfTa8R1Xn9XbvGKN75QNPTzKz'), '1000', '0');
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
    const request = `https://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.getBalance}/${address}`;
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

const testClaimOng = () => {
    const pri = new PrivateKey('a53213c27eb1de0796b9d0b44c96e7e30228f1466d8657c47b471a4700777c0c');
    const hexAddress = '01716379e393d1a540615e022ede47b97e0577c6';
    console.log(hexAddress);

    // let pri = new PrivateKey('c62bbce37fc96c90e2eea6de474b0031e560ef3630d2f6efe275f16f85ed1543')
    // let address = 'TA9VgmPJcok9cBBLwcLqwhRAfD45vtWa5i'
    // let hexAddress = addressToU160(address)
    // let from = hexAddress
    // let to = from
    // let to = accountFrom.hexAddress
    const tx = makeClaimOngTx(new Address(hexAddress), new Address(hexAddress), '1', '0');
    signTransaction(tx, pri);

    console.log(tx.serialize());
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize()).then((res) => {
        console.log(res);
    });
};

const pri1 = new PrivateKey('c19f16785b8f3543bbaf5e1dbb5d398dfa6c85aaad54fc9d71203ce83e505c07');
const address1 = new Address('TA4WVfUB1ipHL8s3PRSYgeV1HhAU3KcKTq');
const pri2 = new PrivateKey('b0d87bf265d8d0fc2b09ee0be50e8df6e3f7103b523abc45ec064f65e1249419');
const address2 = new Address('TA5KvS6o9puusWQeiyWDezDWgi5NvKQotf');

const pri3 = new PrivateKey('a53213c27eb1de0796b9d0b44c96e7e30228f1466d8657c47b471a4700777c0c');
const address3 = new Address('01716379e393d1a540615e022ede47b97e0577c6');

const testTransferFromMany = () => {

    const tx = makeTransferFromManyTx('ONT', [address1, address2], address3, ['100', '200'], '0');
    const pris = [ [pri1], [pri2]];
    signTx(tx, pris);
    const param = buildTxParam(tx);
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);
};

const testTransferToMany = () => {
    const tx = makeTransferToMany('ONT', address1, [address2, address3], ['100', '200'], '0');
    signTransaction(tx, pri1);
    const param = buildTxParam(tx);
    const callback = (err, res, socket) => {
        console.log('res : ' + JSON.stringify(res));
    };
    txSender.sendTxWithSocket(param, callback);
};

const testAccountTransfer = () => {
    const account = new Account();
    account.create(accountFrom.privateKey, '123456', 'test');

};

// testTransferTx()
const add = u160ToAddress('01716379e393d1a540615e022ede47b97e0577c6');
testGetBalance(accountFrom.address, '');

// testClaimOng()

// testTransferFromMany()

// testTransferToMany()
