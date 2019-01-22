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
import { ERROR_CODE } from '../../error';

/**
 * Wrapper class for RPC apis.
 */
export default class RpcClient {
    /**
     * Url of the blockchain node
     */
    url: string;

    constructor( url ?: string ) {
        this.url = url || TEST_ONT_URL.RPC_URL;
    }

    /**
     * Get the current blockchain node url.
     */
    getUrl() {
        return this.url;
    }

    /**
     * Make request base on method and parameters
     * @param method Method's name
     * @param params Parameters
     */
    makeRequest(method: string, ...params: any[]) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        };

        return request;
    }

    /**
     * Get the balance of some address.
     * The result contains ONT and ONG.
     * @param address Address
     */
    getBalance(address: Address): Promise<any> {
        const req = this.makeRequest('getbalance', address.toBase58());

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Send ran transaction to blockchain.
     * @param data Hex encoded data.
     * @param preExec Decides if it is a pre-execute transaction.
     */
    sendRawTransaction(data: string, preExec: boolean = false): Promise<any> {
        let req;

        if (preExec) {
            req = this.makeRequest('sendrawtransaction', data, 1);
        } else {
            req = this.makeRequest('sendrawtransaction', data);
        }

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get raw transaction by transaction hash.
     * The result is hex encoded string.
     * @param txHash Reversed transaction hash
     */
    getRawTransaction(txHash: string): Promise<any> {
        const req = this.makeRequest('getrawtransaction', txHash);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get transaction info by transaction hash.
     * The result is json.
     * @param txHash Reversed transaction hash.
     */
    getRawTransactionJson(txHash: string): Promise<any> {
        const req = this.makeRequest('getrawtransaction', txHash, 1);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /** Deprecated
     * Get the generation time for each block.
     * If the blockchain node runs in vbft, the result is null cause the time is not fixed.
     */
    // getGenerateBlockTime(): Promise<any> {
    //     const req = this.makeRequest('getgenerateblocktime');

    //     return axios.post(this.url, req).then((res) => {
    //         return res.data;
    //     });
    // }

    /**
     * Get the nodes count.
     */
    getNodeCount(): Promise<any> {
        const req = this.makeRequest('getconnectioncount');

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the current block height.
     */
    getBlockHeight(): Promise<any> {
        const req = this.makeRequest('getblockcount');

        return axios.post(this.url, req).then((res) => {
            if (res.data && res.data.result) {
                return res.data.result - 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Get the all blocks count.
     */
    getBlockCount(): Promise<any> {
        const req = this.makeRequest('getblockcount');

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block info by block's height or hash.
     * The result is json.
     * @param value Block's hash or height
     */
    getBlockJson(value: string | number): Promise<any> {
        const req = this.makeRequest('getblock', value, 1);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by contract' code hash.
     * The result is hex encoded string.
     * @param hash Contract's code hash.
     */
    getContract(hash: string): Promise<any> {
        const req = this.makeRequest('getcontractstate', hash);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by contract's code hash.
     * The result is json.
     * @param codeHash Contract's code hash.
     */
    getContractJson(codeHash: string): Promise<any> {
        const req = this.makeRequest('getcontractstate', codeHash, 1);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block info by block's height or hash.
     * The result is hex encoded string.
     *
     * @param value Block's height or hash
     */
    getBlock(value: string | number): Promise<any> {
        const req = this.makeRequest('getblock', value);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get smart contract event.
     * If parameter is transaction's hash, the result is the event of that transaction.
     * If parameter is block's height, the result is all the events of that block.
     *
     * @param value Transaction's hash or block's height
     */
    getSmartCodeEvent(value: string | number): Promise<any> {
        const req = this.makeRequest('getsmartcodeevent', value);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block height by transaction hash
     * @param txHash Reversed transaction hash
     */
    getBlockHeightByTxHash(txHash: string): Promise<any> {
        const req = this.makeRequest('getblockheightbytxhash', txHash);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get stored value in smart contract by contract's code hash and the key.
     * @param codeHash Contract's code hash
     * @param key Key of stored value
     */
    getStorage(codeHash: string, key: string): Promise<any> {
        const req = this.makeRequest('getstorage', codeHash, key);

        // tslint:disable-next-line:no-console
        console.log(req);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get merkle proof by transaction hash.
     * @param hash Reversed transaction hash
     */
    getMerkleProof(hash: string): Promise<any> {
        const req = this.makeRequest('getmerkleproof', hash);

        // tslint:disable-next-line:no-console
        console.log(this.url);
        // tslint:disable-next-line:no-console
        console.log(req);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    /**
     * Get allowanece
     * @param asset Asset's type.Only ONT and ONG supported.
     * @param from Address of allowance's sender.
     * @param to Address of allowance's receiver.
     */
    getAllowance(asset: string, from: Address, to: Address): Promise<any> {
        if (asset !== 'ont' && asset !== 'ong') {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        const req = this.makeRequest('getallowance', asset, from.toBase58(), to.toBase58());
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getUnboundOng(address: Address): Promise<any> {
        const req = this.makeRequest('getunboundong', 'ong', address.toBase58(), address.toBase58());
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getBlockTxsByHeight(height: number): Promise<any> {
        const req = this.makeRequest('getblocktxsbyheight', height);
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getGasPrice(): Promise<any> {
        const req = this.makeRequest('getgasprice');
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getGrantOng(address: Address): Promise<any> {
        const req = this.makeRequest('getgrantong', address.toBase58());
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getMempoolTxCount(): Promise<any> {
        const req = this.makeRequest('getmempooltxcount');
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getMempoolTxState(txHash: string): Promise<any> {
        const req = this.makeRequest('getmempooltxstate', txHash);
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

    getVersion(): Promise<any> {
        const req = this.makeRequest('getversion');
        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }

}
