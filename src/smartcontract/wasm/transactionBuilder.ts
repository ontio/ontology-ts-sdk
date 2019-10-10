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

import Fixed64 from '../../common/fixed64';
import { Address } from '../../crypto';
import InvokeCode from '../../transaction/payload/invokeCode';
import { writeVarBytes } from '../../utils';
import { buildWasmContractParam } from './../../transaction/scriptBuilder';
import { Transaction, TxType } from './../../transaction/transaction';
import { Parameter, ParameterType } from './../abi/parameter';

export function buildWasmVmInvokeCode(contractaddress: Address, params: Parameter[]): string {
    let result = '';
    result += contractaddress.serialize();
    const args = buildWasmContractParam(params);
    result += writeVarBytes(args);
    return result;
}

/**
 * Creates transaction to inovke wasm vm smart contract
 * @param funcName Function name of smart contract
 * @param params Array of Parameters or serialized parameters
 * @param contractAddress Address of contract
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for gas
 */
export function makeWasmVmInvokeTransaction(
    funcName: string,
    params: Parameter[],
    contractAddress: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const tx = new Transaction();
    tx.type = TxType.InvokeWasm;

    const paramFunc = new Parameter('method', ParameterType.String, funcName);
    const paramsAll = [paramFunc, ...params];
    const code = buildWasmVmInvokeCode(contractAddress, paramsAll);
    const payload = new InvokeCode();
    payload.code = code;
    tx.payload = payload;

    if (gasLimit) {
        tx.gasLimit = new Fixed64(gasLimit);
    }
    if (gasPrice) {
        tx.gasPrice = new Fixed64(gasPrice);
    }
    if (payer) {
        tx.payer = payer;
    }
    return tx;
}
