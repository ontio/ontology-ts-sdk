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

import { createCodeParamsScript } from '../../transaction/scriptBuilder';
import { Transaction } from '../../transaction/transaction';
import { str2hexstr } from '../../utils';
import { Address } from './../../crypto/address';
import { makeInvokeTransaction } from './../../transaction/transactionBuilder';
import { Parameter, ParameterType } from './../abi/parameter';

export class Oep5Param {
    public toAcct: string; // hex string
    public tokenId: string; // hex string

    public constructor(toAcct: Address, tokenId: string ) {
        this.toAcct = toAcct.serialize();
        this.tokenId = tokenId;
    }
}

const FunctionNames = {
    Init: 'init',
    Name: 'name',
    Symbol: 'symbol',
    TotalSupply: 'totalSupply',
    BalanceOf: 'balanceOf',
    OwnerOf: 'ownerOf',
    Transfer: 'transfer',
    TransferMulti: 'transferMulti',
    Approve: 'approve',
    ApproveMulti: 'approveMulti',
    TakeOwnership: 'takeOwnership',
    QueryTokenIDByIndex: 'queryTokenIDByIndex',
    QueryTokenByID: 'queryTokenByID',
    GetApproved: 'getApproved',
    CreateMultiTokens: 'createMultiTokens',
    CreateOneToken: 'createOneToken'
};

export class Oep5TxBuilder {
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

    makeOwnerOfTx(
        tokenId: string
    ): Transaction {
        const func = FunctionNames.OwnerOf;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    /**
     * Transfer the control to someone else
     * @param oep5Param
     * @param gasPrice
     * @param gasLimit
     * @param payer
     */
    makeTransferTx(
        oep5Param: Oep5Param,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Transfer;
        const params = [
            new Parameter('toAcct', ParameterType.ByteArray, oep5Param.toAcct),
            new Parameter('tokenId', ParameterType.ByteArray, oep5Param.tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Transfer the control to multi people
     */
    makeTransferMultiTx(
        oep5Params: Oep5Param[],
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const list = [];
        list.push(str2hexstr(FunctionNames.TransferMulti));
        const temp = [];
        for (const param of oep5Params) {
            temp.push([
                param.toAcct,
                param.tokenId
            ]);
        }
        list.push(temp);
        const params = createCodeParamsScript(list);
        return makeInvokeTransaction('', params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Approve the token to toAcct address, it can overwrite older approved address
     * @param oep5Param
     * @param gasPrice
     * @param gasLimit
     * @param payer
     */
    makeApproveTx(
        oep5Param: Oep5Param,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.Approve;
        const params = [
            new Parameter('toAcct', ParameterType.ByteArray, oep5Param.toAcct),
            new Parameter('tokenId', ParameterType.ByteArray, oep5Param.tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    /**
     * Take the approved token.
     * @param oep5Param
     * @param gasPrice
     * @param gasLimit
     * @param payer
     */
    makeTakeOwnershipTx(
        oep5Param: Oep5Param,
        gasPrice: string,
        gasLimit: string,
        payer: Address
    ): Transaction {
        const func = FunctionNames.TakeOwnership;
        const params = [
            new Parameter('toAcct', ParameterType.ByteArray, oep5Param.toAcct),
            new Parameter('tokenId', ParameterType.ByteArray, oep5Param.tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr, gasPrice, gasLimit, payer);
    }

    makeQueryBalanceOfTx(
        addr: Address
    ): Transaction {
        const func = FunctionNames.BalanceOf;
        const params = [
            new Parameter('addr', ParameterType.ByteArray, addr.serialize())
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryTotalSupplyTx(): Transaction {
        const func = FunctionNames.TotalSupply;
        return makeInvokeTransaction(func, [], this.contractAddr);
    }

    makeQueryTokenIDByIndexTx(
        index: number
    ): Transaction {
        const func = FunctionNames.QueryTokenIDByIndex;
        const params = [
            new Parameter('index', ParameterType.Long, index)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryTokenByIDTx(
        tokenId: string
    ): Transaction {
        const func = FunctionNames.QueryTokenByID;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeGetApprovedTx(
        tokenId: string
    ): Transaction {
        const func = FunctionNames.GetApproved;
        const params = [
            new Parameter('tokenId', ParameterType.ByteArray, tokenId)
        ];
        return makeInvokeTransaction(func, params, this.contractAddr);
    }

    makeQueryNameTx(): Transaction {
        const func = FunctionNames.Name;
        return makeInvokeTransaction(func, [], this.contractAddr);
    }

    makeQuerySymbolTx(): Transaction {
        const func = FunctionNames.Symbol;
        return makeInvokeTransaction(func, [], this.contractAddr);
    }

}
