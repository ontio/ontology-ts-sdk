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
     makeInvokeTransaction, sendRawTxRestfulUrl, signTransaction
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
let attestClaimAvmCode = ab2hexstring(attestClaimAvm);

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

const testDeployCodeTx = (code) => {

    const tx = makeDeployCodeTransaction(code, 'name', '1.0', 'alice', 'testmail', 'desc', true, '0', '30000000');
    tx.payer = account.address;
    signTransaction(tx, privateKey);

    const param = buildRestfulParam(tx);

    // var url = TEST_ONT_URL.sendRawTxByRestful
    const url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL);
    axios.post(url, param).then((res: any) => {
        // tslint:disable:no-console
        console.log('deploy res: ' + JSON.stringify(res.data));
        // tslint:disable-next-line:only-arrow-functions
        setTimeout(function() {
            getContract(code);
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

const getContract = (avmCode) => {
    const contract = Address.fromVmCode(avmCode);
    const codeHash = contract.toHexString();
    console.log('contract address: ' + contract.serialize());
    console.log('codeHash: ' + codeHash);

    const url = `${TEST_ONT_URL.REST_URL}/api/v1/contract/${codeHash}`;
    console.log('url : ' + url);
    axios.get(url).then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.log(err);
    });
};

// testDeployCodeTx(idContractAvmCode);

console.log('avmcode: ' + attestClaimAvmCode)
attestClaimAvmCode = '5fc56b6c766b00527ac46c766b51527ac4616c766b00c306436f6d6d6974876c766b52527ac46c766b52c3647100616c766b51c3c0539c009c6c766b56527ac46c766b56c3640e00006c766b57527ac46232016c766b51c300c36c766b53527ac46c766b51c351c36c766b54527ac46c766b51c352c36c766b55527ac46c766b53c36c766b54c36c766b55c361527265fc006c766b57527ac462e9006c766b00c3065265766f6b65876c766b58527ac46c766b58c3645d00616c766b51c3c0529c009c6c766b5b527ac46c766b5bc3640e00006c766b57527ac462a8006c766b51c300c36c766b59527ac46c766b51c351c36c766b5a527ac46c766b59c36c766b5ac3617c6522026c766b57527ac46273006c766b00c309476574537461747573876c766b5c527ac46c766b5cc3644900616c766b51c3c0519c009c6c766b5e527ac46c766b5ec3640e00006c766b57527ac4622f006c766b51c300c36c766b5d527ac46c766b5dc3616509046c766b57527ac4620e00006c766b57527ac46203006c766b57c3616c756658c56b6c766b00527ac46c766b51527ac46c766b52527ac46161681953797374656d2e53746f726167652e476574436f6e746578746c766b00c3617c681253797374656d2e53746f726167652e4765746c766b53527ac46c766b53c300a06c766b56527ac46c766b56c364410061616c766b00c309206578697374656421617c084572726f724d736753c168124e656f2e52756e74696d652e4e6f7469667961006c766b57527ac462eb006154c56c766b54527ac46c766b54c36c766b00c3007cc46c766b54c351537cc46c766b54c36c766b51c3517cc46c766b54c36c766b52c3527cc46c766b54c361681853797374656d2e52756e74696d652e53657269616c697a656c766b55527ac461681953797374656d2e53746f726167652e476574436f6e746578746c766b00c36c766b55c3615272681253797374656d2e53746f726167652e50757461616c766b51c31320637265617465206e657720636c61696d3a206c766b00c3615272045075736854c168124e656f2e52756e74696d652e4e6f7469667961516c766b57527ac46203006c766b57c3616c756659c56b6c766b00527ac46c766b51527ac46161681953797374656d2e53746f726167652e476574436f6e746578746c766b00c3617c681253797374656d2e53746f726167652e4765746c766b52527ac46c766b52c3009c6c766b55527ac46c766b55c364450061616c766b00c30d206e6f74206578697374656421617c084572726f724d736753c168124e656f2e52756e74696d652e4e6f7469667961006c766b56527ac4629e016c766b52c361681a53797374656d2e52756e74696d652e446573657269616c697a656c766b53527ac46c766b53c353c3519c009c6c766b57527ac46c766b57c364480061616c766b00c31020696e76616c6964207374617475732e617c084572726f724d736753c168124e656f2e52756e74696d652e4e6f7469667961006c766b56527ac46216016c766b53c351c36c766b51c3617c65a301009c6c766b58527ac46c766b58c364410061616c766b51c30920696e76616c69642e617c084572726f724d736753c168124e656f2e52756e74696d652e4e6f7469667961006c766b56527ac462b6006c766b53c300537cc46c766b53c361681853797374656d2e52756e74696d652e53657269616c697a656c766b54527ac461681953797374656d2e53746f726167652e476574436f6e746578746c766b00c36c766b54c3615272681253797374656d2e53746f726167652e50757461616c766b51c30f207265766f6b6520636c61696d3a206c766b00c3615272045075736854c168124e656f2e52756e74696d652e4e6f7469667961516c766b56527ac46203006c766b56c3616c756653c56b6c766b00527ac46161681953797374656d2e53746f726167652e476574436f6e746578746c766b00c3617c681253797374656d2e53746f726167652e4765746c766b51527ac4616c766b00c309207374617475733a206c766b51c3615272045075736854c168124e656f2e52756e74696d652e4e6f74696679616c766b51c36c766b52527ac46203006c766b52c3616c756657c56b6c766b00527ac46c766b51527ac4616c766b00c3c06c766b51c3c09c009c6c766b52527ac46c766b52c3640f0061006c766b53527ac4627900006c766b54527ac4624800616c766b00c36c766b54c3517f6c766b51c36c766b54c3517f9c009c6c766b55527ac46c766b55c3640e00006c766b53527ac4623800616c766b54c351936c766b54527ac46c766b54c36c766b00c3c09f6c766b56527ac46c766b56c363a3ff516c766b53527ac46203006c766b53c3616c7566'
testDeployCodeTx(attestClaimAvmCode);

// testDeployCodeTx(recordContractAvmCode)

// testDeployCodeTx(wasmCode, VmType.WASMVM)

// getContract(attestClaimAvmCode)
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
