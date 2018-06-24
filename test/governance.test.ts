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
import { PublicKey } from '../src/crypto/PublicKey';
import { makeAssignFuncsToRoleTx, makeAssignOntIdsToRoleTx } from '../src/smartcontract/nativevm/authContractTxBuilder';
import { getPeerPoolMap,
    GOVERNANCE_CONTRACT, makeApproveCandidateTx, makeRegisterCandidateTx,
    makeUnvoteForPeerTx, makeVoteForPeerTx, makeWithdrawTx
} from '../src/smartcontract/nativevm/governanceContractTxBuilder';
import { makeTransferTx } from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import { buildGetDDOTx, buildRegisterOntidTx } from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import { addSign, buildTxParam, signTransaction } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';

// tslint:disable:no-console
const txSender = new TxSender('ws://192.168.50.74:20335');
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
const params = {
    cost: 16384,
    blockSize: 8,
    parallel: 8,
    size: 64
};

// TODO: change to private key encoded with AES-GCM
const adminEncPri = new PrivateKey('ET5m04btJ/bhRvSomqfqSY05M1mlmePU74mY+yvpIjY=');
const adminAddress = new Address('TA4nUbnjX5UGVxkumhfndc7wyemrxdMtn8');
const adminPri = adminEncPri.decrypt('111111', adminAddress, '', params);
const adminPk = adminPri.getPublicKey();
const adminOntid = Address.generateOntid(adminPk);

const userPri = new PrivateKey('70789d4ac31576c61c5d12e38a66de605b18faf2c8d60a2c1952a6286b67317f');
const userPk = userPri.getPublicKey();
const userAddr = Address.fromPubKey(userPk);
const userId = Address.generateOntid(userPk);

const role = 'Role';
const func = 'registerCandidate';
const gasPrice = '0';
const gasLimit = '30000';

function transferOnt() {
    const tx = makeTransferTx('ONT', adminAddress, userAddr, '1000000', gasPrice, gasLimit);
    tx.payer = adminAddress;
    signTransaction(tx, adminPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
}

/*
 * Test flow:
 * admin assign function to role
 * admin of governance contract assign role to ONT ID
 * register candidate
 * getPeerPoolMap
 * approve register
 * getPeerPoolMap
*/

const sleep = (ms) => {
    return new Promise( (resolve) => setTimeout(resolve, ms));
};

const testRegisterCandidate = () => {
    const peerPubKey = userPk.serializeHex();
    console.log('pk: ' + peerPubKey);
    // can use any address to pledge the ont&ong
    // tslint:disable-next-line:no-shadowed-variable
    const initPos = 100000;
    const keyNo = 1;
    const tx = makeRegisterCandidateTx(userId, peerPubKey, keyNo, userAddr, initPos, userAddr, gasPrice, gasLimit);
    console.log('tx: ' + tx.serialize());
    signTransaction(tx, userPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const registerOntid = () => {
    const tx = buildRegisterOntidTx(userId, userPk, gasPrice, gasLimit);
    tx.payer = adminAddress;
    signTransaction(tx, userPri);
    addSign(tx, adminPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);

    const tx2 = buildRegisterOntidTx(adminOntid, adminPk, gasPrice, gasLimit);
    tx2.payer = adminAddress;
    signTransaction(tx2, adminPri);
    const param2 = buildTxParam(tx2);
    txSender.sendTxWithSocket(param2, callback);
};

const assignFuncToRole = () => {
    const tx = makeAssignFuncsToRoleTx(new Address(GOVERNANCE_CONTRACT),
        adminOntid, role, [func], 1, adminAddress, gasPrice, gasLimit);
    signTransaction(tx, adminPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const assignRoleToId = () => {
    const tx2 = makeAssignOntIdsToRoleTx(new Address(GOVERNANCE_CONTRACT),
        adminOntid, role, [userId], 1, adminAddress, gasPrice, gasLimit);
    signTransaction(tx2, adminPri);
    const param2 = buildTxParam(tx2);
    txSender.sendTxWithSocket(param2, callback);
};

const queryPeerPoolMap = (pk ?: string) => {
    const url = 'http://192.168.50.74:20334';
    getPeerPoolMap(url).then( (result) => {
        const res = pk ? result[pk] : result;
        console.log('peerPoolMap: ' + JSON.stringify(res));
    }) ;
};

const approveRegister = () => {
    const tx = makeApproveCandidateTx(userPk.serializeHex(), adminAddress, gasPrice, gasLimit);
    console.log('userPk: ' + userPk.serializeHex());
    signTransaction(tx, adminPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

async function testFlow() {
    queryPeerPoolMap();

    assignFuncToRole();

    await sleep(4000);
    assignRoleToId();

    await sleep(4000);
    testRegisterCandidate(); // peer's status is 0

    await sleep(1000);
    queryPeerPoolMap();

    await sleep(4000);
    approveRegister(); // peer's status is 1

    await sleep(4000);
    queryPeerPoolMap();
}

//
const testVoteForPeer = () => {
    const peerPubks = [userPk.serializeHex()];
    const tx = makeVoteForPeerTx(userAddr, peerPubks, [100], userAddr, gasPrice, gasLimit);
    signTransaction(tx, userPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const testUnvoteForPeer = () => {
    const peerPubks = [userPk.serializeHex()];
    const tx = makeUnvoteForPeerTx(userAddr, peerPubks, [100], userAddr, gasPrice, gasLimit);
    signTransaction(tx, userPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

const testWithdraw = () => {
    const peerPubks = [userPk.serializeHex()];
    const tx = makeWithdrawTx(userAddr, peerPubks, [100], userAddr, gasPrice, gasLimit);
    signTransaction(tx, userPri);
    const param = buildTxParam(tx);
    txSender.sendTxWithSocket(param, callback);
};

// testFlow();

// registerOntid();
// queryPeerPoolMap('120202c767b9166185699e5a16abf12f080d23104a6f0cd7a22f26b794eb010eaf1055');

// assignFuncToRole();
// assignRoleToId();

// testRegisterCandidate();

// approveRegister();

// transferOnt();

// testVoteForPeer();

// testUnvoteForPeer();

testWithdraw();
