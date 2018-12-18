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
import AbiFunction from '../src/smartcontract/abi/abiFunction';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../src/smartcontract/abi/parameter';
import { PublicKey } from './../src/crypto/PublicKey';

import json from '../src/smartcontract/data/idContract.abi';
import { Transaction } from '../src/transaction/transaction';
import { VmType } from './../src/transaction/vmcode';

import { Address } from '../src/crypto';
import { makeInvokeTransaction } from '../src/transaction/transactionBuilder';
import { num2hexstring, reverseHex, str2hexstr } from '../src/utils';

describe('test AbiInfo', () => {

    // tslint:disable-next-line:one-variable-per-declaration
    let a: AbiInfo,
        f: AbiFunction,
        tx: Transaction,
        serialized: string;

    a = AbiInfo.parseJson(JSON.stringify(json));
    f = a.getFunction('regIDWithPublicKey');
    test('test read json', () => {

        expect(f.parameters.length).toEqual(2);

        const ontidhex = str2hexstr('did:ont:TQLASLtT6pWbThcSCYU1biVqhMnzhTgLFq');
        const p1 = new Parameter('ontid', ParameterType.ByteArray, ontidhex);
        // tslint:disable-next-line:max-line-length
        const p2 = new Parameter('publicKey', ParameterType.ByteArray, '039fbb47841f7338c0c654addd6225995642b5b6d492413563f7f8755ba83c0ecd');

        f.setParamsValue(p1, p2);

        // tslint:disable-next-line:no-console
        console.log(f);

    });

	   test('test getFunction throws error if not found', () => {
       expect(() => a.getFunction('not_a_function')).toThrowError('not found');
   });

    test('test make invokecode tx', () => {
        tx = makeInvokeTransaction( f.name, f.parameters, new Address(a.getHash()), '0');
        // tslint:disable-next-line:no-console
        console.log(tx);

        serialized = tx.serialize();
        // tslint:disable-next-line:no-console
        console.log('serialize: ' + serialized);
        expect(serialized).toBeDefined();
    });
});
