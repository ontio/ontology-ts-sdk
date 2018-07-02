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

// tslint:disable:max-line-length
import axios from 'axios';
import { GetStatusResponse } from '../src/claim/claim';
import { TEST_ONT_URL } from '../src/consts';
import { DEFAULT_ALGORITHM, ONT_NETWORK, TEST_NODE } from '../src/consts';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey } from '../src/crypto';
import { Identity } from '../src/identity';
import { RestClient } from '../src/index';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import AbiFunction from '../src/smartcontract/abi/abiFunction';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../src/smartcontract/abi/parameter';
import json2 from '../src/smartcontract/data/idContract.abi';
import { buildAddAttributeTx, buildAddControlKeyTx, buildAddRecoveryTx,
    buildChangeRecoveryTx, buildGetAttributesTx, buildGetDDOTx, buildGetPublicKeyStateTx,
    buildGetPublicKeysTx, buildRegIdWithAttributes, buildRegisterOntidTx, buildRemoveAttributeTx, buildRemoveControlKeyTx
} from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import { State } from '../src/smartcontract/nativevm/token';
import { buildCommitRecordTx, buildGetRecordStatusTx, buildRevokeRecordTx } from '../src/smartcontract/neovm/attestClaimTxBuilder';
import { DDO, DDOAttribute, PublicKeyWithId } from '../src/transaction/ddo';
import InvokeCode from '../src/transaction/payload/invokeCode';
import { Transaction } from '../src/transaction/transaction';
import { addSign , buildRestfulParam,
    buildRpcParam, buildTxParam, makeInvokeTransaction, sendRawTxRestfulUrl } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
import { VmType } from '../src/transaction/vmcode';
import { ab2hexstring, hexstr2str, str2hexstr, StringReader } from '../src/utils';
import { Account } from './../src/account';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';

const gasPrice = '0';
const gasLimit = '30000';

const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

// const SOCKET_URL = 'ws://52.80.115.91:20335'
// tslint:disable-next-line:variable-name
const Default_params = {
    Action: 'sendrawtransaction',
    Version: '1.0.0',
    Type: '',
    Op: 'exec'
};
// tslint:disable:no-console
// tslint:disable:no-var-requires
const WebSocket = require('ws');

let privateKey: PrivateKey;
let publicKey: PublicKey;
// tslint:disable-next-line:prefer-const
let pk2: PublicKey;
let ontid: string;
// tslint:disable:prefer-const
let oldrecovery: string;
let newrecovery: string;
let pkId: string;

let abiInfo: AbiInfo;
let identity: Identity;

abiInfo = AbiInfo.parseJson(JSON.stringify(json2));
// privateKey = PrivateKey.random()
// console.log('privatekey: ' + privateKey)
// console.log('publick key: ' + publicKey)

privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
const account = Account.create(privateKey, '123456', '');
publicKey = privateKey.getPublicKey();
ontid = 'did:ont:AUG62qrHboRc4oNn8SvJ31ha6BkwLPKvvG';

const pri2 = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
const account2 = Account.create(pri2, '123456', '');
const pub2 = pri2.getPublicKey();
const ontid2 = 'did:ont:ALnvzTMkbanffAKzQwxJ3EGoBqYuR6WqcG';

const pri3 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
const account3 = Account.create(pri3, '123456', '');
const pub3 = pri3.getPublicKey();
const ontid3 = Address.generateOntid(pub3);
console.log('pk3:' + pri3.getPublicKey().serializeHex());

const pri4 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b98');
const account4 = Account.create(pri4, '123456', '');
const pub4 = pri4.getPublicKey();
const ontid4 = Address.generateOntid(pub4);
console.log('pk4:' + pri4.getPublicKey().serializeHex());

const pri5 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b99');
const account5 = Account.create(pri5, '123456', '');
const pub5 = pri5.getPublicKey();
const ontid5 = Address.generateOntid(pub5);

const recoveryAddress = Address.fromMultiPubKeys(2, [pri3.getPublicKey(), pri4.getPublicKey()]);

