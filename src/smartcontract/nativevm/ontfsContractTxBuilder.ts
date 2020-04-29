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

import BigNumber from 'bignumber.js';
import { Address, PrivateKey, PublicKey, Signature } from '../../crypto';
import {
    Challenge, FileDel, FileDelList, FileInfo, FileInfoList, FilePdpData,
    FileReadSettleSlice, FileRenew, FileRenewInterface, FileRenewList,
    FileStore, FileTransfer, FileTransferInterface, FileTransferList,
    FsNodeInfo, GetReadPledge, Passport, ReadPlan, ReadPlanLike,
    ReadPledge, SpaceInfo, SpaceUpdate
} from '../../fs';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { str2hexstr, StringReader } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';

/**
 * Address of ONT FS Contract
 */
export const ONTFS_CONTRACT = '0000000000000000000000000000000000000008';
const contractAddress = new Address(ONTFS_CONTRACT);

/**
 * Method names in ONT FS contract
 */
export const ONTFS_METHOD  = {
    FsGetGlobalParam: 'FsGetGlobalParam',
    FsNodeRegister: 'FsNodeRegister',
    FsNodeQuery: 'FsNodeQuery',
    FsNodeUpdate: 'FsNodeUpdate',
    FsNodeCancel: 'FsNodeCancel',
    FsFileProve: 'FsFileProve',
    FsNodeWithDrawProfit: 'FsNodeWithDrawProfit',
    FsGetNodeList: 'FsGetNodeList',
    FsGetPdpInfoList: 'FsGetPdpInfoList',
    FsChallenge: 'FsChallenge',
    FsResponse: 'FsResponse',
    FsJudge: 'FsJudge',
    FsGetChallenge: 'FsGetChallenge',
    FsGetFileChallengeList: 'FsGetFileChallengeList',
    FsGetNodeChallengeList: 'FsGetNodeChallengeList',
    FsStoreFiles: 'FsStoreFiles',
    FsRenewFiles: 'FsRenewFiles',
    FsDeleteFiles: 'FsDeleteFiles',
    FsTransferFiles: 'FsTransferFiles',
    FsGetFileInfo: 'FsGetFileInfo',
    FsGetFileList: 'FsGetFileList',
    FsReadFilePledge: 'FsReadFilePledge',
    FsReadFileSettle: 'FsReadFileSettle',
    FsGetReadPledge: 'FsGetReadPledge',
    FsCancelFileRead: 'FsCancelFileRead',
    FsSetWhiteList: 'FsSetWhiteList',
    FsGetWhiteList: 'FsGetWhiteList',
    FsCreateSpace: 'FsCreateSpace',
    FsDeleteSpace: 'FsDeleteSpace',
    FsUpdateSpace: 'FsUpdateSpace',
    FsGetSpaceInfo: 'FsGetSpaceInfo'
};

