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

import {Address, PrivateKey} from '../../../src/crypto';
import {
    makeTransferTxV2,
} from '../../../src/smartcontract/nativevm/ontAssetTxBuilder';
import {Account, WebsocketClient} from '../../../src';
import {signTransaction} from "../../../src/transaction/transactionBuilder";

// from ATrsfFRuAEcHNznnuLmJgC5A4Gm2Yit9XZ
// to AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r

describe('test ont/ong v2', () => {
    const socketClient = new WebsocketClient('http://172.168.3.73:20335');
    const gasLimit = '20000';
    const gasPrice = '2500';
    const adminPrivateKey = new PrivateKey('861dd2bd18cc61483b3f9bab4a62de945279c8f9c9fdd6318e09031634bc2e1b');
    const account = Account.create(adminPrivateKey, '123456', '');
    const adminAddress = account.address;

    test('makeTransferTxV2', async () => {
        const from = adminAddress;
        const to = new Address('AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r');
        const tx = makeTransferTxV2('ONG', from, to, 1e19, gasPrice, gasLimit);
        signTransaction(tx, adminPrivateKey);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log('response', JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);
});

