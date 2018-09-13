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

import AbiFunction from '../smartcontract/abi/abiFunction';
import { serializeAbiFunction } from '../transaction/scriptBuilder';
import { num2hexstring, randomBytes } from '../utils';
import { Address } from './../crypto/address';
import { TransactionAttribute, TransactionAttributeUsage } from './../transaction/txAttribute';
import { InvocationTransaction } from './InvocationTransaction';
export class SmartContract {
    static makeInvokeTransaction(contractAddr: Address, addr: Address, abiFunction: AbiFunction) {
        let params = serializeAbiFunction(abiFunction);
        params += num2hexstring(0x67);
        params += contractAddr.serialize();
        const tx = this.makeInvocationTransaction(params, addr);
        return tx;
    }

    static makeInvocationTransaction(params: string, addr: Address) {
        const tx = new InvocationTransaction();
        tx.version = 1;
        tx.attributes = [];
        const attr1 = new TransactionAttribute();
        attr1.usage = TransactionAttributeUsage.Script;
        attr1.data = addr.serialize();
        tx.attributes[0] = attr1;
        const attr2 = new TransactionAttribute();
        attr2.usage = TransactionAttributeUsage.DescriptionUrl;
        attr2.data = randomBytes(16);
        tx.attributes[1] = attr2;
        tx.inputs = [];
        tx.outputs = [];
        tx.script = params;
        tx.gas = 0;
        return tx;
    }
}
