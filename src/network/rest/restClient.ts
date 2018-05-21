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

export default class RestClient {
    url: string;
    version: string = 'v1.0.0';
    action: string = 'sendrawtransaction';

    constructor(url ?: string) {
        this.url = url || TEST_ONT_URL.REST_URL;
    }

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

    getUrl() {
        return this.url;
    }

    sendRawTransaction(hexData: string, preExec: boolean = false, userId ?: string) {
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

    getRawTransaction(txHash: string) {
        const param = new Map<string, string>();

        param.set('raw', '1');
        let url = this.url + UrlConsts.Url_get_transaction + txHash;
        url += this.concatParams(param);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getRawTransactionJson(txHash: string) {
        const url = this.url + UrlConsts.Url_get_transaction + txHash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getGenerateBlockTime() {
        const url = this.url + UrlConsts.Url_get_generate_block_time;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getNodeCount() {
        const url = this.url + UrlConsts.Url_get_node_count;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlockHeight() {
        const url = this.url + UrlConsts.Url_get_block_height;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

        // get block by block height or block hash
    getBlock(value: number | string) {
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

    getContract(codeHash: string) {
        const params = new Map<string, string>();
        params.set('raw', '1');

        let url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        url += this.concatParams(params);

            // console.log('url: '+url);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getContractJson(codeHash: string) {
        const url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getSmartCodeEvent(value: string | number) {
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

    getBlockHeightByTxHash(hash: string) {
        const url = this.url + UrlConsts.Url_get_block_height_by_txhash + hash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getStorage(codeHash: string, key: string) {
        const url = this.url + UrlConsts.Url_get_storage + codeHash + '/' + key;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getMerkleProof(hash: string) {
        const url = this.url + UrlConsts.Url_get_merkleproof + hash;

            // tslint:disable-next-line:no-console
        console.log('url: ' + url);

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBalance(address: Address) {
        const url = this.url + UrlConsts.Url_get_account_balance + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlockJson(value: number | string) {
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
}
