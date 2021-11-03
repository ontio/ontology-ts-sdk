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

import {Address, PrivateKey} from '../../src/crypto';
import {
    deserializeTransferTxV2,
    makeTransferTxV2,
} from '../../src/smartcontract/nativevm/ontAssetTxBuilder';
import {Account} from '../../src';

describe('test ont/ong v2', () => {
    const gasLimit = '20000';
    const gasPrice = '2500';
    const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const account = Account.create(adminPrivateKey, '123456', '');
    const adminAddress = account.address;

    test('test deserializeTransferTxV2', async () => {
        const from = adminAddress;
        const to = new Address('AH9B261xeBXdKH4jPyafcHcLkS2EKETbUj');
        const tx = makeTransferTxV2('ONT', from, to, 100000000, gasPrice, gasLimit);
        const serializedTx = tx.serialize();
        const deserializedTx = deserializeTransferTxV2(serializedTx);
        expect(deserializedTx.method === 'transferV2' && deserializedTx.amount === 100000000);
    });
});