export function buildTxByParamsHash(
    method: keyof typeof ONTFS_METHOD,
    paramsHash: string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    return makeNativeContractTx(method, paramsHash, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetGlobalParamTx(): Transaction {
    return makeNativeContractTx(ONTFS_METHOD.FsGetGlobalParam, '', contractAddress);
}

export function buildFsNodeRegisterTx(
    volume: number,
    serviceTime: Date,
    nodeAddr: Address,
    nodeNetAddr: string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fsNodeInfo = new FsNodeInfo(0, 0, volume, 0, serviceTime, nodeAddr, nodeNetAddr);
    const struct = new Struct();
    struct.add(fsNodeInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsNodeRegister, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeQueryTx(
    nodeAddr: Address
): Transaction {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsNodeQuery, params, contractAddress);
}

export function buildNodeUpdateTx(
    volume: number,
    serviceTime: Date,
    nodeAddr: Address,
    nodeNetAddr: string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fsNodeInfo = new FsNodeInfo(0, 0, volume, 0, serviceTime, nodeAddr, nodeNetAddr);
    const struct = new Struct();
    struct.add(fsNodeInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsNodeUpdate, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeCancelTx(
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsNodeCancel, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeWithdrawoProfitTx(
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsNodeWithDrawProfit, params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 *
 * @param nodeAddr
 * @param fileHash hex string
 * @param proveData hex string
 * @param blockHeight
 * @param gasPrice
 * @param gasLimit
 * @param payer
 */
export function buildFileProveTx(
    nodeAddr: Address,
    fileHash: string,
    proveData: string,
    blockHeight: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const pdpData = new FilePdpData(nodeAddr, fileHash, proveData, blockHeight);
    const struct = new Struct();
    struct.add(pdpData.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsFileProve, params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 *
 * @param fileHash hex string
 * @param downloader
 */
export function buildGetFileReadPledgeTx(
    fileHash: string,
    downloader: Address
): Transaction {
    const getReadPledge = new GetReadPledge(fileHash, downloader);
    const struct = new Struct();
    struct.add(getReadPledge.fileHash);
    struct.add(getReadPledge.downloader.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetReadPledge, params, contractAddress);
}

export function buildFileReadProfitSettleTx(
    fileReadSettleSlice: FileReadSettleSlice,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const struct = new Struct();
    struct.add(fileReadSettleSlice.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsReadFileSettle, params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 *
 * @param fileHash hex
 */
export function buildGetFilePdpRecordListTx(
    fileHash: string
): Transaction {
    const struct = new Struct();
    struct.add(fileHash);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetPdpInfoList, params, contractAddress);
}

// export function buildGetNodeInfoTx(
//     nodeAddr: Address
// ): Transaction {}

export function buildGetNodeInfoListTx(
    count: number
): Transaction {
    const struct = new Struct();
    struct.add(new BigNumber(count));
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetNodeList, params, contractAddress);
}

export function buildChallengeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const chanllege = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(chanllege.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsChallenge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetChanllengeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address
): Transaction {
    const challengeReq = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(challengeReq.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetChallenge, params, contractAddress);
}

export function buildResponseTx(
    nodeAddr: Address,
    fileHash: string,
    proveData: string,
    blockHeight: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const pdpData = new FilePdpData(nodeAddr, fileHash, proveData, blockHeight);
    const struct = new Struct();
    struct.add(pdpData.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsResponse, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildJudgeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const challenge = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(challenge.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsJudge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetFileChallengeListTx(
    fileHash: string,
    fileOwner: Address
): Transaction {
    const challengeReq = new Challenge(fileHash, fileOwner);
    const struct = new Struct();
    struct.add(challengeReq.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetFileChallengeList, params, contractAddress);
}

export function buildGetNodeChallengeListTx(
    fileOwner: Address
): Transaction {
    const struct = new Struct();
    struct.add(fileOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetNodeChallengeList, params, contractAddress);
}

export function buildCreateSpaceTx(
    spaceOwner: Address,
    volume: number,
    copyNum: number,
    timeStart: Date,
    timeExpired: Date,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const spaceInfo = new SpaceInfo(spaceOwner, volume, 0, copyNum, 0, 0, timeStart, timeExpired, false);
    const struct = new Struct();
    struct.add(spaceInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsCreateSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetSpaceInfoTx(
    spaceOwner: Address
): Transaction {
    const struct = new Struct();
    struct.add(spaceOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetSpaceInfo, params, contractAddress);
}

export function buildUpdateSpaceTx(
    spaceOwner: Address,
    spacePayer: Address,
    volume: number,
    timeExpired: Date,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const spaceUdpate = new SpaceUpdate(spaceOwner, spacePayer, volume, timeExpired);
    const struct = new Struct();
    struct.add(spaceUdpate.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsUpdateSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildDeleteSpaceTx(
    spaceOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const struct = new Struct();
    struct.add(spaceOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsDeleteSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function genPassport(
    blockHeight: number,
    blockHash: string,
    privateKey: PrivateKey
): Passport {
    return Passport.genPassport(blockHeight, blockHash, privateKey);
}

export function genFileReadSettleSlice(
    fileHash: string,
    payTo: Address,
    sliceId: number,
    pledgeHeight: number,
    privateKey: PrivateKey
): FileReadSettleSlice {
    return FileReadSettleSlice.genFileReadSettleSlice(
        fileHash, payTo, sliceId, pledgeHeight, privateKey
    );
}

export function verifyFileReadSettleSlice(
    {
        fileHash, payFrom, payTo, sliceId, pledgeHeight, signature, publicKey
    }: {
        fileHash: string;
        payFrom: string;
        payTo: string;
        sliceId: number;
        pledgeHeight: number;
        signature: string;
        publicKey: string;
    }
): boolean {
    const settleSlice = new FileReadSettleSlice(
        fileHash, new Address(payFrom), new Address(payTo), sliceId, pledgeHeight,
        Signature.deserializeHex(signature), PublicKey.deserializeHex(new StringReader(publicKey))
    );
    return settleSlice.verify();
}

export function buildGetFileListTx(
    passport: Passport | string
): Transaction {
    const struct = new Struct();
    struct.add(typeof passport === 'string' ? passport : passport.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetFileList, params, contractAddress);
}

export function buildGetFileInfoTx(
    fileHash: string
): Transaction {
    const struct = new Struct();
    struct.add(fileHash);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsGetFileInfo, params, contractAddress);
}

export function buildStoreFilesTx(
    filesInfo: FileStore[],
    fileOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fileInfoList = new FileInfoList();
    for (
        const {
            fileHash,
            fileDesc,
            fileBlockCount,
            realFileSize,
            copyNumber,
            firstPdp,
            timeStart,
            timeExpired,
            pdpParam,
            storageType
        } of filesInfo
    ) {
        const fsFileInfo = new FileInfo(
            fileHash, fileOwner, str2hexstr(fileDesc), fileBlockCount, realFileSize, copyNumber,
            0, 0, firstPdp, timeStart, timeExpired, 0, 0, pdpParam, false, storageType);
        fileInfoList.filesI.push(fsFileInfo);
    }

    const struct = new Struct();
    struct.add(fileInfoList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsStoreFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildTransferFilesTx(
    fileTransfers: FileTransferInterface[],
    originOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fileTransferList = new FileTransferList();
    for (const { fileHash, newOwner } of fileTransfers) {
        const fsFileTransfer = new FileTransfer(fileHash, originOwner, newOwner);
        fileTransferList.filesTransfer.push(fsFileTransfer);
    }
    const struct = new Struct();
    struct.add(fileTransferList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsTransferFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildRenewFilesTx(
    filesRenew: FileRenewInterface[],
    newFileOwner: Address,
    newPayer: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fileRenewList = new FileRenewList();
    for (const { fileHash, renewTime } of filesRenew) {
        const fsFileRenew = new FileRenew(fileHash, newFileOwner, newPayer, renewTime);
        fileRenewList.filesRenew.push(fsFileRenew);
    }
    const struct = new Struct();
    struct.add(fileRenewList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsRenewFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildDeleteFilesTx(
    fileHashes: string[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fileDelList = new FileDelList();
    for (const fileHash of fileHashes) {
        fileDelList.filesDel.push(
            new FileDel(fileHash)
        );
    }
    const struct = new Struct();
    struct.add(fileDelList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsDeleteFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildFileReadPledgeTx(
    fileHash: string,
    readPlans: ReadPlanLike[],
    downloader: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const fileReadPledge = new ReadPledge(fileHash, downloader, 0,
        readPlans.map((plan) => ReadPlan.fromReadPlanLike(plan)));
    const struct = new Struct();
    struct.add(fileReadPledge.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsReadFilePledge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildCancelFileReadTx(
    fileHash: string,
    downloader: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const getReadPledge = new GetReadPledge(fileHash, downloader);
    const struct = new Struct();
    struct.add(getReadPledge.fileHash);
    struct.add(getReadPledge.downloader.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.FsCancelFileRead, params, contractAddress, gasPrice, gasLimit, payer);
}
