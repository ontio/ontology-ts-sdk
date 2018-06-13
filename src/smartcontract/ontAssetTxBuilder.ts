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
import { BigNumber } from 'bignumber.js';
import { TOKEN_TYPE } from '../consts';
import { Address } from '../crypto';
import { ERROR_CODE } from '../error';
import { Transaction } from '../transaction/transaction';
import { hex2VarBytes } from '../utils';
import { makeNativeContractTx } from './../transaction/transactionBuilder';
import { buildNativeCodeScript } from './abi/nativeParamsBuilder';
import Struct from './abi/struct';

export const ONT_CONTRACT = '0000000000000000000000000000000000000001';
export const ONG_CONTRACT = '0000000000000000000000000000000000000002';

export function getTokenContract(tokenType: string) {
    if (tokenType === TOKEN_TYPE.ONT) {
        return new Address(ONT_CONTRACT);
    } else if (tokenType === TOKEN_TYPE.ONG) {
        return new Address(ONG_CONTRACT);
    } else {
        throw new Error('Error token type.');
    }
}

export function verifyAmount(amount: number | string) {
    const value = new BigNumber(amount);

    if (!value.isInteger() || value <= new BigNumber(0)) {
        throw new Error('Amount is invalid.');
    }
}

/**
 * @param tokenType
 * @param from sender's address
 * @param to receiver's address
 * @param amount
 * @param gasPrice
 * @param gasLimit
 */
export function makeTransferTx(
    tokenType: string,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string
): Transaction {
    amount = Number(amount);
    verifyAmount(amount);
    // const state = new State(from, to, amount);
    // const transfer = new Transfers();
    // transfer.states = [state];
    // const params = transfer.serialize();
    const struct = Struct.add(from, to, amount);
    const list = [];
    list.push([struct]);
    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit);
    tx.payer = from;
    return tx;
}

/**
 * transfer from multiple senders to one receiver
 * this tx needs multiple senders' signature.
 * @param tokenType
 * @param from array of senders' address
 * @param to receiver's address
 * @param amounts
 */
/* export function makeTransferFromManyTx(
    tokenType: string,
    from: Address[],
    to: Address,
    amounts: string[],
    gasPrice: string,
    gasLimit: string
): Transaction {
    const states = new Array<State>(from.length);

    if (from.length !== amounts.length) {
        throw new Error('Params error.');
    }
    for (let i = 0; i < from.length; i++) {
        verifyAmount(amounts[i]);
        const s = new State(from[i], to, amounts[i]);
        states[i] = s;
    }

    const transfers = new Transfers();
    transfers.states = states;

    const contract = getTokenContract(tokenType);
    const params = transfers.serialize();
    const tx = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit);
    tx.payer = from[0];
    return tx;
} */

/**
 * transfer from one sender to multiple receivers
 * @param tokenType
 * @param from
 * @param to
 * @param amounts
 */
/* export function makeTransferToMany(
    tokenType: string,
    from: Address,
    to: Address[],
    amounts: string[],
    gasPrice: string,
    gasLimit: string
): Transaction {
    const states = new Array<State>(to.length);

    if (to.length !== amounts.length) {
        throw new Error('Params error.');
    }

    for (let i = 0; i < to.length; i++) {
        verifyAmount(amounts[i]);
        const s = new State(from, to[i], amounts[i]);
        states[i] = s;
    }

    const transfers = new Transfers();
    transfers.states = states;

    const contract = getTokenContract(tokenType);
    const params = transfers.serialize();
    const tx = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit);
    tx.payer = from;
    return tx;
} */

/**
 * claim ong from sender's address and send to receiver's address
 * @param from sender's address
 * @param to receiver's address
 * @param amount
 */
export function makeClaimOngTx(from: Address, to: Address, amount: number | string, payer: Address,
                               gasPrice: string, gasLimit: string): Transaction {
    amount = Number(amount);
    verifyAmount(amount);

    // const tf = new TransferFrom(from, new Address(ONT_CONTRACT), to, amount);
    // const params = tf.serialize();
    const list = [];
    list.push(Struct.add(from, new Address(ONT_CONTRACT), to, amount));
    const args = buildNativeCodeScript(list);
    const tx = makeNativeContractTx('transferFrom', args, new Address(ONG_CONTRACT) , gasPrice, gasLimit);
    tx.payer = payer;
    return tx;
}

export function makeQueryAllowanceTx(asset: string, from: Address, to: Address): Transaction {
    asset = asset.toLowerCase();
    if (asset !== 'ont' && asset !== 'ong') {
        throw ERROR_CODE.INVALID_PARAMS;
    }

    let contract = '';
    if (asset === 'ong') {
        contract = ONG_CONTRACT;
    } else {
        contract = ONT_CONTRACT;
    }
    const list = [];
    const struct = Struct.add(from, to);
    list.push(struct);
    const params = buildNativeCodeScript(list);
    const tx = makeNativeContractTx('allowance', params, new Address(contract), '0', '0');
    return tx;
}

/**
 * The result is hex decimal
 * @param asset Token type,ont or ong
 * @param address
 */
export function makeQueryBalanceTx(asset: string,  address: Address): Transaction {
    asset = asset.toLowerCase();
    if (asset !== 'ont' && asset !== 'ong') {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    let contract = '';
    if (asset === 'ong') {
        contract = ONG_CONTRACT;
    } else {
        contract = ONT_CONTRACT;
    }
    const params = hex2VarBytes(address.serialize());
    const tx = makeNativeContractTx('balanceOf', params, new Address(contract), '0', '0');
    return tx;
}
