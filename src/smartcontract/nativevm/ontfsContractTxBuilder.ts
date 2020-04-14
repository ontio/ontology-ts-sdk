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

import { Address, PrivateKey } from '../../crypto';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import Struct from '../abi/struct';
import { FsNodeInfo } from '../../fs/nodeInfo';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import { FilePdpData } from '../../fs/filePdpData';
import { GetReadPledge } from '../../fs/getReadPledge';
import { FileReadSettleSlice } from '../../fs/fileReadSettleSlice';
import { serializeUint64 } from '../../fs/utils';
import { Challenge } from '../../fs/challenge';
import { SpaceInfo, SpaceUpdate } from '../../fs/space';
import { Passport } from '../../fs/passport';
import { FileStore, FileTransferInterface, FileRenewInterface } from '../../fs/type';
import { FileInfoList, FileInfo } from '../../fs/fileInfo';
import { FileTransferList, FileTransfer } from '../../fs/fileTransfer';
import { FileRenewList, FileRenew } from '../../fs/fileRenew';
import { FileDelList, FileDel } from '../../fs/fileDel';
import { ReadPlan } from '../../fs/readPlan';
import { ReadPledge } from '../../fs/readPledge';

/**
 * Address of ONT FS Contract
 */
export const ONTFS_CONTRACT = '0000000000000000000000000000000000000008';
const contractAddress = new Address(ONTFS_CONTRACT);
const DefaultMinPdpInterval = 600;

/**
 * Method names in ONT FS contract
 */
const ONTFS_METHOD = {
    fsGetGlobalParam: 'FsGetGlobalParam',
    fsNodeRegister: 'FsNodeRegister',
    fsNodeQuery: 'FsNodeQuery',
    fsNodeUpdate: 'FsNodeUpdate',
    fsNodeCancel: 'FsNodeCancel',
    fsFileProve: 'FsFileProve',
    fsNodeWithDrawProfit: 'FsNodeWithDrawProfit',
    fsGetNodeInfoList: 'FsGetNodeList',
    fsGetPdpInfoList: 'FsGetPdpInfoList',
    fsChallenge: 'FsChallenge',
    fsResponse: 'FsResponse',
    fsJudge: 'FsJudge',
    fsGetChallenge: 'FsGetChallenge',
    fsGetFileChallengeList: 'FsGetFileChallengeList',
    fsGetNodeChallengeList: 'FsGetNodeChallengeList',
    fsStoreFiles: 'FsStoreFiles',
    fsRenewFiles: 'FsRenewFiles',
    fsDeleteFiles: 'FsDeleteFiles',
    fsTransferFiles: 'FsTransferFiles',
    fsGetFileInfo: 'FsGetFileInfo',
    fsGetFileHashList: 'FsGetFileList',
    fsReadFilePledge: 'FsReadFilePledge',
    fsReadFileSettle: 'FsReadFileSettle',
    fsGetReadPledge: 'FsGetReadPledge',
    fsCancelFileRead: 'FsCancelFileRead',
    fsSetWhiteList: 'FsSetWhiteList',
    fsGetWhiteList: 'FsGetWhiteList',
    fsCreateSpace: 'FsCreateSpace',
    fsDeleteSpace: 'FsDeleteSpace',
    fsUpdateSpace: 'FsUpdateSpace',
    fsGetSpaceInfo: 'FsGetSpaceInfo'
};

export function buildGetGlobalParamTx() {
    return makeNativeContractTx(ONTFS_METHOD.fsGetGlobalParam, '', contractAddress);
}

