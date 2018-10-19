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
import { createCodeParamsScript } from '../../transaction/scriptBuilder';
import { Transaction } from '../../transaction/transaction';
import { str2hexstr } from '../../utils';
import { Parameter, ParameterType } from '../abi/parameter';
import { Address } from './../../crypto/address';
import { makeInvokeTransaction } from './../../transaction/transactionBuilder';

const functionNames = {
    Init: 'init',
    Transfer: 'transfer',
    TransferMulti: 'transferMulti',
    Approve: 'approve',
    TransferFromm: 'transferFrom',
    Allowance: 'allowance',
    BalanceOf: 'balanceOf',
    TotalSupply: 'totalSupply',
    Symbol: 'symbol',
    Decimals: 'decimals',
    Name: 'name'
};

export class Oep4State  {
    from: string;
    to: string;
    amount: BigNumber;

    constructor(from: Address, to: Address, amount: string) {
        this.from = from.serialize();
        this.to = to.serialize();
        this.amount = new BigNumber(amount);
    }
}
/**
 * Transaction builder for oep-4 contracts
 */
export class Oep4TxBuilder {

    contractAddr: Address;

    constructor(contractAddr: Address) {
        this.contractAddr = contractAddr;
    }

    /**
     * Init the oep-4 smart contract
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer's address to pay for gas
     */
    init(gasPrice: string, gasLimit: string, payer?: Address): Transaction {
        const funcName = functionNames.Init;
        return makeInvokeTransaction(funcName, [], this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Make transaction for transfer
     * @param from Sender's address
     * @param to Receiver's address
     * @param amount Amountof asset to transfer
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer's address to pay for gas
     */
    makeTransferTx(
        from: Address,
        to: Address,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const funcName = functionNames.Transfer;
        const p1 = new Parameter('from', ParameterType.ByteArray, from.serialize());
        const p2 = new Parameter('to', ParameterType.ByteArray, to.serialize());
        const p3 = new Parameter('value', ParameterType.Long, amount);
        return makeInvokeTransaction(funcName, [p1, p2, p3], this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Make transaction for multi transfer.
     * The transaction needs signatures of each sender in states and the signature of the payer.
     * @param states Array of State(sender, receiver, amount)
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer to pay for gas
     */
    makeTransferMultiTx(
        states: Oep4State[],
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const list = [];
        list.push(str2hexstr(functionNames.TransferMulti));
        const temp = [];
        for (const state of states) {
            temp.push([
                state.from,
                state.to,
                state.amount
            ]);
        }
        list.push(temp);
        const params = createCodeParamsScript(list);
        return makeInvokeTransaction('', params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Make transaction for approve
     * @param owner Owner's address
     * @param spender Spender's address
     * @param amount Amount
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer to pay for gas
     */
    makeApproveTx(
        owner: Address,
        spender: Address,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const funcName = functionNames.Approve;
        const params = [
            new Parameter('owner', ParameterType.ByteArray, owner.serialize()),
            new Parameter('spender', ParameterType.ByteArray, spender.serialize()),
            new Parameter('amount', ParameterType.Long, amount)
        ];
        return makeInvokeTransaction(funcName, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeTransferFromTx(
        sender: Address,
        from: Address,
        to: Address,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const funcName = functionNames.TransferFromm;
        const params = [
            new Parameter('owner', ParameterType.ByteArray, sender.serialize()),
            new Parameter('from', ParameterType.ByteArray, from.serialize()),
            new Parameter('to', ParameterType.ByteArray, to.serialize()),
            new Parameter('amount', ParameterType.Long, amount)
        ];
        return makeInvokeTransaction(funcName, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeQueryAllowanceTx(
        owner: Address,
        spender: Address
    ): Transaction {
        const funcName = functionNames.Allowance;
        const params = [
            new Parameter('owner', ParameterType.ByteArray, owner.serialize()),
            new Parameter('spender', ParameterType.ByteArray, spender.serialize())
        ];
        return makeInvokeTransaction(funcName, params, this.contractAddr);
    }

    /**
     * Query the balance
     * @param address Address to query balance
     */
    queryBalanceOf(address: Address): Transaction {
        const funcName = functionNames.BalanceOf;
        const p1 = new Parameter('from', ParameterType.ByteArray, address.serialize());

        return makeInvokeTransaction(funcName, [p1], this.contractAddr);
    }

    /**
     * Query the total supply of oep-4 contract
     */
    queryTotalSupply(): Transaction {
        const funcName = functionNames.TotalSupply;
        return makeInvokeTransaction(funcName, [], this.contractAddr);
    }

    /**
     * Query the total supply of oep-4 contract
     */
    queryDecimals(): Transaction {
        const funcName = functionNames.Decimals;
        return makeInvokeTransaction(funcName, [], this.contractAddr);
    }

    /**
     * Query the total supply of oep-4 contract
     */
    querySymbol(): Transaction {
        const funcName = functionNames.Symbol;
        return makeInvokeTransaction(funcName, [], this.contractAddr);
    }

    /**
     * Query the total supply of oep-4 contract
     */
    queryName(): Transaction {
        const funcName = functionNames.Name;
        return makeInvokeTransaction(funcName, [], this.contractAddr);
    }
}
