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
import { ERROR_CODE } from '../error';
import { RestClient, Transaction } from '../index';
import { makeInvokeTransaction } from '../transaction/transactionBuilder';
import { VmType } from '../transaction/vmcode';
import { hex2VarBytes, hexstr2str, num2hexstring, num2VarInt,
    str2hexstr, str2VarBytes, StringReader, varifyPositiveInt } from '../utils';

export const GOVERNANCE_CONTRACT = 'ff00000000000000000000000000000000000007';

// tslint:disable:no-console

/**
 * Register to be candidate node.
 * This tx needs signatures from userAddr and payer if these two address are not the same.
 * @param ontid user's ONT ID, must be assigned with the role.
 * @param peerPubKey public key of user's peer
 * @param userAddr user's address to pledge ONT&ONG. This address must have enough ONT & ONG.
 * @param keyNo user's pk id
 * @param initPos
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeRegisterCandidateTx(
    ontid: string,
    peerPubKey: string,
    keyNo: number,
    userAddr: Address,
    initPos: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(initPos);
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }
    let params = '';
    params += str2VarBytes(peerPubKey);
    console.log('pk: ' + peerPubKey + ' pkByts: ' + params);
    params += userAddr.toHexString();
    params += num2VarInt(initPos);
    params += hex2VarBytes(ontid);
    params += num2hexstring(keyNo, 8, true);
    return makeInvokeTransaction('registerCandidate', params, GOVERNANCE_CONTRACT,
                                    VmType.NativeVM, gasPrice, gasLimit, payer);
}

export function makeApproveCandidateTx(
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    let params = '';
    params += str2VarBytes(peerPubKey);
    return makeInvokeTransaction('approveCandidate', params, GOVERNANCE_CONTRACT,
                                    VmType.NativeVM, gasPrice, gasLimit, payer);
}

export function makeRejectCandidateTx(
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    let params = '';
    params += str2VarBytes(peerPubKey);
    return makeInvokeTransaction('rejectCandidate', params, GOVERNANCE_CONTRACT,
        VmType.NativeVM, gasPrice, gasLimit, payer);
}

/**
 * Can only vote for peers that with status 1 or 2
 * This tx needs signatures from userAddr and payer if these two address are not the same.
 * @param userAddr
 * @param peerPubKeys
 * @param posList
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeVoteForPeerTx(
    userAddr: Address,
    peerPubKeys: string[],
    posList: number[],
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    if (peerPubKeys.length !== posList.length) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    let params = '';
    params += userAddr.toHexString();
    params += num2VarInt(peerPubKeys.length);
    for (const p of peerPubKeys) {
        params += str2VarBytes(p);
    }
    params += num2VarInt(posList.length);
    for (const n of posList) {
        varifyPositiveInt(n);
        params += num2VarInt(n);
    }
    console.log('params: ' + params);
    return makeInvokeTransaction('voteForPeer', params, GOVERNANCE_CONTRACT,
        VmType.NativeVM, gasPrice, gasLimit, payer);
}

/**
 * User unvotes peer nodes
 * @param userAddr user's address
 * @param peerPubKeys peer's pks
 * @param posList amount of ONT to unvote
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeUnvoteForPeerTx(
    userAddr: Address,
    peerPubKeys: string[],
    posList: number[],
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    if (peerPubKeys.length !== posList.length) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    let params = '';
    params += userAddr.toHexString();
    params += num2VarInt(peerPubKeys.length);
    for (const p of peerPubKeys) {
        params += str2VarBytes(p);
    }
    params += num2VarInt(posList.length);
    for (const n of posList) {
        varifyPositiveInt(n);
        params += num2VarInt(n);
    }
    return makeInvokeTransaction('unVoteForPeer', params, GOVERNANCE_CONTRACT,
        VmType.NativeVM, gasPrice, gasLimit, payer);
}

/**
 * Withdraw the unvote ONT
 * @param userAddr
 * @param peerPubKeys
 * @param withdrawList
 */
export function makeWithdrawTx(
    userAddr: Address,
    peerPubKeys: string[],
    withdrawList: number[],
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    if (peerPubKeys.length !== withdrawList.length) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    let params = '';
    params += userAddr.toHexString();
    params += num2VarInt(peerPubKeys.length);
    for (const p of peerPubKeys) {
        params += str2VarBytes(p);
    }
    params += num2VarInt(withdrawList.length);
    for (const w of withdrawList) {
        varifyPositiveInt(w);
        params += num2VarInt(w);
    }
    return makeInvokeTransaction('withdraw', params, GOVERNANCE_CONTRACT,
        VmType.NativeVM, gasPrice, gasLimit, payer);
}

export async function getPeerPoolMap(url?: string) {
    const restClient = new RestClient(url);
    const codeHash = GOVERNANCE_CONTRACT;
    const key = str2hexstr('governanceView');
    const viewRes = await restClient.getStorage(codeHash, key);
    const view = viewRes.Result;
    const governanceView = GovernanceView.deserialize(new StringReader(view));
    const key1 = str2hexstr('peerPool');
    const key2 = num2hexstring(governanceView.view, 4, true);
    const keyP = key1 + key2;
    const res = await restClient.getStorage(codeHash, keyP);
    const sr = new StringReader(res.Result);
    const length = sr.readInt();
    const result: any = {};
    for (let i = 0; i < length; i++) {
        const p = PeerPoolItem.deserialize(sr);
        result[p.peerPubkey] = p;
    }
    return result;
}

class GovernanceView {
    static deserialize(sr: StringReader): GovernanceView {
        const g = new GovernanceView();
        g.view = sr.readInt();
        g.height = sr.readInt();
        g.txhash = sr.readNextBytes();
        return g;
    }
    view: number;
    height: number;
    txhash: string;

    serialize(): string {
        let result = '';
        result += num2hexstring(this.view, 4, true);
        result += num2hexstring(this.height, 4, true);
        result += hex2VarBytes(this.txhash);
        return result;
    }
}

class PeerPoolItem {
    static deserialize(sr: StringReader): PeerPoolItem {
        const p = new PeerPoolItem();
        p.index = sr.readInt();
        p.peerPubkey = hexstr2str(sr.readNextBytes());
        p.address = Address.deserialize(sr);
        p.status = parseInt(sr.read(1), 16);
        p.initPos = sr.readLong();
        p.totalPos = sr.readLong();
        return p;
    }

    index: number;
    peerPubkey: string;
    address: Address;
    status: number;
    initPos: number;
    totalPos: number;

    serialize(): string {
        let result = '';
        result += num2hexstring(this.index, 4, true);
        result += str2VarBytes(this.peerPubkey);
        result += this.address.toHexString();
        result += num2hexstring(this.status);
        result += num2hexstring(this.initPos, 8, true);
        result += num2hexstring(this.totalPos, 8, true);
        return result;
    }
}
