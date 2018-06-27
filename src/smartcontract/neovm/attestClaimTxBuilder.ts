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

import { Address  } from '../../crypto';
import AbiInfo from '../../smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../../smartcontract/abi/parameter';

import { makeInvokeTransaction } from '../../transaction/transactionBuilder';
import { reverseHex, str2hexstr } from '../../utils';
import { Transaction } from './../../transaction/transaction';

import abiJson from '../data/attestClaim';
const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson));
const contractHash = abiInfo.getHash().replace('0x', '');
const contractAddress = new Address(reverseHex(contractHash));
/* TODO : Test */

/**
 * Attests the claim.
 *
 * @param claimId Unique id of the claim
 * @param issuer Issuer's ONT ID
 * @param subject Subject's ONT ID
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer's address
 */
export function buildCommitRecordTx(claimId: string, issuer: string, subject: string,
                                    gasPrice: string, gasLimit: string, payer: Address)  {
    const f = abiInfo.getFunction('Commit');
    if (issuer.substr(0, 3) === 'did') {
        issuer = str2hexstr(issuer);
    }
    if (subject.substr(0, 3) === 'did') {
        subject = str2hexstr(issuer);
    }
    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, str2hexstr(claimId));
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, issuer);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, subject);

    let tx = new Transaction();
    tx = makeInvokeTransaction(f.name, [p1, p2, p3], contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * Revokes the claim.
 *
 * @param claimId Unique id of the claim
 * @param revokerOntid Revoker's ONT ID
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer's address
 */
export function buildRevokeRecordTx(claimId: string, revokerOntid: string,
                                    gasPrice: string, gasLimit: string, payer: Address) {
    const f = abiInfo.getFunction('Revoke');

    const name1 = f.parameters[0].getName();
    const type1 = ParameterType.ByteArray;

    if (revokerOntid.substr(0, 3) === 'did') {
        revokerOntid = str2hexstr(revokerOntid);
    }

    const p1 = new Parameter(name1, type1, str2hexstr(claimId));
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, revokerOntid);

    return makeInvokeTransaction(f.name, [p1, p2], contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Queries the state of attest.
 *
 * @param claimId Unique id of the claim
 */
export function buildGetRecordStatusTx(claimId: string) {
    const f = abiInfo.getFunction('GetStatus');
    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, str2hexstr(claimId));
    const tx = makeInvokeTransaction(f.name, [p1], contractAddress);
    return tx;
}