export function buildFsNodeRegisterTx(
    volume: number,
    serviceTime: number,
    minPdpInterval: number,
    nodeAddr: Address,
    nodeNetAddr: string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fsNodeInfo = new FsNodeInfo(0, 0, volume, 0, serviceTime, minPdpInterval, nodeAddr, nodeNetAddr);
    const struct = new Struct();
    struct.add(fsNodeInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsNodeRegister, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeQueryTx(
    nodeAddr: Address
) {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsNodeQuery, params, contractAddress);
}

export function buildNodeUpdateTx(
    volume: number,
    serviceTime: number,
    minPdpInterval: number,
    nodeAddr: Address,
    nodeNetAddr: string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fsNodeInfo = new FsNodeInfo(0, 0, volume, 0, serviceTime, minPdpInterval, nodeAddr, nodeNetAddr);
    const struct = new Struct();
    struct.add(fsNodeInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsNodeUpdate, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeCancelTx(
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsNodeCancel, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildNodeWithdrawoProfitTx(
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const struct = new Struct();
    struct.add(nodeAddr.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsNodeWithDrawProfit, params, contractAddress, gasPrice, gasLimit, payer);
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
) {
    const pdpData = new FilePdpData(nodeAddr, fileHash, proveData, blockHeight);
    const struct = new Struct();
    struct.add(pdpData.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsFileProve, params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 *
 * @param fileHash hex string
 * @param downloader
 */
export function buildGetFileReadPledgeTx(
    fileHash: string,
    downloader: Address
) {
    const getReadPledge = new GetReadPledge(fileHash, downloader);
    const struct = new Struct();
    struct.add(getReadPledge.fileHash)
    struct.add(getReadPledge.downloader.serialize())
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetReadPledge, params, contractAddress);
}

export function buildFileReadProfitSettleTx(
    fileReadSettleSlice: FileReadSettleSlice,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const struct = new Struct();
    struct.add(fileReadSettleSlice.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsReadFileSettle, params, contractAddress, gasPrice, gasLimit, payer);
}

/**
 *
 * @param fileHash hex
 */
export function buildGetFilePdpRecordListTx(
    fileHash: string
) {
    const struct = new Struct();
    struct.add(fileHash);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetPdpInfoList, params, contractAddress);
}

// export function buildGetNodeInfoTx(
//     nodeAddr: Address
// ) {}

export function buildGetNodeInfoListTx(
    count: number
) {
    const struct = new Struct();
    struct.add(serializeUint64(count));
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetNodeInfoList, params, contractAddress);
}

export function buildChallengeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const chanllege = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(chanllege.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsChallenge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetChanllengeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address
) {
    const challengeReq = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(challengeReq.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetChallenge, params, contractAddress);
}

export function buildResponseTx(
    nodeAddr: Address,
    fileHash: string,
    proveData: string,
    blockHeight: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const pdpData = new FilePdpData(nodeAddr, fileHash, proveData, blockHeight);
    const struct = new Struct();
    struct.add(pdpData.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsResponse, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildJudgeTx(
    fileHash: string,
    fileOwner: Address,
    nodeAddr: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const challenge = new Challenge(fileHash, fileOwner, nodeAddr);
    const struct = new Struct();
    struct.add(challenge.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsJudge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetFileChallengeListTx(
    fileHash: string,
    fileOwner: Address
) {
    const challengeReq = new Challenge(fileHash, fileOwner);
    const struct = new Struct();
    struct.add(challengeReq.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetFileChallengeList, params, contractAddress);
}

export function buildGetNodeChallengeListTx(
    fileOwner: Address
) {
    const struct = new Struct()
    struct.add(fileOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetNodeChallengeList, params, contractAddress);
}

export function buildCreateSpaceTx(
    spaceOwner: Address,
    volume: number,
    copyNum: number,
    pdpInterval: number,
    timeExpired: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    if (pdpInterval < DefaultMinPdpInterval) {
        throw new Error(`pdpInterval value should be no smaller than ${DefaultMinPdpInterval}`);
    }

    const spaceInfo = new SpaceInfo(spaceOwner, volume, 0, copyNum, 0, 0, pdpInterval, 0, timeExpired, false);
    const struct = new Struct();
    struct.add(spaceInfo.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsCreateSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetSpaceInfoTx(
    spaceOwner: Address
) {
    const struct = new Struct();
    struct.add(spaceOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetSpaceInfo, params, contractAddress);
}

export function buildUpdateSpaceTx(
    spaceOwner: Address,
    spacePayer: Address,
    volume: number,
    timeExpired: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const spaceUdpate = new SpaceUpdate(spaceOwner, spacePayer, volume, timeExpired);
    const struct = new Struct();
    struct.add(spaceUdpate.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsUpdateSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildDeleteSpaceTx(
    spaceOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const struct = new Struct();
    struct.add(spaceOwner.serialize());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsDeleteSpace, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildGetFileListTx(
    blockHeight: number,
    blockHash: string,
    privateKey: PrivateKey
) {
    const passport = Passport.genPassport(blockHeight, blockHash, privateKey);
    const struct = new Struct();
    struct.add(passport.serialzieHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetFileHashList, params, contractAddress);
}

export function buildGetFileInfoTx(
    fileHash: string
) {
    const struct = new Struct();
    struct.add(fileHash);
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsGetFileInfo, params, contractAddress);
}

export function buildStoreFilesTx(
    filesInfo: FileStore[],
    fileOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fileInfoList = new FileInfoList();
    for (
        const {
            fileHash,
            fileDesc,
            fileBlockCount,
            realFileSize,
            copyNumber,
            firstPdp,
            pdpInterval,
            timeExpired,
            pdpParam,
            storageType
        } of filesInfo
    ) {
        if (pdpInterval < DefaultMinPdpInterval) {
            throw new Error(`pdpInterval value should be no less than ${DefaultMinPdpInterval}`);
        }

        const fsFileInfo = new FileInfo(
            fileHash, fileOwner, fileDesc, fileBlockCount, realFileSize, copyNumber,
            0, 0, 0, firstPdp, pdpInterval, 0, timeExpired, pdpParam, false, storageType
        );
        fileInfoList.filesI.push(fsFileInfo);
    }

    const struct = new Struct();
    struct.add(fileInfoList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsStoreFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildTransferFilesTx(
    fileTransfers: FileTransferInterface[],
    originOwner: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fileTransferList = new FileTransferList();
    for (const { fileHash, newOwner } of fileTransfers) {
        const fsFileTransfer = new FileTransfer(fileHash, originOwner, newOwner);
        fileTransferList.filesTransfer.push(fsFileTransfer);
    }
    const struct = new Struct();
    struct.add(fileTransferList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsTransferFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildRenewFilesTx(
    filesRenew: FileRenewInterface[],
    newFileOwner: Address,
    newPayer: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fileRenewList = new FileRenewList();
    for (const { fileHash, renewTime } of filesRenew) {
        const fsFileRenew = new FileRenew(fileHash, newFileOwner, newPayer, renewTime);
        fileRenewList.filesRenew.push(fsFileRenew);
    }
    console.log('fileRenewList', fileRenewList)
    const struct = new Struct();
    struct.add(fileRenewList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsRenewFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildDeleteFilesTx(
    fileHashes: string[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fileDelList = new FileDelList();
    for (const fileHash of fileHashes) {
        fileDelList.filesDel.push(
            new FileDel(fileHash)
        );
    }
    const struct = new Struct();
    struct.add(fileDelList.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsDeleteFiles, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildFileReadPledgeTx(
    fileHash: string,
    readPlans: ReadPlan[],
    downloader: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const fileReadPledge = new ReadPledge(fileHash, downloader, 0, 0, 0, readPlans);
    const struct = new Struct();
    struct.add(fileReadPledge.serializeHex());
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsReadFilePledge, params, contractAddress, gasPrice, gasLimit, payer);
}

export function buildCancelFileReadTx(
    fileHash: string,
    downloader: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const getReadPledge = new GetReadPledge(fileHash, downloader);
    const struct = new Struct();
    struct.add(getReadPledge.fileHash)
    struct.add(getReadPledge.downloader.serialize())
    const params = buildNativeCodeScript([struct]);
    return makeNativeContractTx(ONTFS_METHOD.fsCancelFileRead, params, contractAddress, gasPrice, gasLimit, payer);
}