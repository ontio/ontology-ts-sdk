
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

import { Address } from '../crypto';
import { makeInvokeTransaction } from '../transaction/transactionBuilder';
import { hex2VarBytes, num2hexstring, num2VarInt, str2hexstr, str2VarBytes, varifyPositiveInt } from '../utils';
import { Transaction } from './../transaction/transaction';
import { VmType } from './../transaction/vmcode';

export const AUTH_CONTRACT = 'ff00000000000000000000000000000000000006';

export function makeInitContractAdminTx(
    adminOntId: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string): Transaction {
    if (adminOntId.substr(0, 3) === 'did') {
        adminOntId = str2hexstr(adminOntId);
    }
    const params = hex2VarBytes(adminOntId);
    const tx = makeInvokeTransaction('initContractAdmin', params, AUTH_CONTRACT,
                                    VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * Transfer the authority to new admin
 * @param contractAddr Uer's contract address
 * @param newAdminOntid New admin's ONT ID. This id must be registered.
 * @param keyNo Original admin's public key id. Use this pk to varify tx.
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeTransferAuthTx(
    contractAddr: string,
    newAdminOntid: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (newAdminOntid.substr(0, 3) === 'did') {
        newAdminOntid = str2hexstr(newAdminOntid);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(newAdminOntid);
    params += num2hexstring(keyNo, 4, true);

    const tx = makeInvokeTransaction('transfer', params, AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * verify the user's token of target contract
 * @param contractAddr user's target contract address
 * @param callerOntId caller's ONT ID.This id must be registered.
 * @param funcName the function to call
 * @param keyNo publicKey's id, use this pk to varify tx
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeVerifyTokenTx(
    contractAddr: string,
    callerOntId: string,
    funcName: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (callerOntId.substr(0, 3) === 'did') {
        callerOntId = str2hexstr(callerOntId);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(callerOntId);
    params += str2VarBytes(funcName);
    params += num2hexstring(keyNo, 4, true);
    const tx = makeInvokeTransaction('verifyToken', params, AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign functions to role. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminOntId admin's ONT ID.This id must be registered.
 * @param role role name
 * @param funcNames array of function name
 * @param keyNo publicKey's id, use the pk to varify tx
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeAssignFuncsToRoleTx(
    contractAddr: string,
    adminOntId: string,
    role: string,
    funcNames: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminOntId.substr(0, 3) === 'did') {
        adminOntId = str2hexstr(adminOntId);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(adminOntId);
    params += str2VarBytes(role);
    params += num2VarInt(funcNames.length);
    for (const f of funcNames) {
        params += str2VarBytes(f);
    }
    params += num2hexstring(keyNo, 4, true);
    const tx = makeInvokeTransaction('assignFuncsToRole', params,
                                    AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign role to ONT IDs. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminOntId admin's ONT ID.This id must be registered.
 * @param role role's name
 * @param ontIds array of ONT ID
 * @param keyNo admin's pk id.use to varify tx.
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeAssignOntIdsToRoleTx(
    contractAddr: string,
    adminOntId: string,
    role: string,
    ontIds: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminOntId.substr(0, 3) === 'did') {
        adminOntId = str2hexstr(adminOntId);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(adminOntId);
    params += str2VarBytes(role);
    params += num2VarInt(ontIds.length);
    for (const i of ontIds) {
        if (i.substr(0, 3) === 'did') {
            params += str2VarBytes(i);
        } else {
            params += hex2VarBytes(i);
        }
    }
    params += num2hexstring(keyNo, 4, true);
    const tx = makeInvokeTransaction('assignOntIDsToRole', params,
        AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * delegate role to others. Can't delegate repeatedly。
 * @param contractAddr target contract's address
 * @param from ONT ID of user that wants to delegate role.This id must be registered.
 * @param to ONT ID of user that will receive role.This id must be registered.
 * @param role role name
 * @param period time of delegate period in second
 * @param level = 1 for now.
 * @param keyNo
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeDelegateRoleTx(
    contractAddr: string,
    from: string,
    to: string,
    role: string,
    period: number,
    level: number = 1,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    varifyPositiveInt(period);
    if (from.substr(0, 3) === 'did') {
        from = str2hexstr(from);
    }
    if (to.substr(0, 3) === 'did') {
        to = str2hexstr(to);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(from);
    params += hex2VarBytes(to);
    params += str2VarBytes(role);
    params += num2hexstring(period, 4, true);
    params += num2hexstring(level, 4, true);
    params += num2hexstring(keyNo, 4, true);
    const tx = makeInvokeTransaction('delegate', params,
        AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * role's owner can withdraw the delegate in advance
 * @param contractAddr target contract's address
 * @param initiator ONT ID of role's owner.This id must be registered.
 * @param delegate ONT ID of role's agent.This id must be registered.
 * @param role role's name
 * @param keyNo
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeWithdrawRoleTx(
    contractAddr: string,
    initiator: string,
    delegate: string,
    role: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (initiator.substr(0, 3) === 'did') {
        initiator = str2hexstr(initiator);
    }
    if (delegate.substr(0, 3) === 'did') {
        delegate = str2hexstr(delegate);
    }
    let params = '';
    params += hex2VarBytes(contractAddr);
    params += hex2VarBytes(initiator);
    params += hex2VarBytes(delegate);
    params += str2VarBytes(role);
    params += num2hexstring(keyNo, 4, true);
    const tx = makeInvokeTransaction('withdraw', params,
        AUTH_CONTRACT, VmType.NativeVM, gasPrice, gasLimit, payer);
    return tx;
}
