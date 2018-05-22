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
import { PrivateKey } from '../crypto';
import AbiFunction from '../smartcontract/abi/abiFunction';
import AbiInfo from '../smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../smartcontract/abi/parameter';
import abiJson from '../smartcontract/data/attestClaim';
import { Transaction } from '../transaction/transaction';
import { makeInvokeTransaction, sendRawTxRestfulUrl, signTransaction } from '../transaction/transactionBuilder';
import { VmType } from '../transaction/vmcode';
import { str2hexstr } from '../utils';

const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson));

export function buildCommitRecordTx(claimId: string, issuer: string, privateKey: PrivateKey) {
    const f = abiInfo.getFunction('Commit');

    const name1 = f.parameters[0].getName();
    const type1 = ParameterType.ByteArray;

    const name2 = f.parameters[1].getName();
    const type2 = ParameterType.ByteArray;
    if (issuer.substr(0, 3) === 'did') {
        issuer = str2hexstr(issuer);
    }

    const p1 = new Parameter(name1, type1, str2hexstr(claimId));
    const p2 = new Parameter(name2, type2, issuer);
    f.setParamsValue(p1, p2);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NEOVM, '0');
    signTransaction(tx, privateKey);
    return tx;
}

export function buildRevokeRecordTx(claimId: string, revokerOntid: string, privateKey: PrivateKey) {
    const f = abiInfo.getFunction('Revoke');

    const name1 = f.parameters[0].getName();
    const type1 = ParameterType.ByteArray;

    if (revokerOntid.substr(0, 3) === 'did') {
        revokerOntid = str2hexstr(revokerOntid);
    }

    const p1 = new Parameter(name1, type1, str2hexstr(claimId));
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, revokerOntid);
    f.setParamsValue(p1, p2);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NEOVM, '0');
    signTransaction(tx, privateKey);
    return tx;
}

export function buildGetRecordStatusTx(claimId: string) {
    const f = abiInfo.getFunction('GetStatus');

    const name1 = f.parameters[0].getName();
    const type1 = ParameterType.ByteArray;

    const p1 = new Parameter(name1, type1, str2hexstr(claimId));
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NEOVM, '0');
    return tx;
}