// var invoke = new InvokeCode();
// var sr = new StringReader('5999efd79e56f5b4edc78ba2bafae3cd2c3bb68dfd030121023ed0ac36b2222e47f4997e58e420b6e29cf8b7f2d540fce9ec92ebbdf1c72cbe5e7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e34222c224f6e746964223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f44227d06537472696e6740623561383762656139326435323532356236656261336236373035393563663862396362623531653937326635636266663439396434383637376464656538612a6469643a6f6e743a544146593162684c446b685a706b4e47685335664775425935474c544d416256584e55c10c416464417474726962757465')
// invoke.deserialize(sr)
// console.log('invoke:'+JSON.stringify(invoke))

// identity = new Identity()
// identity.create(privateKey, '123456', 'mickey')
// ontid = str2hexstr(identity.ontid)

// tslint:disable:no-console
// ontid = Address.generateOntid(publicKey);
// console.log('ontid: ' + ontid);

// tslint:disable-next-line:no-shadowed-variable
export const sendTx = (param, callback = null) => {
    const socket = new WebSocket(TEST_ONT_URL.SOCKET_URL);
    socket.onopen = () => {
        console.log('connected');
        // let wsapi = new WebSocketClientApi()
        // let subscribe = wsapi.sendSubscribe(true)
        // socket.send(subscribe)
        // setTimeout(()=>{
        // },2000)
        socket.send(param);

    };
    socket.onmessage = (event) => {
        let res;
        if (typeof event.data === 'string') {
            res = JSON.parse(event.data);
        }
        console.log('response for send tx: ' + JSON.stringify(res));
        if (callback) {
            if (res.Result.Result) {
                const cr = callback(res);
                console.log(cr);
                socket.close();
            }
        }
        if (res.Action === 'Notify') {
            // let result = parseEventNotify(res)
            console.log('event notify: ' + JSON.stringify(res));
            socket.close();
        }
        // socket.close()
    };
    socket.onerror = (event) => {
        // no server or server is stopped
        console.log(event);
        socket.close();
    };
};

// tslint:disable-next-line:only-arrow-functions
const callback = function(res, socket) {
    console.log('response: ' + JSON.stringify(res));

    // parseDDO(res.Result)
    // if (res.Action === 'Notify') {

    //     let result = parseEventNotify(res)
    //     console.log('paresed event notify: ' + JSON.stringify(result))
    // }

};

const testDDOTx = () => {
    console.log('account4 recovery: ' + account4.address.serialize());
    // tslint:disable-next-line:no-shadowed-variable
    // const ontid = 'did:ont:TA8z22MRYHcFRKJznJWWGFz5brXBsmMTJZ';
    const tx = buildGetDDOTx('did:ont:ALLMUZaAiqpez9YCRJadpD8pw1LpLWXBvu');
    // tx.payer = account.address

    // let param = buildTxParam(tx, true)
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
        console.log(res);
        if (res.Result.Result) {
            const ddo = DDO.deserialize(res.Result.Result);
            console.log('ddo: ' + JSON.stringify(ddo));
        }
    }).catch((err) => {
        console.log(err);
    });
};

// const testDDOByRpc = () => {
//     let tx = buildGetDDOTx(ontid, privateKey)
//     let param = buildRpcParam(tx)
//     txSender.sendWithRpc(param).then( res => {
//         console.log('rpc response: '+ JSON.stringify(res))
//     })
// }

const parseDDO = (result) => {
    const ddo = DDO.deserialize(result);
    console.log('parse DDO : ' + JSON.stringify(ddo));
};

const testRegisterOntid = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const pri = PrivateKey.random();
    console.log('pri: ' + pri.key);
    const id = Identity.create(pri, 'ont_wang3', 'mickey');
    console.log(id.toJson);
    const addr = Address.fromOntid(id.ontid);
    const pub = pri.getPublicKey();
    const tx = buildRegisterOntidTx(id.ontid, pub, gasPrice, gasLimit);
    tx.payer = addr;
    signTransaction(tx, pri);
    const serialized = tx.serialize();
    console.log('tx serialized: ' + serialized);

    const param = buildTxParam(tx);
    sendTx(param);
    // console.log('param : '+param)
    // txSender.sendTxWithSocket(param, callback)

    // let param = buildRestfulParam(tx)
    // let url = TEST_ONT_URL.sendRawTxByRestful
    // axios.post(url, param).then((res)=>{
    //     console.log(res.data)
    // })
};

