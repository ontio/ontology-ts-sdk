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
import { Fee } from './../transaction/transaction';
import { VmCode, VmType } from './../transaction/vmcode';
import { Transaction, TxType } from "../transaction/transaction";
import { State, Transfers, Contract, TransferFrom } from "./token";
import { ab2hexstring } from "../utils";
import InvokeCode from '../transaction/payload/invokeCode';
import { TOKEN_TYPE } from '../consts';
import { PrivateKey, Address } from '../crypto';
import { BigNumber } from 'bignumber.js'
import Fixed64 from '../common/fixed64';
import { ERROR_CODE } from '../error';
import { addressToU160 } from '../core';

export const ONT_CONTRACT = "ff00000000000000000000000000000000000001"
export const ONG_CONTRACT = "ff00000000000000000000000000000000000002"

export function getTokenContract(tokenType : string) {
    if(tokenType === TOKEN_TYPE.ONT) {
        return ONT_CONTRACT;
    } else if (tokenType === TOKEN_TYPE.ONG) {
        return ONG_CONTRACT;
    } else {
        throw new Error('Error token type.')
    }
}

export function verifyAmount(amount : string) {
    if (typeof amount !== 'string' ) {
        throw new Error('Amount should be type string.')
    }
    if (isNaN(parseInt(amount))) {
        throw new Error('Amount can not be transfered to integer.')
    }
}

 function makeInvokeCodeTransacton(contract : Contract, vmType : VmType, fees : Array<Fee> = []) : Transaction {
     let tx = new Transaction()
     tx.type = TxType.Invoke
     tx.fee = fees

     let code = ''
     code += contract.serialize()
     let vmcode = new VmCode()
     vmcode.code = code
     vmcode.vmType = VmType.NativeVM
     let invokeCode = new InvokeCode()
     invokeCode.code = vmcode
     tx.payload = invokeCode
     return tx
}

/**
 * @param tokenType 
 * @param from sender's address
 * @param to receiver's address
 * @param amount  
 */
export function makeTransferTx(tokenType: string, from: Address, to: Address, amount: string) : Transaction {
    verifyAmount(amount)

    let state = new State()
    state.from = from
    state.to = to

    //multi 10^8 to keep precision
    let valueToSend = new BigNumber(Number(amount)).toString()

    state.value = valueToSend
    let transfer = new Transfers()
    transfer.states = [state]

    let contract = new Contract()
    contract.address = getTokenContract(tokenType)
    contract.method = 'transfer'
    contract.args = transfer.serialize()

    let tx = makeInvokeCodeTransacton(contract, VmType.NativeVM)
    return tx
}

/**
 * transfer from multiple senders to one receiver
 * this tx needs multiple senders' signature.
 * @param tokenType
 * @param from array of senders' address
 * @param to receiver's address
 * @param amounts
 */
export function makeTransferFromManyTx(tokenType : string, from : Array<Address>, to : Address, amounts : Array<string>) : Transaction {
    let states = new Array<State>(from.length)

    if(from.length !== amounts.length) {
        throw new Error('Params error.')
    }
    for(let i = 0; i < from.length; i++) {
        let s = new State()
        s.from = from[i]
        s.to = to  
        verifyAmount(amounts[i])
        s.value = amounts[i]
        states[i] = s
    }
    let transfers = new Transfers()
    transfers.states = states
    let contract = new Contract()
    contract.address = getTokenContract(tokenType)
    contract.method = 'transfer'
    contract.args = transfers.serialize()

    let tx = makeInvokeCodeTransacton(contract, VmType.NativeVM)
    return tx
}

/**
 * transfer from one sender to multiple receivers
 * @param tokenType
 * @param from
 * @param to
 * @param amounts
 */
export function makeTransferToMany(tokenType : string, from : Address, to : Array<Address>, amounts : Array<string>) : Transaction {
    let states = new Array<State>(to.length)
    if (to.length !== amounts.length) {
        throw new Error('Params error.')
    }
    for (let i = 0; i < to.length; i++) {
        let s = new State()
        s.from = from
        s.to = to[i]
        verifyAmount(amounts[i])      
        s.value = amounts[i]
        states[i] = s
    }
    let transfers = new Transfers()
    transfers.states = states
    let contract = new Contract()
    contract.address = getTokenContract(tokenType)
    contract.method = 'transfer'
    contract.args = transfers.serialize()

    let tx = makeInvokeCodeTransacton(contract, VmType.NativeVM)
    return tx
}

/**
 * claim ong from sender's address and send to receiver's address
 * @param from sender's address
 * @param to receiver's address
 * @param amount
 */
export function makeClaimOngTx(from : Address, to : Address, amount : string) : Transaction {
    verifyAmount(amount)
    let tf = new TransferFrom(from, new Address(ONT_CONTRACT), to, new BigNumber(Number(amount)).toString())
    let contract = new Contract()
    contract.address = ONG_CONTRACT
    contract.method = 'transferFrom'
    contract.args = tf.serialize()

    let fee = new Fee()
    fee.amount = new Fixed64()
    fee.payer = from
    let tx = makeInvokeCodeTransacton(contract, VmType.NativeVM, [fee])
    return tx
}