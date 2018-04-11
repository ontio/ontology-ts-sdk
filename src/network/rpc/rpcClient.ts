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


import {TEST_ONT_URL} from '../../consts'
import axios from 'axios'

export default class RpcClient {
    url : string
    
    constructor( url ?: string ) {
        this.url = url || TEST_ONT_URL.RPC_URL
    }

    getUrl() {
        return this.url
    }

    makeRequest(method : string, ...params : any[]) {
        let request = (<any> {})
        request['jsonrpc'] = '2.0'
        request['method'] = method
        request['params'] = params
        request['id'] = 1
        return request
    }

    getBalance(address : string) {
        let req = this.makeRequest(address)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    sendRawTransaction(data : string, preExec : boolean = false) {
        let req 
        if(preExec) {
            req = this.makeRequest('sendrawtransaction', data, 1)
        } else {
            req = this.makeRequest('sendrawtransaction', data)            
        }
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getRawTransaction(txHash : string) {
        let req = this.makeRequest('getrawtransaction', txHash)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getRawTransactionJson(txHash : string) {
        let req = this.makeRequest('getrawtransaction', txHash, 1)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getGenerateBlockTime() {
        let req = this.makeRequest('getgenerateblocktime')
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getNodeCount() {
        let req = this.makeRequest('getconnectioncount')
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getBlockHeight() {
        let req = this.makeRequest('getblockcount')
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getBlockCount() {
        let req = this.makeRequest('getblockcount')
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    //get by block height or block hash
    getBlockJson(value : string | number) {
        let req = this.makeRequest('getblock', value, 1)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getContract(hash : string) {
        let req = this.makeRequest('getcontractstate', hash)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getContractJson(codeHash : string) {
        let req = this.makeRequest('getcontractstate', codeHash, 1)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    //get by block height or block hash
    getBlock(value : string | number) {
        let req = this.makeRequest('getblock', value)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getSmartCodeEvent(value: string | number) {
        let req = this.makeRequest('getsmartcodeevent', value)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getBlockHeightByTxHash(txHash : string) {
        let req = this.makeRequest('getblockheightbytxhash', txHash)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getStorage(codeHash : string, key : string) {
        let req = this.makeRequest('getstorage', codeHash, key)
        console.log(req)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

    getMerkleProof(hash : string) {
        let req = this.makeRequest('getmerkleproof', hash)
        console.log(this.url)
        console.log(req)
        return axios.post(this.url, req).then(res => {
            return res.data
        })
    }

}