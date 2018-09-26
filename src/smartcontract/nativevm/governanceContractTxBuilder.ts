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
import BigInt from '../../common/bigInt';
import { GENESIS_BLOCK_TIMESTAMP } from '../../consts';
import { Address } from '../../crypto';
import { ERROR_CODE } from '../../error';
import RestClient from '../../network/rest/restClient';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionBuilder';
import { calcUnboundOng, hex2VarBytes, hexstr2str,
    num2hexstring, str2hexstr, str2VarBytes, StringReader, varifyPositiveInt } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';

const GOVERNANCE_CONTRACT = '0000000000000000000000000000000000000007';
const PEER_ATTRIBUTES = 'peerAttributes';
const SPLIT_FEE_ADDRESS = 'splitFeeAddress';
const AUTHORIZE_INFO_POOL = 'voteInfoPool';
const GLOBAL_PARAM = 'globalParam';
const TOTAL_STAKE = 'totalStake';
const contractAddress = new Address(GOVERNANCE_CONTRACT);

/* TODO: Test */

// tslint:disable:no-console

/**
 * Register to be candidate node.
 * This tx needs signatures from userAddr and payer if these two address are not the same.
 * @param ontid user's ONT ID, must be assigned with the role.
 * @param peerPubKey public key of user's peer
 * @param userAddr user's address to pledge ONT&ONG. This address must have enough ONT & ONG.
 * @param keyNo user's pk id
 * @param initPos Initial state
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
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
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey), userAddr.serialize(), initPos, ontid, keyNo);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('registerCandidate', params, contractAddress,
                                     gasPrice, gasLimit, payer);
}

/**
 *
 * @param userAddr User's address to pledge ONT&ONG.
 * @param peerPubKey Public key of user's peer
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeUnregisterCandidateTx(
    userAddr: Address,
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey), userAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('unRegisterCandidate', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Creates transaction to approve candidate
 * @param peerPubKey Public key of user's peer
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeApproveCandidateTx(
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey));
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('approveCandidate', params, contractAddress,
                                     gasPrice, gasLimit, payer);
}

/**
 * Creates transaction to reject candidate
 * @param peerPubKey Public key of user's peer
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeRejectCandidateTx(
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey));
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('rejectCandidate', params, contractAddress,
        gasPrice, gasLimit, payer);
}

/**
 * Creates transaction to vote for some peers.
 * Can only vote for peers that with status 1 or 2
 * This tx needs signatures from userAddr and payer if these two address are not the same.
 * @param userAddr User's address
 * @param peerPubKeys Public keys of peers that to be voted
 * @param posList Array of token that to vote
 * @param payer Address to pay for transaction's gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
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
    const struct = new Struct();
    struct.add(userAddr.serialize());
    struct.add(peerPubKeys.length);
    for (const p of peerPubKeys) {
        struct.add(str2hexstr(p));
    }
    struct.add(posList.length);
    for (const n of posList) {
        struct.add(n);
    }
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('voteForPeer', params, contractAddress,
       gasPrice, gasLimit, payer);
}

/**
 * User unvotes peer nodes
 * @param userAddr user's address
 * @param peerPubKeys peer's pks
 * @param posList amount of ONT to unvote
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
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
    const struct = new Struct();
    struct.add(userAddr.serialize());
    struct.add(peerPubKeys.length);
    for (const p of peerPubKeys) {
        struct.add(str2hexstr(p));
    }
    struct.add(posList.length);
    for (const n of posList) {
        struct.add(n);
    }
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('unVoteForPeer', params, contractAddress,
         gasPrice, gasLimit, payer);
}

/**
 * Withdraw the unvote ONT
 * Need two signatures if userAddr and payer are not the same
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
    const struct = new Struct();
    struct.add(userAddr.serialize());
    struct.add(peerPubKeys.length);
    for (const p of peerPubKeys) {
        struct.add(str2hexstr(p));
    }
    struct.add(withdrawList.length);
    for (const w of withdrawList) {
        struct.add(w);
    }
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('withdraw', params, contractAddress,
        gasPrice, gasLimit, payer);
}

/** Quit node register
 * Need two signatures if userAddr and payer are not the same
 */
