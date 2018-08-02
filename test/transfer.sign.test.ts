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

import { Address, PrivateKey, Signature, SignatureScheme } from '../src/crypto';
import { makeTransferTx } from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import { signTransaction } from './../src/transaction/transactionBuilder';

// tslint:disable:no-console
// tslint:disable:max-line-length
// tslint:disable:quotemark
describe('test transfer sign', () => {
    test('test canonical sign', async () => {
        const mnemonics = 'immune annual decorate major humble surprise dismiss trend edit suit alert uncover release transfer suit torch small timber lock mind tomorrow north lend diet';
        const privateKey = PrivateKey.generateFromMnemonic(mnemonics, "m/44'/888'/0'/0/0");
        const publicKey = privateKey.getPublicKey();
        const address = Address.fromPubKey(publicKey);

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
});
