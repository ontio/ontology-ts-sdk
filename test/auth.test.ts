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
import TxSender from '../src/transaction/txSender';
import { Account } from './../src/account';
import { Address } from './../src/crypto/address';
import { PrivateKey } from './../src/crypto/PrivateKey';

import { buildTxParam, signTransaction } from '../src/transaction/transactionBuilder';
import { makeAssignFuncsToRoleTx,
    makeAssignOntIdsToRoleTx,
    makeDelegateRoleTx,
    makeInitContractAdminTx,
    makeTransferAuthTx, makeVerifyTokenTx, makeWithdrawRoleTx } from './../src/smartcontract/authContractTxBuilder';

const targetContract = '806256c36653d4091a3511d308aac5c414b2a444';

const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
const publicKey = privateKey.getPublicKey();
const address = Address.fromPubKey(publicKey);
const ontid = Address.generateOntid(publicKey);

const pri2 = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
const pub2 = pri2.getPublicKey();
const address2 = Address.fromPubKey(pub2);
const ontid2 = Address.generateOntid(pub2);

const pri3 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
const pub3 = pri3.getPublicKey();
const address3 = Address.fromPubKey(pub3);
const ontid3 = Address.generateOntid(pub3);

const pri4 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b98');
const pub4 = pri4.getPublicKey();
const address4 = Address.fromPubKey(pub4);
const ontid4 = Address.generateOntid(pub4);

const gasPrice = '0';
const gasLimit = '30000';

const role1 = 'Role1';
const role2 = 'Role2';
const func1 = 'Func1';
const func2 = 'Func2';

// tslint:disable:no-console
const txSender = new TxSender('ws://127.0.0.1:20335');
const callback = (err, res, socket) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('res:' + JSON.stringify(res));
    if (res.Action === 'Notify') {
        console.log('Notify: ' + JSON.stringify(res));
        socket.close();
    }
};
const testInitContractAdmin = () => {
    const tx = makeInitContractAdminTx(ontid, address, gasPrice, gasLimit);
    signTransaction(tx, privateKey);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const testTransferAuth = () => {
    const tx = makeTransferAuthTx(targetContract, ontid2, 1, address, gasPrice, gasLimit);
    signTransaction(tx, privateKey);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const testAssign = () => {
    const tx = makeAssignFuncsToRoleTx(targetContract, ontid2, role1, [func1, func2], 1, address2, gasPrice, gasLimit);
    signTransaction(tx, pri2);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);

    const tx2 = makeAssignOntIdsToRoleTx(targetContract,
        ontid2, role1, [ontid3, ontid4], 1, address2, gasPrice, gasLimit);
    signTransaction(tx2, pri2);
    const param2 = buildTxParam(tx2);
    txSender.sendTxWithSocket(param2, callback);

    const tx3 = makeVerifyTokenTx(targetContract, ontid3, func1, 1, address3, gasPrice, gasLimit);
    signTransaction(tx3, pri3);
    const param3 = buildTxParam(tx3);
    txSender.sendTxWithSocket(param3, callback);

    const tx4 = makeVerifyTokenTx(targetContract, ontid4, func1, 1, address4, gasPrice, gasLimit);
    signTransaction(tx4, pri4);
    const param4 = buildTxParam(tx4);
    txSender.sendTxWithSocket(param4, callback);
};

const testDelegateWithdraw = () => {
    // const tx = makeDelegateRoleTx(targetContract, ontid3, ontid, role1, 1000, 1, 1, address3, gasPrice, gasLimit);
    // signTransaction(tx, pri3);
    // const param = buildTxParam(tx);
    // txSender.sendTxWithSocket(param, callback);

    // const tx2 = makeVerifyTokenTx(targetContract, ontid, func1, 1, address, gasPrice, gasLimit);
    // signTransaction(tx2, privateKey);
    // const param2 = buildTxParam(tx2);
    // txSender.sendTxWithSocket(param2, callback);

    const tx3 = makeWithdrawRoleTx(targetContract, ontid3, ontid, role1, 1, address3, gasPrice, gasLimit);
    signTransaction(tx3, pri3);
    const param3 = buildTxParam(tx3);
    txSender.sendTxWithSocket(param3, callback);

    // const tx4 = makeVerifyTokenTx(targetContract, ontid, func1, 1, address, gasPrice, gasLimit);
    // signTransaction(tx4, privateKey);
    // const param4 = buildTxParam(tx4);
    // txSender.sendTxWithSocket(param4, callback);
};

// tslint:disable-next-line:no-shadowed-variable
const testVerifyToken = (id, func, address, privateKey) => {
    const tx = makeVerifyTokenTx(targetContract, id, func, 1, address, gasPrice, gasLimit);
    signTransaction(tx, privateKey);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};
// testInitContractAdmin();

// testTransferAuth();

// testAssign();

// testDelegateWithdraw();

testVerifyToken(ontid, func1, address, privateKey);