export function makeQuitNodeTx(
    userAddr: Address,
    peerPubKey: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey), userAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('quitNode', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Peer change the status of authorization
 * @param peerPubKey Peer's public key
 * @param userAddr User's address
 * @param maxAuthorize Allowed max amount of stake authorization
 * @param payer Payer of the transaction fee
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeChangeAuthorizationTx(
    peerPubKey: string,
    userAddr: Address,
    maxAuthorize: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey), userAddr.serialize(), maxAuthorize);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('changeMaxAuthorization', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Update allocation proportion of peer
 * @param peerPubKey
 * @param userAddr
 * @param peerCost
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeSetPeerCostTx(
    peerPubKey: string,
    userAddr: Address,
    peerCost: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubKey), userAddr.serialize(), peerCost);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('setPeerCost', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Withdraw fee to user's address
 * @param userAddr User's address
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeWithdrawFeeTx(
    userAddr: Address,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(userAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('withdrawFee', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * User authorize some peers
 * @param userAddr
 * @param peerPubKeyList
 * @param posList
 * @param payer
 * @param gasPrice
 * @param gasLimit
 */
export function makeAuthorizeForPeerTx(
    userAddr: Address,
    peerPubKeyList: string[],
    posList: number[],
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(userAddr.serialize());
    struct.add(peerPubKeyList.length);
    for (const p of peerPubKeyList) {
        struct.add(str2hexstr(p));
    }
    struct.add(posList.length);
    for (const w of posList) {
        struct.add(w);
    }
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('authorizeForPeer', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * User cancels the authorization of peer
 */
export function makeUnauthorizeForPeerTx(
    userAddr: Address,
    peerPubKeyList: string[],
    posList: number[],
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(userAddr.serialize());
    struct.add(peerPubKeyList.length);
    for (const p of peerPubKeyList) {
        struct.add(str2hexstr(p));
    }
    struct.add(posList.length);
    for (const w of posList) {
        struct.add(w);
    }
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('unAuthorizeForPeer', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Peer add the init pos
 * @param peerPubkey Peer's public key
 * @param userAddr Stake wallet address
 * @param pos Amount of pos to add
 * @param payer Payer of the transaction
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeAddInitPosTx(
    peerPubkey: string,
    userAddr: Address,
    pos: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubkey), userAddr.serialize(), pos);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('addInitPos', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * Peer reduce the init pos
 * @param peerPubkey Peer's public key
 * @param userAddr Stake wallet address
 * @param pos Amount of pos to reduce
 * @param payer Payer of the transaction
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeReduceInitPosTx(
    peerPubkey: string,
    userAddr: Address,
    pos: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    const struct = new Struct();
    struct.add(str2hexstr(peerPubkey), userAddr.serialize(), pos);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('reduceInitPos', params, contractAddress, gasPrice, gasLimit, payer);
}

export function makeWithdrawPeerUnboundOngTx(
    userAddr: Address,
    payer: Address,
    gasPrice: string,
    gasLimit: string
) {
    const struct = new Struct();
    struct.add(userAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx('withdrawOng', params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 * If not set ifAuthorize or cost before, query result will be empty.
 * @param peerPubKey
 * @param url
 */
export async function getAttributes(peerPubKey: string, url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr(PEER_ATTRIBUTES) + peerPubKey;
    const res = await restClient.getStorage(codeHash, key);
    const result = res.Result;
    if (result) {
        return PeerAttributes.deserialize(new StringReader(result));
    } else {
        return new PeerAttributes();
    }
}

/**
 * Get the reward fee of address
 * @param address User's address
 * @param url Node's restfull url
 */
export async function getSplitFeeAddress(address: Address, url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr(SPLIT_FEE_ADDRESS) + address.serialize();
    const res = await restClient.getStorage(codeHash, key);
    const result = res.Result;
    if (result) {
        return SplitFeeAddress.deserialize(new StringReader(result));
    } else {
        return new SplitFeeAddress();
    }
}

/**
 * Get authorization of user's address
 * @param peerPubKey Peer's public key
 * @param address User's address
 * @param url Node's restful url
 */
export async function getAuthorizeInfo(peerPubKey: string, address: Address, url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr(AUTHORIZE_INFO_POOL) + peerPubKey + address.serialize();
    const res = await restClient.getStorage(codeHash, key);
    const result = res.Result;
    if (result) {
        return AuthorizeInfo.deserialize(new StringReader(result));
    } else {
        return new AuthorizeInfo();
    }
}

/**
 * Query the governance view
 * @param url Url of restful api
 */
export async function getGovernanceView(url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr('governanceView');
    const viewRes = await restClient.getStorage(codeHash, key);
    const view = viewRes.Result;
    const governanceView = GovernanceView.deserialize(new StringReader(view));
    return governanceView;
}

/**
 * Query all the peer's state. The result is a map.
 * @param url Url of blockchain node
 */
export async function getPeerPoolMap(url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const governanceView = await getGovernanceView(url);
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

export async function getGlobalParam(url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr(GLOBAL_PARAM);
    const res = await restClient.getStorage(codeHash, key);
    if (res.Result) {
        return GlobalParam.deserialize(new StringReader(res.Result));
    } else {
        return new GlobalParam();
    }

}

export async function getTotalStake(userAddr: Address, url?: string) {
    const restClient = new RestClient(url);
    const codeHash = contractAddress.toHexString();
    const key = str2hexstr(TOTAL_STAKE) + userAddr.serialize();
    const res = await restClient.getStorage(codeHash, key);
    if (res.Result) {
        return TotalStake.deserialize(new StringReader(res.Result));
    } else {
        return new TotalStake();
    }
}

export async function getPeerUnboundOng(userAddr: Address, url?: string) {
    const totalStake = await getTotalStake(userAddr, url);
    if (!totalStake.address) {
        return 0;
    }
    const restClient = new RestClient(url);
    const blockHeight = (await restClient.getBlockHeight()).Result;
    const block = (await restClient.getBlockJson(blockHeight)).Result;
    const timeStamp = block.Header.Timestamp - GENESIS_BLOCK_TIMESTAMP;
    return calcUnboundOng(totalStake.stake, totalStake.timeOffset, timeStamp);
}

/**
 * Use to store governance state.
 */
export class GovernanceView {
    static deserialize(sr: StringReader): GovernanceView {
        const g = new GovernanceView();
        g.view = sr.readUint32();
        g.height = sr.readUint32();
        g.txhash = sr.read(64); // uint256
        return g;
    }
    view: number = 0;
    height: number = 0;
    txhash: string = '';

    serialize(): string {
        let result = '';
        result += num2hexstring(this.view, 4, true);
        result += num2hexstring(this.height, 4, true);
        result += hex2VarBytes(this.txhash);
        return result;
    }
}

/**
 * Describs the peer's state in the pool.
 */
export class PeerPoolItem {
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

    index: number = 0;
    peerPubkey: string = '';
    address: Address;
    status: number = 0;
    initPos: number = 0;
    totalPos: number = 0;

    serialize(): string {
        let result = '';
        result += num2hexstring(this.index, 4, true);
        result += str2VarBytes(this.peerPubkey);
        result += this.address.serialize();
        result += num2hexstring(this.status);
        result += num2hexstring(this.initPos, 8, true);
        result += num2hexstring(this.totalPos, 8, true);
        return result;
    }
}

export class PeerAttributes {
    static deserialize(sr: StringReader): PeerAttributes {
        const pr = new PeerAttributes();
        pr.peerPubkey = hexstr2str(sr.readNextBytes());

        pr.maxAuthorize = sr.readLong();

        pr.t2PeerCost = sr.readLong();
        pr.t1PeerCost = sr.readLong();
        pr.tPeerCost = sr.readLong();

        if (sr.isEmpty) {
            return pr;
        }
        pr.field1 = sr.readNextBytes();
        pr.field2 = sr.readNextBytes();
        pr.field3 = sr.readNextBytes();
        pr.field4 = sr.readNextBytes();

        return pr;
    }
    peerPubkey: string = '';
    maxAuthorize: number = 0;
    t2PeerCost: number = 100; // peer cost, active in view T + 2
    t1PeerCost: number = 100; // peer cost, active in view T + 1
    tPeerCost: number = 0; // peer cost, active in view T
    field1: string = '';
    field2: string = '';
    field3: string = '';
    field4: string = '';

    serialize(): string {
        return '';
    }
}

export class SplitFeeAddress {
    static deserialize(sr: StringReader) {
        const sfa = new SplitFeeAddress();
        sfa.address = Address.deserialize(sr);
        sfa.amount = sr.readLong();
        return sfa;
    }

    address: Address;
    amount: number = 0;
}

export class AuthorizeInfo {
    static deserialize(sr: StringReader) {
        const ai = new AuthorizeInfo();
        ai.peerPubkey = hexstr2str(sr.readNextBytes());
        ai.address = Address.deserialize(sr);
        ai.consensusPos = sr.readLong();
        ai.freezePos = sr.readLong();
        ai.newPos = sr.readLong();
        ai.withdrawPos = sr.readLong();
        ai.withdrawFreezePos = sr.readLong();
        ai.withdrawUnfreezePos = sr.readLong();
        return ai;
    }

    peerPubkey: string = '';
    address: Address;
    consensusPos: number = 0;
    freezePos: number = 0;
    newPos: number = 0;
    withdrawPos: number = 0;
    withdrawFreezePos: number = 0;
    withdrawUnfreezePos: number = 0;
}

export class GlobalParam {
    static deserialize(sr: StringReader) {
        const gp = new GlobalParam();
        const feeHexStr = sr.readNextBytes();
        const candidateFeeStr = BigInt.fromHexstr(feeHexStr).value;
        gp.candidateFee = Number(candidateFeeStr);
        const minStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        gp.minInitState = Number(minStr);
        const candidateNumStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        const candidateNum = Number(candidateNumStr);
        gp.candidateNum = candidateNum;
        const posLimitStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        gp.posLimit = Number(posLimitStr);
        const aStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        const a = Number(aStr);
        const bStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        const b = Number(bStr);
        const yStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        const yita = Number(yStr);
        const pStr = BigInt.fromHexstr(sr.readNextBytes()).value;
        const penalty = Number(pStr);
        gp.A = a;
        gp.B = b;
        gp.yita = yita;
        gp.penalty = penalty;
        return gp;
    }

    candidateFee: number;
    candidateNum: number;
    minInitState: number;
    posLimit: number;
    A: number;
    B: number;
    yita: number;
    penalty: number;
}

export class TotalStake {
    static deserialize(sr: StringReader): TotalStake {
        const ts = new TotalStake();
        ts.address = Address.deserialize(sr);
        ts.stake = sr.readLong();
        ts.timeOffset = sr.readUint32();
        return ts;
    }
    address: Address;
    stake: number;
    timeOffset: number;
}
