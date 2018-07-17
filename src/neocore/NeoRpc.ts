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
import { Address } from './../crypto/address';

export class NeoRpc {

    static sendRawTransaction(url: string, data: string) {
        const req = this.makeRequest('sendrawtransaction', data);
        return axios.post(url, req).then((res) => {
            return res.data;
        });
    }

    static makeRequest(method: string, ...params: any[]) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        };

        return request;
    }

    static getBalance(url: string, contractAddr: Address, address: Address) {
        const req = this.makeRequest('getstorage', contractAddr.toHexString(), address.serialize());
        return axios.post(url, req).then((res) => {
            return res.data;
        });
    }
}
