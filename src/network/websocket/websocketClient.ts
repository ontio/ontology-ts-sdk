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

import { TEST_ONT_URL } from '../../consts'
import { WebsocketSender } from './websocketSender';
import * as Builder from './websocketBuilder';
import { Address } from '../../crypto/address';

/**
 * Websocket client.
 * 
 * TODO: correlate request and response with id, so socket can be reused.
 */
export class WebsocketClient {
    url: string;
    debug: boolean;
    
    constructor(url = TEST_ONT_URL.SOCKET_URL, debug = false) {
        this.url = url;
        this.debug = debug;
    }

    async sendHeartBeat(): Promise<any> {
        const raw = Builder.sendHeartBeat();
        return this.send(raw);
    }

    async sendSubscribe(subscribeEvent = false, subscribeJsonBlock = false, subscribeRawBlock = false, subscribeBlockTxHashes = false): Promise<any> {
        const raw = Builder.sendSubscribe(subscribeEvent, subscribeJsonBlock, subscribeRawBlock, subscribeBlockTxHashes);
        return this.send(raw);
    }

    async sendRawTransaction(hexData: string, preExec = false, waitNotify = false) {
        const raw = Builder.sendRawTransaction(hexData, preExec);
        return this.send(raw, waitNotify);
    }

    async getRawTransaction(txHash: string): Promise<any> {
        const raw = Builder.getRawTransaction(txHash);
        return this.send(raw);
    }

    async getRawTransactionJson(txHash: string): Promise<any> {
        const raw = Builder.getRawTransactionJson(txHash);
        return this.send(raw);
    }

    async getGenerateBlockTime(): Promise<any> {
        const raw = Builder.getGenerateBlockTime();
        return this.send(raw);
    }

    async getNodeCount(): Promise<any> {
        const raw = Builder.getNodeCount();
        return this.send(raw);
    }

    async getBlockHeight(): Promise<any> {
        const raw = Builder.getBlockHeight();
        return this.send(raw);
    }

    async getBlock(value: number | string): Promise<any> {
        const raw = Builder.getBlock(value);
        return this.send(raw);
    }

    async getBlockJson(value: number | string): Promise<any> {
        const raw = Builder.getBlockJson(value);
        return this.send(raw);
    }

    async getBalance(address: Address): Promise<any> {
        const raw = Builder.getBalance(address);
        return this.send(raw);
    }

    async getContract(hash: string): Promise<any> {
        const raw = Builder.getContract(hash);
        return this.send(raw);
    }

    async getContractJson(hash: string): Promise<any> {
        const raw = Builder.getContractJson(hash);
        return this.send(raw);
    }

    async getSmartCodeEvent(value: number | string): Promise<any> {
        const raw = Builder.getSmartCodeEvent(value);
        return this.send(raw);
    }

    async getBlockHeightByTxHash(hash: string): Promise<any> {
        const raw = Builder.getBlockHeightByTxHash(hash);
        return this.send(raw);
    }

    async getStorage(codeHash: string, key: string): Promise<any> {
        const raw = Builder.getStorage(codeHash, key);
        return this.send(raw);
    }

    async getMerkleProof(hash: string): Promise<any> {
        const raw = Builder.getMerkleProof(hash);
        return this.send(raw);
    }

    private async send(raw: string, waitNotify = false): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const sender = new WebsocketSender(this.url, this.debug);
            sender.send(raw, (err, res, socket) => {
                if (err !== null) {
                    reject(err);
                } else if (socket !== null) {
                    if (!waitNotify || res.Action === 'Notify') {
                        socket.close();
                        resolve(res);
                    }
                }
            });
        });
    }
}