const testRegIdWithAttributes = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const ontid = Address.generateOntid(pub2);
    const attr = new DDOAttribute();
    attr.key = 'hello';
    attr.type = 'string',
    attr.value = 'world';
    const tx = buildRegIdWithAttributes(ontid, [attr], pub2, gasPrice, gasLimit);
    tx.payer = account2.address;
    signTransaction(tx, pri2);
    const param = buildTxParam(tx);
    sendTx(param);
};

const testAddAttribute = () => {

    // tslint:disable-next-line:one-variable-per-declaration
    const claimId = 'claim:b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a',
        context = 'claim:staff_authentication8',
        issuer = 'did:ont:TVuF6FH1PskzWJAFhWAFg17NSitMDEBNoa';
        // let key = str2hexstr(claimId)

    const type = 'JSON';
    const data = {
        Type : 'JSON',
        Value : {
            Context: context,
            Issuer: issuer
        }
    };
    const value = JSON.stringify(data);
        // console.log('value: '+value)
        // value = str2hexstr(value)

    // let key = str2hexstr('Claim:twitter')
    // let type = str2hexstr('String')
    // let value = str2hexstr('wang17@twitter')

    const attr = new DDOAttribute();
    attr.key = claimId;
    attr.type = type;
    attr.value = value;
    const did = ontid5;
    const tx = buildAddAttributeTx(did, [attr], pub5, gasPrice, gasLimit);
    tx.payer = account2.address;
    signTransaction(tx, pri2);
    addSign(tx, pri5);
    const param = buildTxParam(tx);
    console.log('param: ' + JSON.stringify(param));
    sendTx(param);
};

const testRemoveAttribute = () => {
    const claimId = 'claim:b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a';
    // const key = str2hexstr(claimId);
    // let key = str2hexstr('Claim:twitter');
    let key = claimId;

    console.log('removeAttr key: ' + key);
    const tx = buildRemoveAttributeTx(ontid, claimId, pub5, gasPrice, gasLimit);
    tx.payer = account5.address;
    signTransaction(tx, pri5);
    const param = buildTxParam(tx);
    sendTx(param);
};

const testGetAttributs = () => {
    const tx = buildGetAttributesTx(ontid5);
    tx.payer = account.address;
    const restClient = new RestClient();
    restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
        console.log(DDOAttribute.deserialize(res.Result.Result));

    });
};

/* const testGetPublicKeyId = () => {
    let tx = buildGetPublicKeyIdTx(ontid, publicKey)
    let param = buildRestfulParam(tx)
    console.log(param)
    let url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true)
    console.log(url)
    axios.post(url, param).then((res) => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
} */

const testGetPublicKeyState = () => {
    const tx = buildGetPublicKeyStateTx(ontid5, 2);
    const param = buildRestfulParam(tx);
    console.log('tx serialized: ' + tx.serialize());
    const url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true);
    axios.post(url, param).then((res) => {
        const result = res.data.Result.Result;
        console.log(hexstr2str(result));
    }).catch((err) => {
        console.log(err);
    });
};

const testAddPK = () => {
    const tx = buildAddControlKeyTx(ontid5, pub4, pub5, gasPrice, gasLimit);
    tx.payer = account5.address;
    signTransaction(tx, pri5);
    const param = buildTxParam(tx);
    console.log('add pk param: ' + param);
    sendTx(param);
};

const testGetPublicKeys = () => {
    const tx = buildGetPublicKeysTx(ontid5);
    // tx.payer = account.address;
    // signTransaction(tx, privateKey);
    // let param = buildTxParam(tx)
    // sendTx(param)
    const param = buildRestfulParam(tx);
    const url = sendRawTxRestfulUrl(TEST_ONT_URL.REST_URL, true);
    axios.post(url, param).then((res) => {
        console.log(res.data);
        const r = PublicKeyWithId.deserialize(res.data.Result.Result);
        console.log('pkWithId: ' + JSON.stringify(r));
    });
};

