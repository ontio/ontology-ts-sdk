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

import { Address } from '../../crypto/address';

// const generateReqId = () => {
//     return Math.floor(Math.random() * 10e8);
// };

export function sendHeartBeat() {
    const param = {
        Action : 'heartbeat',
        Version : 'V1.0.0'
    };
    return param;
}

export function sendSubscribe(
    subscribeEvent: boolean = false,
    subscribeJsonBlock: boolean = false,
    subscribeRawBlock: boolean = false,
    subscribeBlockTxHashes: boolean = false
) {
    const param = {
        Action: 'subscribe',
        Version: '1.0.0',
        SubscribeEvent: subscribeEvent, // optional
        SubscribeJsonBlock: subscribeJsonBlock, // optional
        SubscribeRawBlock: subscribeRawBlock, // optional
        SubscribeBlockTxHashs: subscribeBlockTxHashes // optional
    };
    return param;
}

export function sendRawTransaction(hexData: string, preExec: boolean = false) {
    let param = {
        Action: 'sendrawtransaction',
        Version: '1.0.0',
        Data: hexData
    };
    if (preExec) {
        param = Object.assign(param, { PreExec : '1' });
    }
    return param;
}

export function getRawTransaction(txHash: string) {
    const param = {
        Action: 'gettransaction',
        Version: '1.0.0',
        Hash: txHash,
        Raw : '1'
    };
    return param;
}

export function getRawTransactionJson(txHash: string) {
    const param = {
        Action: 'gettransaction',
        Version: '1.0.0',
        Hash: txHash,
        Raw: '0'
    };
    return param;
}

// export function getGenerateBlockTime() {
//     const param = {
//         Action: 'getgenerateblocktime',
//         Version: '1.0.0'
//     };
//     return param;
// }

export function getNodeCount() {
    const param = {
        Action: 'getconnectioncount',
        Version: '1.0.0'
    };
    return param;
}

export function getBlockHeight() {
    const param = {
        Action: 'getblockheight',
        Version: '1.0.0'
    };
    return param;
}

export function getBlock(value: number | string) {
    let param = {};
    if (typeof value === 'number') {
        param = {
            Action: 'getblockbyheight',
            Version: '1.0.0',
            Height: value,
            Raw: '1'
        };
    } else if (typeof value === 'string') {
        param = {
            Action: 'getblockbyhash',
            Version: '1.0.0',
            Hash: value,
            Raw: '1'
        };
    }
    return param;
}

export function getBlockJson(value: number | string) {
    let param = {};
    if (typeof value === 'number') {
        param = {
            Action: 'getblockbyheight',
            Version: '1.0.0',
            Height: value
        };
    } else if (typeof value === 'string') {
        param = {
            Action: 'getblockbyhash',
            Version: '1.0.0',
            Hash: value
        };
    }
    return param;
}

export function getBalance(address: Address) {
    const param = {
        Action: 'getbalance',
        Version: '1.0.0',
        Addr: address.toBase58()
    };
    return param;
}

export function getUnboundOng(address: Address) {
    const param = {
        Action: 'getunboundong',
        Version: '1.0.0',
        Addr: address.toBase58()
    };
    return param;
}

export function getContract(hash: string) {
    const param = {
        Action: 'getcontract',
        Version: '1.0.0',
        Hash: hash,
        Raw: '1'
    };
    return param;
}

export function getContractJson(hash: string) {
    const param = {
        Action: 'getcontract',
        Version: '1.0.0',
        Hash: hash,
        Raw: '0'
    };
    return param;
}

export function getSmartCodeEvent(value: number | string) {
    let param = {};
    if (typeof value === 'number') {
        param = {
            Action: 'getsmartcodeeventbyheight',
            Version: '1.0.0',
            Height: value
        };
    } else if (typeof value === 'string') {
        param = {
            Action: 'getsmartcodeeventbyhash',
            Version: '1.0.0',
            Hash: value
        };
    }
    return param;
}

export function getBlockHeightByTxHash(hash: string) {
    const param = {
        Action: 'getblockheightbytxhash',
        Version: '1.0.0',
        Hash: hash
    };
    return param;
}

export function getStorage(codeHash: string, key: string) {
    const param = {
        Action: 'getstorage',
        Version: '1.0.0',
        Hash: codeHash,
        Key : key
    };
    return param;
}

export function getMerkleProof(hash: string) {
    const param = {
        Action: 'getmerkleproof',
        Version: '1.0.0',
        Hash: hash
    };
    return param;
}

export function getAllowance(asset: string, from: Address, to: Address) {
    const param = {
        Action: 'getallowance',
        Version: '1.0.0',
        Asset: asset,
        From: from.toBase58(),
        To: to.toBase58()
    };
    return param;
}

export function getBlockHash(value: number) {
    const param = {
        Action: 'getblockhash',
        Version: '1.0.0',
        Height: value
    };
    return param;
}

export function getBlockTxsByHeight(value: number) {
    const param = {
        Action: 'getblocktxsbyheight',
        Version: '1.0.0',
        Height: value
    };
    return param;
}

export function getGasPrice() {
    const param = {
        Action: 'getgasprice',
        Version: '1.0.0'
    };
    return param;
}

export function getGrantOng(address: Address) {
    const param = {
        Action: 'getgrantong',
        Version: '1.0.0',
        Addr: address.toBase58()
    };
    return param;
}

export function getMempoolTxCount() {
    const param = {
        Action: 'getmempooltxcount',
        Version: '1.0.0'
    };
    return param;
}

export function getMempoolTxState(txHash: string) {
    const param = {
        Action: 'getmempooltxstate',
        Version: '1.0.0',
        Hash: txHash
    };
    return param;
}

export function getVersion() {
    const param = {
        Action: 'getversion',
        Version: '1.0.0'
    };
    return param;
}

export function getNetworkId() {
    const param = {
        Action: 'getnetworkid',
        Version: '1.0.0'
    };
    return param;
}
