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
import { Parameter, Transaction } from '../../index';
import { ParameterType } from '../abi/parameter';
import { Address } from './../../crypto/address';
import { makeInvokeTransaction } from './../../transaction/transactionBuilder';

const functionNames = {
    Init: 'init',
    Transfer: 'transfer',
    BalanceOf: 'balanceOf',
    TotalSupply: 'totalSupply',
    Symbol: 'symbol',
    Decimals: 'decimals',
    Name: 'name'
};
/**
 * Transaction builder for nep-5 contracts
 */
export default class Nep5TxBuilder {

    /**
     * Init the nep-5 smart contract
     * @param contractAddr Address of contract
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer's address to pay for gas
     */
    static init(contractAddr: Address, gasPrice: string, gasLimit: string, payer?: Address): Transaction {
        const funcName = functionNames.Init;
        return makeInvokeTransaction(funcName, [], contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Make transaction for transfer
     * @param contractAddr Address of nep-5 contract
     * @param from Sender's address
     * @param to Receiver's address
     * @param amount Amountof asset to transfer
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer's address to pay for gas
     */
    static makeTransferTx(
        contractAddr: Address,
        from: Address,
        to: Address,
        amount: number,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const funcName = functionNames.Transfer;
        const p1 = new Parameter('from', ParameterType.ByteArray, from.serialize());
        const p2 = new Parameter('to', ParameterType.ByteArray, to.serialize());
        const p3 = new Parameter('value', ParameterType.Integer, amount);
        return makeInvokeTransaction(funcName, [p1, p2, p3], contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Query the balance
     * @param contractAddr Address of nep-5 contract
     * @param address Address to query balance
     */
    static queryBalanceOf(contractAddr: Address, address: Address): Transaction {
        const funcName = functionNames.BalanceOf;
        const p1 = new Parameter('from', ParameterType.ByteArray, address.serialize());

        return makeInvokeTransaction(funcName, [p1], contractAddr);
    }

    /**
     * Query the total supply of nep-5 contract
     * @param contractAddr Address of nep-5 contract
     */
    static queryTotalSupply(contractAddr: Address): Transaction {
        const funcName = functionNames.TotalSupply;
        return makeInvokeTransaction(funcName, [], contractAddr);
    }

    /**
     * Query the total supply of nep-5 contract
     * @param contractAddr Address of nep-5 contract
     */
    static queryDecimals(contractAddr: Address): Transaction {
        const funcName = functionNames.Decimals;
        return makeInvokeTransaction(funcName, [], contractAddr);
    }

    /**
     * Query the total supply of nep-5 contract
     * @param contractAddr Address of nep-5 contract
     */
    static querySymbol(contractAddr: Address): Transaction {
        const funcName = functionNames.Symbol;
        return makeInvokeTransaction(funcName, [], contractAddr);
    }

    /**
     * Query the total supply of nep-5 contract
     * @param contractAddr Address of nep-5 contract
     */
    static queryName(contractAddr: Address): Transaction {
        const funcName = functionNames.Name;
        return makeInvokeTransaction(funcName, [], contractAddr);
    }
}
