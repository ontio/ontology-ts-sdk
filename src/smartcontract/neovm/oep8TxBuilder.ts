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
import { Address } from './../../crypto/address';
import { makeInvokeTransaction } from './../../transaction/transactionBuilder';
import { num2hexstring } from './../../utils';
import { Parameter, ParameterType } from './../abi/parameter';

export class Oep8State {
    public from: string;
    public to: string;
    public tokenId: string;
    public value: BigNumber;

    public constructor(from: Address, to: Address, tokenId: number, value: string) {
        this.from = from.serialize();
        this.to = to.serialize();
        this.tokenId = num2hexstring(tokenId);
        this.value = new BigNumber(value);
    }
}

export class TransferFrom {
    spender: string;
    from: string;
    to: string;
    tokenId: string;
    value: BigNumber;
    constructor(spender: Address, from: Address, to: Address, tokenId: number, value: string) {
        this.spender = spender.serialize();
        this.from = from.serialize();
        this.to = to.serialize();
        this.tokenId = num2hexstring(tokenId);
        this.value = new BigNumber(value);
    }
}

const FunctionNames = {
    Name: 'name',
    Symbol: 'symbol',
    TotalSupply: 'totalSupply',
    BalanceOf: 'balanceOf',
    Transfer: 'transfer',
    TransferMulti: 'transferMulti',
    Approve: 'approve',
    ApproveMulti: 'approveMulti',
    Allowance: 'allowance',
    TransferFrom: 'transferFrom',
    TransferFromMulti: 'transferFromMulti',
    Compound: 'compound',
    Concatkey: 'concatkey',
    Init: 'init',
    CreateMultiKindsPumpkin: 'createMultiKindsPumpkin',
    CheckTokenPrefix: 'checkTokenPrefix',
    BalancesOf: 'balancesOf',
    TotalBalanceOf: 'totalBalanceOf',
    CheckTokenId: 'checkTokenId'
};

export class Oep8TxBuilder {
    contractAddr: Address;

    constructor(contractAddr: Address) {
        this.contractAddr = contractAddr;
    }

    makeInitTx(
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Init;
        return makeInvokeTransaction(func, [], this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeTransferTx(
        sendAddr: Address,
        recvAddr: Address,
        tokenId: number,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Transfer;
        const params = [
            new Parameter('sender', ParameterType.ByteArray, sendAddr.serialize()),
            new Parameter('recv', ParameterType.ByteArray, recvAddr.serialize()),
            new Parameter('tokenId', ParameterType.ByteArray, tokenId),
            new Parameter('amount', ParameterType.Long, amount)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeTransferMultiTx(
        states: Oep8State[],
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const list = [];
        list.push(str2hexstr(FunctionNames.TransferMulti));
        const temp = [];
        for (const state of states) {
            temp.push([
                state.from,
                state.to,
                state.tokenId,
                state.value
            ]);
        }
        list.push(temp);
        const params = createCodeParamsScript(list);
        return makeInvokeTransaction('', params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeApproveTx(
        owner: Address,
        spender: Address,
        tokenId: number,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Approve;
        const params = [
            new Parameter('owner', ParameterType.ByteArray, owner.serialize()),
            new Parameter('spender', ParameterType.ByteArray, spender.serialize()),
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId)),
            new Parameter('amount', ParameterType.Long, amount)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeApproveMulti(
        states: Oep8State[],
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.ApproveMulti;
        const list = [];
        list.push(str2hexstr(func));
        const temp = [];
        for (const state of states) {
            temp.push([
                state.from,
                state.to,
                state.tokenId,
                state.value
            ]);
        }
        list.push(temp);
        const params = createCodeParamsScript(list);
        return makeInvokeTransaction('', params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeTransferFromMulti(
        states: TransferFrom[],
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.TransferFromMulti;
        const list = [];
        list.push(str2hexstr(func));
        const temp = [];
        for (const state of states) {
            temp.push([
                state.spender,
                state.from,
                state.to,
                state.tokenId,
                state.value
            ]);
        }
        list.push(temp);
        const params = createCodeParamsScript(list);
        return makeInvokeTransaction('', params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeTransferFromTx(
        sender: Address,
        from: Address,
        to: Address,
        tokenId: number,
        amount: string,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.TransferFrom;
        const params = [
            new Parameter('sender', ParameterType.ByteArray, sender.serialize()),
            new Parameter('from', ParameterType.ByteArray, from.serialize()),
            new Parameter('to', ParameterType.ByteArray, to.serialize()),
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId)),
            new Parameter('amount', ParameterType.Long, amount)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Compound tokens
     * @param account User's address
     * @param compoundNum 0 - compound all tokens that can be compounded; 1 - compound 1 token of each type.
     * @param gasPrice Gas price
     * @param gasLimit Gas limit
     * @param payer Payer to pay for gas
     */
    makeCompoundTx(
        account: Address,
        compoundNum: number,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Compound;
        const params = [
            new Parameter('account', ParameterType.ByteArray, account.serialize()),
            new Parameter('compoundNum', ParameterType.Integer, compoundNum)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeQueryAllowanceTx(
        owner: Address,
        spender: Address,
        tokenId: number
    ): Transaction {
        const func = FunctionNames.Allowance;
        const params = [
            new Parameter('owner', ParameterType.ByteArray, owner.serialize()),
            new Parameter('spender', ParameterType.ByteArray, spender.serialize()),
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId))
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryBalanceOfTx(
        addr: Address,
        tokenId: number
    ): Transaction {
        const func = FunctionNames.BalanceOf;
        const params = [
            new Parameter('addr', ParameterType.ByteArray, addr.serialize()),
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId))
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryTotalSupplyTx(
        tokenId: number
    ): Transaction {
        const func = FunctionNames.TotalSupply;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId))
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryNameTx(
        tokenId: number
    ): Transaction {
        const func = FunctionNames.Name;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId))
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryDecimalsTx(): Transaction {
        const func = FunctionNames.Symbol;
        return makeInvokeTransaction(func, [], this.contractAddr);
    }

    makeQuerySymbolTx(
        tokenId: number
    ): Transaction {
        const func = FunctionNames.Symbol;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, num2hexstring(tokenId))
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryBalancesTx(
        account: Address
    ): Transaction {
        const func = FunctionNames.BalancesOf;
        const params = [
            new Parameter('account', ParameterType.ByteArray, account.serialize())
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryTotalBalanceTx(
        account: Address
    ): Transaction {
        const func = FunctionNames.TotalBalanceOf;
        const params = [
            new Parameter('account', ParameterType.ByteArray, account.serialize())
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }
}
