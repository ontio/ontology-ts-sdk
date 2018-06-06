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

import DeployCode from '../src/transaction/payload/deployCode';
import { Transaction, TxType } from '../src/transaction/transaction';

import { buildRestfulParam, buildRpcParam, buildTxParam, Default_params, makeDeployCodeTransaction,
     makeInvokeTransaction, parseEventNotify, sendRawTxRestfulUrl, signTransaction
    } from '../src/transaction/transactionBuilder';
import { ab2hexstring, ab2str, num2hexstring , reverseHex, str2hexstr } from '../src/utils';

import axios from 'axios';
import { ONT_NETWORK, TEST_NODE, TEST_ONT_URL } from '../src/consts';
import AbiFunction from '../src/smartcontract/abi/abiFunction';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { Parameter } from '../src/smartcontract/abi/parameter';
import TxSender from '../src/transaction/txSender';

import { Address } from '../src/crypto';
import json from '../src/smartcontract/data/idContract.abi';
import { VmCode, VmType } from '../src/transaction/vmcode';
import { Account } from './../src/account';
import { PrivateKey } from './../src/crypto/PrivateKey';

// tslint:disable:no-var-requires
const fs = require('fs');
const path = require('path');
const idContractAvm = fs.readFileSync(path.join(__dirname, '../src/smartcontract/data/IdContract.avm'));
const idContractAvmCode = ab2hexstring(idContractAvm);

const attestClaimAvm = fs.readFileSync(path.join(__dirname, '../src/smartcontract/data/attestClaim.avm'));
const attestClaimAvmCode = ab2hexstring(attestClaimAvm);

const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
const account = Account.create(privateKey, '123456', 'test');

const ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b';

const wasmCode = `0061736d0100000001250760017f0060017f017f60027f7f017f60037f7f7f0060027f7f0060037f7f7
f017f60000002d0010c03656e76066d656d6f727902000103656e760a6d656d6f727942617365037f0003656e760d44656c65
746553746f72616765000003656e760a47657453746f72616765000103656e76104a736f6e4d617368616c526573756c74000
203656e76114a736f6e556e6d617368616c496e707574000303656e760a50757453746f72616765000403656e760d52756e74
696d654e6f74696679000003656e760861727261794c656e000103656e76066d616c6c6f63000103656e76066d656d6370790
00503656e7606737472636d70000203050402020202060b027f0141000b7f0141000b070a0106696e766f6b65000d0afd0304
0700200120006a0b3e01037f20001006210220011006220320026a10072104200241004a044020042000200210081a0b20034
1004a0440200420036a2001200310081a0b20040b6d01047f200010062104200110062105200441004a044003402000200341
02746a28020020026a2102200341016a22032004470d00200221000b05410021000b200541004a04404100210203402001200
24102746a28020020006a2100200241016a22022005470d000b0b20000bc50201027f23012103230141106a24012003210202
4020002300100904402000230041136a1009450440200241082001100320022802002002280204100a230041176a100222001
0050c020b20002300411b6a1009450440200241082001100320022802002002280204100b230041226a1002220010050c020b
2000230041296a1009450440200241082001100320022802002002280204100c230041176a1002220010050c020b200023004
1326a100945044020024108200110032002280200200228020410042300413d6a230041226a1002220010050c020b20002300
41c2006a1009450440200241042001100320022802001001230041226a1002220010050c020b2000230041cd006a100904404
1002100052002410420011003200228020010002300413d6a230041226a1002220010050b05230041056a21000b0b20032401
20000b0b60010023000b5a696e697400696e69742073756363657373210061646400696e7400636f6e63617400737472696e6
70073756d41727261790061646453746f7261676500446f6e650067657453746f726167650064656c65746553746f72616765`;

const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

const WebSocket = require('ws');

const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

const testDeployCodeTx = (code, vmType = VmType.NEOVM) => {

    const tx = makeDeployCodeTransaction(code, vmType, 'name', '1.0', 'alice', 'testmail', 'desc', true, '0', '30000');
    tx.payer = account.address;
    signTransaction(tx, privateKey);

    const param = buildRestfulParam(tx);

    // var url = TEST_ONT_URL.sendRawTxByRestful
    const url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true);
    axios.post(url, param).then((res: any) => {
        // tslint:disable:no-console
        console.log('deploy res: ' + JSON.stringify(res.data));
        // tslint:disable-next-line:only-arrow-functions
        setTimeout(function() {
            getContract(code, vmType);
        }, 6000);
    }).catch((err) => {
        console.log('err: ' + err);
    });
    // console.log('param: '+ param)

    // var url = TEST_ONT_URL.RPC_URL
    // let param = buildRpcParam(tx)
    // console.log('param: '+JSON.stringify(param))
    // axios.post(url, param).then((res)=>{
    //     console.log('deploy res: '+JSON.stringify(res.data))
    //     setTimeout(function() {
    //         getContract(code, vmType)
    //     }, 6000)
    // }).catch(err => {
    //     console.log(err)
    // })

    // var param = buildTxParam(tx)
    // var callback = function(err, res, socket) {
    //     console.log('res: '+ JSON.stringify(res))
    // }
    // txSender.sendTxWithSocket(param, callback)

};

const getContract = (avmCode, vmType= VmType.NEOVM) => {
    const codeHash = Address.fromContract(avmCode, vmType).toHexString();
    console.log('codeHash: ' + codeHash);
    const url = `${TEST_ONT_URL.REST_URL}/api/v1/contract/${codeHash}`;
    console.log('url : ' + url);
    axios.get(url).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.log(err);
    });
};

// testDeployCodeTx(idContractAvmCode)

testDeployCodeTx(attestClaimAvmCode);

// testDeployCodeTx(recordContractAvmCode)

// testDeployCodeTx(wasmCode, VmType.WASMVM)

// getContract(idContractAvmCode)
// testDeserialize()

/*
describe('test tx serialize and deserialize', ()=> {
    var serialized

    test('test deployCode ', ()=> {
         serialized = tx.serialize()

        expect(serialized).toBeDefined()
    })

    test('test deployCode deserialize', () => {
        let tx = Transaction.deserialize(serialized)
        // console.log(JSON.stringify(tx))
        expect(tx.type).toEqual(TxType.DeployCode)
    })

    // test('', ()=> {
    //     let avm = fs.readFileSync('/Users/mickeywang/Desktop/Workspace/ont-sdk-ts-local/src/smartcontract/data/ClearingContract.avm')

    //     console.log(getHash( ab2hexstring(avm)))
    // })
}) */
