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
import {Address,} from '../../../src/crypto';
import {RpcClient} from '../../../src';

describe('test getBalanceV2', () => {
    test('getBalanceV2', async () => {
        const rpcClient = new RpcClient('http://172.168.3.73:20336');
        const to = new Address('ATrsfFRuAEcHNznnuLmJgC5A4Gm2Yit9XZ');
        const result = await rpcClient.getBalanceV2(to);
        console.log(result);
        expect(result).toBeTruthy();
        // ont 10000000000000 9999000000000
        // ong 500000000000000000000
    }, 10000);
});

