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

const WebSocket = require('html5-websocket')
import {TEST_ONT_URL} from '../../consts'

export default class WebsocketClientApi {

    sendHeartBeat() {
        let param = {
            "Action" : "heartbeat",
            "Version" : "V1.0.0"
        }
        return JSON.stringify(param)
    }

    sendSubscribe(subscribeEvent: boolean = false, subscribeJsonBlock: boolean = false, subscribeRawBlock: boolean = false, subscribeBlockTxHashes: boolean = false) {
        let param = {
            "Action": "subscribe",
            "Version": "1.0.0",
            "SubscribeEvent": subscribeEvent, //optional
            "SubscribeJsonBlock": subscribeJsonBlock, //optional
            "SubscribeRawBlock": subscribeRawBlock, //optional
            "SubscribeBlockTxHashs": subscribeBlockTxHashes //optional
        }
        return JSON.stringify(param)
    }

    sendRawTransaction(hexData : string, preExec : boolean = false) {
        let param = {
            "Action" : "sendrawtransaction",
            "Version" : "1.0.0",
            "Data" : hexData
        }
        if(preExec) {
            param = Object.assign(param, { "PreExec" : "1" })
        }
        console.log('hexData: '+hexData)
        return JSON.stringify(param)
    }

    getRawTransaction(txHash : string){
        let param = {
            "Action": "gettransaction",
            "Version": "1.0.0",
            "Hash": txHash,
            "Raw" : "1"
        }
        return JSON.stringify(param)
    }

    getRawTransactionJson(txHash : string) {
        let param = {
            "Action": "gettransaction",
            "Version": "1.0.0",
            "Hash": txHash,
            "Raw": "0"
        }
        return JSON.stringify(param)
    }

    getGenerateBlockTime() {
        let param = {
            "Action": "getgenerateblocktime",
            "Version": "1.0.0"
        }
        return JSON.stringify(param)
    }

    getNodeCount() {
        let param = {
            "Action": "getconnectioncount",
            "Version": "1.0.0"
        }
        return JSON.stringify(param)
    }

    getBlockHeight() {
        let param = {
            "Action": "getblockheight",
            "Version": "1.0.0"
        }
        return JSON.stringify(param)
    }

    getBlock(value : number | string) {
        let param = {}
        if(typeof value === 'number') {
            param = {
                "Action": "getblockbyheight",
                "Version": "1.0.0",
                "Height": value,
                "Raw": "1"
            }
        } else if(typeof value === 'string') {
            param = {
                "Action": "getblockbyhash",
                "Version": "1.0.0",
                "Hash": value,
                "Raw": "1"
            }
        }
        return JSON.stringify(param)
    }

    getBlockJson(value : number | string) {
        let param = {}
        if (typeof value === 'number') {
            param = {
                "Action": "getblockbyheight",
                "Version": "1.0.0",
                "Height": value
            }
        } else if (typeof value === 'string') {
            param = {
                "Action": "getblockbyhash",
                "Version": "1.0.0",
                "Hash": value
            }
        }
        return JSON.stringify(param)
    }

    getBalance(address : string) {
        let param = {
            "Action": "getbalance",
            "Version": "1.0.0",
            "Addr": address
        }
        return JSON.stringify(param)
    }

    getContract(hash : string) {
        let param = {
            "Action": "getcontract",
            "Version": "1.0.0",
            "Hash": hash,
            "Raw": "1"
        }
        return JSON.stringify(param)
    }

    getContractJson(hash : string) {
        let param = {
            "Action": "getcontract",
            "Version": "1.0.0",
            "Hash": hash,
            "Raw": "0"
        }
        return JSON.stringify(param)
    }

    getSmartCodeEvent(value : number | string) {
        let param = {}
        if (typeof value === 'number') {
            param = {
                "Action": "getsmartcodeeventbyheight",
                "Version": "1.0.0",
                "Height": value
            }
        } else if (typeof value === 'string') {
            param = {
                "Action": "getsmartcodeeventbyhash",
                "Version": "1.0.0",
                "Hash": value
            }
        }
        return JSON.stringify(param)
    }

    getBlockHeightByTxHash(hash: string) {
        let param = {
            "Action": "getblockheightbytxhash",
            "Version": "1.0.0",
            "Hash": hash,
        }
        return JSON.stringify(param)
    }

    getStorage(codeHash : string, key : string) {
        let param = {
            "Action": "getstorage",
            "Version": "1.0.0",
            "Hash": codeHash,
            "Key" : key
        }
        return JSON.stringify(param)
    }

    getMerkleProof(hash : string) {
        let param = {
            "Action": "getmerkleproof",
            "Version": "1.0.0",
            "Hash": hash
        }
        return JSON.stringify(param)
    }



}