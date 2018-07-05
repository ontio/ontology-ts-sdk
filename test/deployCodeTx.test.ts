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
import { RestClient } from '../src/index';
import json from '../src/smartcontract/data/idContract.abi';
import { VmCode, VmType } from '../src/transaction/vmcode';
import { Account } from './../src/account';
import { PrivateKey } from './../src/crypto/PrivateKey';

describe('test deploy contract', () => {

    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');

    const ontid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b';

    const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

    const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);

    // tslint:disable-next-line:max-line-length
    const attestClaimAvmCode = '5ac56b6c766b00527ac46c766b51527ac4616c766b00c303507574876c766b52527ac46c766b52c3645d00616c766b51c3c0529c009c6c766b55527ac46c766b55c3640e00006c766b56527ac462a2006c766b51c300c36c766b53527ac46c766b51c351c36c766b54527ac46c766b53c36c766b54c3617c6580006c766b56527ac4626d006c766b00c303476574876c766b57527ac46c766b57c3644900616c766b51c3c0519c009c6c766b59527ac46c766b59c3640e00006c766b56527ac4622f006c766b51c300c36c766b58527ac46c766b58c36165d5006c766b56527ac4620e00006c766b56527ac46203006c766b56c3616c756653c56b6c766b00527ac46c766b51527ac46161681953797374656d2e53746f726167652e476574436f6e746578746c766b00c36c766b51c3615272681253797374656d2e53746f726167652e5075746161035075746c766b00c36c766b51c3615272097075745265636f726454c1681553797374656d2e52756e74696d652e4e6f74696679610350757461681253797374656d2e52756e74696d652e4c6f6761516c766b52527ac46203006c766b52c3616c756652c56b6c766b00527ac46161034765746c766b00c3617c096765745265636f726453c1681553797374656d2e52756e74696d652e4e6f74696679610347657461681253797374656d2e52756e74696d652e4c6f676161681953797374656d2e53746f726167652e476574436f6e746578746c766b00c3617c681253797374656d2e53746f726167652e4765746c766b51527ac46203006c766b51c3616c7566';

    const restClient = new RestClient();
    test('test deploy with avm code', async () => {

        const tx = makeDeployCodeTransaction(attestClaimAvmCode,
            'name', '1.0', 'alice', 'testmail', 'desc', true, '0', '30000000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);
        const result = await restClient.sendRawTransaction(tx.serialize());
        expect(result.Error).toEqual(0);
    }, 10000 );

    test('get contract', async () => {
        const contract = Address.fromVmCode(attestClaimAvmCode);
        const codeHash = contract.toHexString();
        // tslint:disable:no-console
        console.log('contract address: ' + contract.serialize());
        console.log('codeHash: ' + codeHash);
        const result = await restClient.getContract(codeHash);
        console.log(result);
        expect(result.Result).toBeTruthy();
    }, 10000);
});
