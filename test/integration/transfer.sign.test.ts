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

import * as GovernanceTxBuilder from '../../src//smartcontract/nativevm/governanceContractTxBuilder';
import { Address, PrivateKey, Signature } from '../../src/crypto';
import { makeTransferTx } from '../../src/smartcontract/nativevm/ontAssetTxBuilder';
import { Transaction } from '../../src/transaction/transaction';
import { hexstr2str, str2hexstr } from '../../src/utils';
import { KeyParameters } from '../../src/crypto/Key';
import { KeyType } from '../../src/crypto/KeyType';
import { PublicKey } from '../../src/crypto/PublicKey';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import { signTransaction } from '../../src/transaction/transactionBuilder';
import {TEST_ONT_URL_2} from '../../src/consts';

// tslint:disable:no-console
// tslint:disable:max-line-length
// tslint:disable:quotemark
describe('test transfer sign', () => {
    test('test canonical sign', async () => {
        const mnemonics = 'immune annual decorate major humble surprise dismiss trend edit suit alert uncover release transfer suit torch small timber lock mind tomorrow north lend diet';
        const privateKey = PrivateKey.generateFromMnemonic(mnemonics, "m/44'/888'/0'/0/0");
        const publicKey = privateKey.getPublicKey();

        const from = new Address('AGn8JFPGM5S4jkWhTC89Xtz1Y76sPz29Rc');
        const to = new Address('AcyLq3tokVpkMBMLALVMWRdVJ83TTgBUwU');
        const tx = makeTransferTx('ONG', from, to, 12000000, '500', '30000');
        tx.nonce = 'eb1c7f7f';
        signTransaction(tx, privateKey);

        console.log(tx);
        console.log('hash', tx.getHash());
        console.log('key ', privateKey.key);
        console.log('pub ', publicKey.key);
        console.log('sig ', tx.sigs[0].sigData[0]);

        // if canonical mode is not set, the result will be
        // 017da1b8268e1272d7471eef58fa0884108073c09d5efdae0143da5d281019682ea5ea9d0d289b7b15fc861c01418fda56642be628560fe4d7ccdede930e620b5d
        expect(tx.sigs[0].sigData[0]).toBe('017da1b8268e1272d7471eef58fa0884108073c09d5efdae0143da5d281019682e5a1562f1d76484eb0379e3febe7025a958bb14855107b9ad26daec2fee0119f4');
    }, 10000);

    test('verify', async () => {
        const pk = new PublicKey('022f71daef10803ece19f96b2cdb348d22bf7871c178b41f35a4f3772a8359b7d2');
        const data0 = '{"action":"signMessage","params":{"invokeConfig":{"contractHash":"0000000000000000000000000000000000000000","functions":[{"operation":"signMessage","args":[{"name":"message","value":"String: register"}]}],"payer":"","gasLimit":20000,"gasPrice":500}}}';
        console.log('data3:' + str2hexstr(data0));
        const data = "7b22616374696f6e223a227369676e4d657373616765222c22706172616d73223a7b22696e766f6b65436f6e666967223a7b22636f6e747261637448617368223a2230303030303030303030303030303030303030303030303030303030303030303030303030303030222c2266756e6374696f6e73223a5b7b226f7065726174696f6e223a227369676e4d657373616765222c2261726773223a5b7b226e616d65223a226d657373616765222c2276616c7565223a22537472696e673a7265676973746572227d5d7d5d2c227061796572223a22222c226761734c696d6974223a32303030302c226761735072696365223a3530307d7d7d";
        const data1 = hexstr2str(data);
        console.log(data1);
        console.log('data equal: ' + (data0 === data1));
        const sig = Signature.deserializeHex('016f1d5074b4bdb2a19958c0daa08f504ecd475ddf643f5859d051e27c636bba046838bdd226d6b32bdf1743da281b2f7d89ee667913cf48ab7a7b079b5b6b4f3c');
        const res = pk.verify(data1, sig);
        console.log('res: ' + res);
        // const sig = Signature.deserializeHex("016f1d5074b4bdb2a19958c0daa08f504ecd475ddf643f5859d051e27c636bba046838bdd226d6b32bdf1743da281b2f7d89ee667913cf48ab7a7b079b5b6b4f3c");
        // const pri = PrivateKey.deserializeWIF('L1PJ9ScWP3EzhtG9tRJPpZL7mwtmCWfKM8RtsszHXU34zahxXTJ5');
        // const sig2 = pri.sign(data);
        // // console.log('sig equal: ' + (sig.serializeHex() === sig2));
        // const pk = pri.getPublicKey();
        // const res = pk.verify(data, sig2);
        // console.log('res: ' + res);
    });

    test('verifySig', async () => {
        const rightTx = '00d11ac5b076f401000000000000204e00000000000000000000000000000000000000000000000000003a0b7369676e4d6573736167651400000000000000000000000000000000000000000068164f6e746f6c6f67792e4e61746976652e496e766f6b650001424101bf874cc55a1d2585d400f3b5ede05fa28e7e47ce5f481a30c78fdaf36a7e564fac5e6b113f5a8d5affb5c9d2199c37dae8620c3c6ca70a2ec84c5a73958052c5232103471ce02a48066b398c4314c4425b6cb5dbdce275618eff0ef4d9694ddb4c9356ac","signer":"did:ont:AerVaGFiufSuv83KKYs6L1zbz7FSqxCrbC';
        const tx = Transaction.deserialize('00d156b79f04f401000000000000204e00000000000000000000000000000000000000000000000000002c08726567697374657251c10b7369676e4d65737361676567000000000000000000000000000000000000000000014140fbd3965e697fb4e06c4e545a490151d74b8b6439f8ffaba7d83451c400753e502ed35cf99faa0338d466ca7a76e96066e0d11ca182b3aa5839842167f9579ce7232103cb792433b98712120850bcc061e509bef50515d719096a31f407ca8edeaeb9b6ac');
        const sigData = tx.sigs[0].sigData[0];
        console.log(JSON.stringify(sigData));
        // const sig = Signature.deserializeHex(sigData);

        const txRight = Transaction.deserialize(rightTx);
        const sigData2 = txRight.sigs[0].sigData[0];
        console.log(JSON.stringify(sigData2));
    });

    xtest('eddsa', async () => {

        const seed = Buffer.from('05feadb3037d3afc7c878130a73b5b9e8fa6df42899dfaf874b4dfa8ab1bf4a4', 'hex').toString('hex');

        const privateKey = new PrivateKey(seed, KeyType.EDDSA, KeyParameters.deserializeJson({ curve: 'ed25519' }));
        // const privateKey = new PrivateKey(seed) // IT WORKS without EDDSA schema
        console.log(privateKey.getEdDSAPublicKey().serializeHex());
        // Sender's address
        const address = new Address('APT4wZG9sFQfjhyfGALPXQj5UyrQ3ZCVkY');
        // peers
        const peerPubKeyList = ['030a34dcb075d144df1f65757b85acaf053395bb47b019970607d2d1cdd222525c'];
        // Amount to stake
        const posList = [2];
        // Gas price and gas limit are to compute the gas costs of the transaction.
        const gasPrice = '2500';
        const gasLimit = '20000';

        const tx = GovernanceTxBuilder.makeAuthorizeForPeerTx(address, peerPubKeyList, posList, address, gasPrice, gasLimit);

        signTransaction(tx, privateKey); // BUG with ed25519?

        console.log('signed tx', tx);

        // serialize tx ready to broadcast

        const serialized = tx.serialize();
        console.log('tx serialized', serialized);
        const wb = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL);
        const res = await wb.sendRawTransaction(tx.serialize(), false);
        console.log(res);
    });

});
