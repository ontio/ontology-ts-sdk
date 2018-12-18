import { ERROR_CODE } from './../../error';
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

import axios from 'axios';
import { TEST_ONT_URL } from '../../consts';
import { Address } from '../../crypto/address';
import UrlConsts from './urlConsts';

/**
 * Wrapper class for restful api.
 */
export default class RestClient {
    /**
     * Url of the blockchain node
     */
    url: string;

    /**
     * Version of restful api
     */
    version: string = 'v1.0.0';

    /**
     * Action name of the request
     */
    action: string = 'sendrawtransaction';

    constructor(url ?: string) {
        this.url = url || TEST_ONT_URL.REST_URL;
        if (this.url[this.url.length - 1] === '/') {
            this.url = this.url.substring(0, this.url.length - 1);
        }
    }

    /**
     * Concat params as the query part
     * @param params
     */
    concatParams(params: Map<string, string>) {
        let result = '';
        if (params.size === 0) {
            return '';
        }

        for (const key of params.keys()) {
            let value = params.get(key);
            if (value) {
                value = encodeURIComponent(value);
            }
            result += `&${key}=${value}`;
        }

        return '?' + result.substr(1);
    }

    /**
     * Get the current blockchain node url
     */
    getUrl() {
        return this.url;
    }

    /**
     * To send raw transaction to blockchian
     * @param hexData Hex encoded data
     * @param preExec Decides if it is a pre-execute transaction
     * @param userId User's id
     */
    sendRawTransaction(hexData: string, preExec: boolean = false, userId ?: string): Promise<any> {
        const param = new Map<string, string>();

        if (userId) {
            param.set('userid', userId);
        }

        if (preExec) {
            param.set('preExec', '1');
        }

        let url = this.url + UrlConsts.Url_send_transaction;
        url += this.concatParams(param);

        const body = {
            Action  : this.action,
            Version : this.version,
            Data    : hexData
        };

        return axios.post(url, body).then((res) => {
            return res.data;
        });
    }

    /**
     * Get raw transaction by transaction hash.
     * The result is hex encoded transaction.
     * @param txHash Transactin hash.Always use the reversed value of transaction hash to query.
     *
     * @example
     *
     * ```typescript
     * import { utils, Transaction } from 'ontology-ts-sdk';
     * const txHash = tx.getHash(); // tx is an instance of Transaction
     * restClient.getRawTransaction(utils.reverseHex(txHash)).then(res => {
     *   const tx = Transaction.deserialize(res.Result)
     * })
     *
     * ````
     */
    getRawTransaction(txHash: string): Promise<any> {
        const param = new Map<string, string>();

        param.set('raw', '1');
        let url = this.url + UrlConsts.Url_get_transaction + txHash;
        url += this.concatParams(param);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get transaction by transaction hash.
     * The result is transaction in json.
     * @param txHash Reversed transaction hash
     */
    getRawTransactionJson(txHash: string): Promise<any> {
        const param = new Map<string, string>();
        param.set('raw', '0');
        let url = this.url + UrlConsts.Url_get_transaction + txHash;
        url += this.concatParams(param);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /** Deprecated
     * Get the generation time for each block.
     * If the blockchain node runs in vbft, the result is null.
     */
    // getGenerateBlockTime(): Promise<any> {
    //     const url = this.url + UrlConsts.Url_get_generate_block_time;
    //     return axios.get(url).then((res) => {
    //         return res.data;
    //     });
    // }

    /**
     * Get the nodes count of the blockchain.
     */
    getNodeCount(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_node_count;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the current height of the blockchain.
     */
    getBlockHeight(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_block_height;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block by block's height or hash
     * @param value Block height or block hash
     */
    getBlock(value: number | string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '1');

        let url = '';
        if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_block_by_height + value;
        } else if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_block_by_hash + value;
        }
        url += this.concatParams(params);

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by code hash.The result is hex encoded string.
     * @param codeHash Code hash of contract.The value is reversed contract address.
     */
    getContract(codeHash: string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '1');

        let url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        url += this.concatParams(params);

            // console.log('url: '+url);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by code hash. The result is json.
     * @param codeHash Code hash of contract.
     */
    getContractJson(codeHash: string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '0');
        let url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        url += this.concatParams(params);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get smart contract event by Block height or reversed transaction hash.
     * If the parameter is block height, the result includes all the transaction event of that block;
     * If the parameter is transaction hash, the result is the event of that transaction.
     * @param value Block height or reversed transaction hash
     */
    getSmartCodeEvent(value: string | number): Promise<any> {
        let url = '';
        if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_smartcodeevent_by_txhash + value;
        } else if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_smartcodeevent_txs_by_height + value;
        }
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the block height by reversed transaction hash.
     * @param hash Reversed transaction hash.
     */
    getBlockHeightByTxHash(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_block_height_by_txhash + hash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the stored value in smart contract by the code hash and key.
     * @param codeHash Code hash of the smart contract
     * @param key Key of the stored value
     */
    getStorage(codeHash: string, key: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_storage + codeHash + '/' + key;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the merkle proof by transaction hash
     * @param hash Reversed transaction hash
     */
    getMerkleProof(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_merkleproof + hash;

            // tslint:disable-next-line:no-console
        console.log('url: ' + url);

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get balance of some address
     * The result contains balance of ONT and ONG
     * @param address Address
     */
    getBalance(address: Address): Promise<any> {
        const url = this.url + UrlConsts.Url_get_account_balance + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block info by block's height or hash.
     * @param value Block's height or hash
     */
    getBlockJson(value: number | string): Promise<any> {
        let url = '';
        if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_block_by_height + value;
        } else if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_block_by_hash + value;
        }

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get allowance by address
     * @param asset Asset type. Only ONT or ONG.
     * @param from Address of allowance sender.
     * @param to Address of allowance receiver.
     */
    getAllowance(asset: string, from: Address, to: Address): Promise<any> {
        asset = asset.toLowerCase();
        if (asset !== 'ont' && asset !== 'ong') {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        const url = this.url + UrlConsts.Url_get_allowance +
                    asset.toLowerCase() + '/' + from.toBase58() + '/' + to.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getUnboundOng(address: Address): Promise<any> {
        const url = this.url + UrlConsts.Url_get_unbound_ong + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlockTxsByHeight(height: number): Promise<any> {
        const url = this.url + UrlConsts.Url_get_block_txs_by_height + height;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getGasPrice(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_gasprice ;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getGrangOng(address: Address): Promise<any> {
        const url = this.url + UrlConsts.Url_get_grant_ong + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getMempoolTxCount(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_mempool_txcount;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getMempoolTxState(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_mempool_txstate + hash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getVersion(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_version;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }
}
