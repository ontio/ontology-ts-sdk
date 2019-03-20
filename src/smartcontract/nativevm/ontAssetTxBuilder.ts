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
import BigInt from '../../common/bigInt';
import { TOKEN_TYPE } from '../../consts';
import { Address } from '../../crypto';
import { ERROR_CODE } from '../../error';
import { Transaction } from '../../transaction/transaction';
import { Transfer } from '../../transaction/transfer';
import { hex2VarBytes, hexstr2str, StringReader } from '../../utils';
import { makeNativeContractTx } from './../../transaction/transactionUtils';
import { buildNativeCodeScript } from './../abi/nativeVmParamsBuilder';
import Struct from './../abi/struct';

export const ONT_CONTRACT = '0000000000000000000000000000000000000001';
export const ONG_CONTRACT = '0000000000000000000000000000000000000002';

/**
 * Get the address of native asset contract
 * @param tokenType Token type. Can only be ONT or ONG
 */
export function getTokenContract(tokenType: string) {
    if (tokenType === TOKEN_TYPE.ONT) {
        return new Address(ONT_CONTRACT);
    } else if (tokenType === TOKEN_TYPE.ONG) {
        return new Address(ONG_CONTRACT);
    } else {
        throw new Error('Error token type.');
    }
}

/**
 * Verify amount
 * @param amount Amount
 */
export function verifyAmount(amount: number | string) {
    const value = new BigNumber(amount);

    if (!value.isInteger() || value.lte(new BigNumber(0))) {
        throw new Error('Amount is invalid.');
    }
}

/**
 * Creates transaction to transfer native assets.
 * @param tokenType ONT or ONG
 * @param from sender's address
 * @param to receiver's address
 * @param amount Amount of amount to transfer
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for transaction's gas.
 */
export function makeTransferTx(
    tokenType: string,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transfer {
    verifyAmount(amount);
    const num = new BigNumber(amount);
    const struct = new Struct();
    struct.add(from, to, num);
    const list = [];
    list.push([struct]);
    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit) as any;
    tx.tokenType = tokenType;
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transfer';

    if (payer) {
        tx.payer = payer;
    } else {
        tx.payer = from;
    }
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
export function makeTransferToMany(
    tokenType: string,
    from: Address,
    to: Address[],
    amounts: string | number [],
    gasPrice: string,
    gasLimit: string
): Transaction {

    if (to.length !== amounts.length) {
        throw new Error('Params error.');
    }

    const structs = [];
    for (let i = 0; i < to.length; i++) {
        verifyAmount(amounts[i]);
        const s = new Struct();
        s.add(from, to[i], new BigNumber(amounts[i]));
        structs.push(s);
    }

    const list = [];
    list.push(structs);

    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit) as any;
    tx.payer = from;
    return tx;
}

/**
 * Withdraw ong from sender's address and send to receiver's address
 * @param from Sender's address
 * @param to Receiver's address
 * @param amount Amount of ONG to withdraw.The value needs to multiply 1e9 to keep precision
 * @param payer Address to pay for transaction's gas
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeWithdrawOngTx(from: Address, to: Address, amount: number | string, payer: Address,
                                  gasPrice: string, gasLimit: string): Transfer {
    verifyAmount(amount);
    const num = new BigNumber(amount);

    // const tf = new TransferFrom(from, new Address(ONT_CONTRACT), to, amount);
    // const params = tf.serialize();
    const list = [];
    const struct = new Struct();
    struct.add(from, new Address(ONT_CONTRACT), to, num);
    list.push(struct);
    const args = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx(
        'transferFrom', args, new Address(ONG_CONTRACT) , gasPrice, gasLimit) as any;
    tx.payer = payer;
    tx.tokenType = 'ONG';
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transferFrom';
    return tx;
}

/**
 * Creates transaction to query allowance that can be sent from sender to receiver
 * @param asset Asset type. Only ONT or ONg.
 * @param from Sender's address
 * @param to Receiver's address
 */
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
    const struct = new Struct();
    struct.add(from, to);
    list.push(struct);
    const params = buildNativeCodeScript(list);
    const tx = makeNativeContractTx('allowance', params, new Address(contract), '0', '0');
    return tx;
}

/**
 * Creates transaction to query balance.
 * @param asset Token type,ont or ong
 * @param address Address to query balance
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

export function deserializeTransferTx(str: string): Transfer {
    const tx: Transfer = Transaction.deserialize(str) as any;
    const code = tx.payload.serialize();
    const contractIndex1 = code.lastIndexOf('14' + '000000000000000000000000000000000000000');
    const contractIndex2 = code.lastIndexOf('14' + '0000000000000000000000000000000000000002');
    if (contractIndex1 > 0 && code.substr(contractIndex1 + 41, 1) === '1') {
        tx.tokenType = 'ONT';
    } else if (contractIndex1 > 0 && code.substr(contractIndex1 + 41, 1) === '2') {
        tx.tokenType = 'ONG';
    } else {
        throw new Error('Not a transfer tx');
    }
    const contractIndex = Math.max(contractIndex1, contractIndex2);
    const params = code.substring(0, contractIndex);
    const paramsEnd = params.indexOf('6a7cc86c') + 8;
    if (params.substr(paramsEnd, 4) === '51c1') { // transfer
        const methodStr = params.substring(paramsEnd + 6);
        tx.method = hexstr2str(methodStr);
    } else {
        const methodStr = params.substring(paramsEnd + 2);
        tx.method = hexstr2str(methodStr);
    }

    if (tx.method === 'transfer') {
        const sr = new StringReader(params);
        // const codeLength = sr.readNextLen();
        // const bytes = sr.read(4);
        sr.pos += 10;
        const from = new Address(sr.read(20));
        tx.from = from;
        // const bytes2 = sr.read(4);
        sr.pos += 8;
        const to = new Address(sr.read(20));
        tx.to = to;
        // const bytes3 = sr.read(3);
        sr.pos += 6;
        const numTmp = parseInt(sr.read(1), 16);
        if (sr.str.substr(sr.pos, 6) === '6a7cc8') {
            tx.amount = numTmp - 80;
        } else {
            const amount = BigInt.fromHexstr(sr.read(numTmp)).value;
            tx.amount = new BigNumber(amount).toString();
        }
    } else if (tx.method === 'transferFrom') {
        const sr = new StringReader(params);
        // const codeLength = sr.readNextLen();
        // const bytes = sr.read(4);
        sr.pos += 10;
        const from = new Address(sr.read(20));
        tx.from = from;
        // const bytes1 = sr.read(4);
        // const contract = new Address(sr.read(20));
        // const bytes2 = sr.read(4);
        sr.pos += 56;
        const to = new Address(sr.read(20));
        tx.to = to;
        // const bytes3 = sr.read(3);
        sr.pos += 6;
        const numTmp = parseInt(sr.read(1), 16);
        if (sr.str.substr(sr.pos, 6) === '6a7cc8') {
            tx.amount = numTmp - 80;
        } else {
            const amount = BigInt.fromHexstr(sr.read(numTmp)).value;
            tx.amount = new BigNumber(amount).toString();
        }
    } else {
        throw new Error('Not a transfer tx');
    }

    return tx;
}