const testRemovePK = () => {
    const tx = buildRemoveControlKeyTx(ontid, pub4, pub5, gasPrice, gasLimit);
    tx.payer = account5.address;
    signTransaction(tx, pri5);
    const param = buildTxParam(tx);
    console.log('remove pk param: ' + param);
    sendTx(param);
};

const testAddRecovery = () => {
    const tx = buildAddRecoveryTx(ontid5, account3.address, pub5, gasPrice, gasLimit);
    tx.payer = account5.address;
    signTransaction(tx, pri5);
    const param = buildTxParam(tx);
    sendTx(param);
};

const testChangeRecovery = () => {
    const tx = buildChangeRecoveryTx(ontid5, account2.address, account3.address, gasPrice, gasLimit);
    tx.payer = account3.address;
    signTransaction(tx, pri3);
    const param = buildTxParam(tx);
    console.log('change recovery param: ' + param);
    sendTx(param);
};

// const testAddmnRecovery = () => {
//     const tx = buildAddRecoveryTx(ontid5, recoveryAddress, pub5, gasPrice, gasLimit);
//     tx.payer = account5.address;
//     signTransaction(tx, pri5);
//     const param = buildTxParam(tx);
//     sendTx(param);
// };

// const testChangemnRecovery = () => {
//     const tx = buildChangeRecoveryTx(ontid, account4.address, recoveryAddress, gasPrice, gasLimit);
//     tx.payer = recoveryAddress;
//     console.log('recoveryAddres: ' + recoveryAddress.serialize());
//     signTx(tx, [ [pri3, pri4] ]);
//     const param = buildTxParam(tx);
//     console.log('change recovery param: ' + param);
//     sendTx(param);
// };

// const testInvokeWasmContract = () => {
//     const codeHash = '9007be541a1aef3d566aa219a74ef16e71644715';
//     const params = [new Parameter('p1', ParameterType.Int, 20), new Parameter('p2', ParameterType.Int, 30)];
//     const funcName = 'add';
//     const tx = makeInvokeTransaction(funcName, params, codeHash, VmType.WASMVM, '0');
//     // let txParam = tx.serialize()
//     // console.log('wasm param:' + txParam)
//     // let restClient = new RestClient()
//     // restClient.sendRawTransaction(txParam).then( res => {
//     //     console.log(res)

//     // })
//     const param = buildTxParam(tx);
//     console.log(param);
//     sendTx(param);
// };

const testCommitTx = () => {
    const issuer = ontid;
    const sub = ontid2;
    const claimId = 'claimId:1234567';
    const tx = buildCommitRecordTx(claimId, issuer, sub, gasPrice, gasLimit, account.address);
    signTransaction(tx, privateKey);
    const param = buildTxParam(tx);
    sendTx(param);
};

const testGetRecordStatus = () => {
    const claimId = 'claimId:1234567';
    const tx = buildGetRecordStatusTx(claimId);
    const param = buildTxParam(tx, true);
    sendTx(param, GetStatusResponse.deserialize);
};

const testRevokeStatus = () => {
    const claimId = 'claimId:1234567';
    const tx = buildRevokeRecordTx(claimId, ontid, gasPrice, gasLimit, account.address);
    signTransaction(tx, privateKey);
    const param = buildTxParam(tx);
    sendTx(param);
};
// uncomment one line to test one tx each time.

testRegisterOntid();

// testRegIdWithAttributes()

// testAddAttribute();

// testRemoveAttribute()

// testGetAttributs()

// testDDOTx();

// testGetPublicKeys()

// testAddPK()

// testRemovePK()

// testAddRecovery()

// testChangeRecovery()

// testAddmnRecovery()

// testChangemnRecovery()

// testGetPublicKeyState();

// let txHash = '82c17d7430140a1f3863b8f6f03db07bbdfbdb7da22ffdb2358a1d2e185f8bf3'
// core.getMerkleProof(txHash).then( res => {
//     console.log(res)
// })

// testInvokeWasmContract()

// testRecordPutTx()

// testRecordGetTx()

// testCommitTx();

// testGetRecordStatus();

// testRevokeStatus();
