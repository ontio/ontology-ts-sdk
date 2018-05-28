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
import Fixed64 from '../common/fixed64';
import { TOKEN_TYPE } from '../consts';
import { Address } from '../crypto';
import InvokeCode from '../transaction/payload/invokeCode';
import { Fee, Transaction, TxType } from '../transaction/transaction';
import { VmCode, VmType } from '../transaction/vmcode';
import { Contract, State, TransferFrom, Transfers } from './token';

export const ONT_CONTRACT = 'ff00000000000000000000000000000000000001';
export const ONG_CONTRACT = 'ff00000000000000000000000000000000000002';

export function getTokenContract(tokenType: string) {
    if (tokenType === TOKEN_TYPE.ONT) {
        return ONT_CONTRACT;
    } else if (tokenType === TOKEN_TYPE.ONG) {
        return ONG_CONTRACT;
    } else {
        throw new Error('Error token type.');
    }
}

export function verifyAmount(amount: string) {
    const value = new BigNumber(amount);

    if (!value.isInteger() || value <= new BigNumber(0)) {
        throw new Error('Amount is invalid.');
    }
}

function makeInvokeCodeTransacton(contract: Contract, vmType: VmType, gasPrice: string, gasLimit: string): Transaction {
    const tx = new Transaction();
    tx.type = TxType.Invoke;

    let code = '';
    code += contract.serialize();
    const vmcode = new VmCode();
    vmcode.code = code;
    vmcode.vmType = VmType.NativeVM;
    const invokeCode = new InvokeCode();
    invokeCode.code = vmcode;
    tx.payload = invokeCode;

    // gas
    // if (DEFAULT_GAS_LIMIT === Number(0)) {
    //     tx.gasPrice = new Fixed64();
    // } else {
    //     const price = new BigNumber(gas).multipliedBy(1e9).dividedBy(new BigNumber(DEFAULT_GAS_LIMIT)).toString();
    //     tx.gasPrice = new Fixed64(price);
    // }
    tx.gasLimit = new Fixed64(gasLimit);
    tx.gasPrice = new Fixed64(gasPrice);

    return tx;
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
    amount: string,
    gasPrice: string,
    gasLimit: string
): Transaction {
    verifyAmount(amount);

    const state = new State();
    state.from = from;
    state.to = to;

    // let valueToSend: string;
    // if (tokenType === 'ONT') {
    //     valueToSend = new BigNumber(amount).toString();
    // } else {
    //     // multi 10^9 to keep precision for ong transfer
    //     valueToSend = new BigNumber(amount).multipliedBy(1e9).toString();
    // }

    state.value = new Fixed64(amount);
    const transfer = new Transfers();
    transfer.states = [state];

    const contract = new Contract();
    contract.address = getTokenContract(tokenType);
    contract.method = 'transfer';
    contract.args = transfer.serialize();

    const tx = makeInvokeCodeTransacton(contract, VmType.NativeVM, gasPrice, gasLimit);
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
export function makeTransferFromManyTx(
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
        const s = new State();
        s.from = from[i];
        s.to = to;
        verifyAmount(amounts[i]);
        s.value = new Fixed64(amounts[i]);
        states[i] = s;
    }

    const transfers = new Transfers();
    transfers.states = states;
    const contract = new Contract();
    contract.address = getTokenContract(tokenType);
    contract.method = 'transfer';
    contract.args = transfers.serialize();

    const tx = makeInvokeCodeTransacton(contract, VmType.NativeVM, gasPrice, gasLimit);
    tx.payer = from[0];
    return tx;
}

/**
 * transfer from one sender to multiple receivers
 * @param tokenType
 * @param from
 * @param to
 * @param amounts
 */
export function makeTransferToMany(
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
        const s = new State();
        s.from = from;
        s.to = to[i];

        verifyAmount(amounts[i]);
        s.value = new Fixed64(amounts[i]);
        states[i] = s;
    }

    const transfers = new Transfers();
    transfers.states = states;
    const contract = new Contract();
    contract.address = getTokenContract(tokenType);
    contract.method = 'transfer';
    contract.args = transfers.serialize();

    const tx = makeInvokeCodeTransacton(contract, VmType.NativeVM, gasPrice, gasLimit);
    tx.payer = from;
    return tx;
}

/**
 * claim ong from sender's address and send to receiver's address
 * @param from sender's address
 * @param to receiver's address
 * @param amount
 */
export function makeClaimOngTx(from: Address, to: Address, amount: string,
                               gasPrice: string, gasLimit: string): Transaction {
    verifyAmount(amount);

    const tf = new TransferFrom(from, new Address(ONT_CONTRACT), to, new BigNumber(Number(amount)).toString());
    const contract = new Contract();
    contract.address = ONG_CONTRACT;
    contract.method = 'transferFrom';
    contract.args = tf.serialize();

    const fee = new Fee();
    fee.amount = new Fixed64();
    fee.payer = from;
    const tx = makeInvokeCodeTransacton(contract, VmType.NativeVM, gasPrice, gasLimit);
    tx.payer = from;
    return tx;
}
