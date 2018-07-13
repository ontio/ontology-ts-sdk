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

import { TEST_ONT_URL } from '../../consts';
import { Address } from '../../crypto/address';
import * as Builder from './websocketBuilder';
import { WebsocketSender } from './websocketSender';

/**
 * Websocket client.
 *
 * TODO: correlate request and response with id, so socket can be reused.
 */
export class WebsocketClient {
    /**
     * Url of blockchain node
     */
    url: string;
    /**
     * Decides if the client runs in debug mode so it can print info for debug.
     */
    debug: boolean;

    constructor(url = TEST_ONT_URL.SOCKET_URL, debug = false) {
        this.url = url;
        this.debug = debug;
    }

    /**
     * Send heart beat request
     */
    async sendHeartBeat(): Promise<any> {
        const raw = Builder.sendHeartBeat();
        return this.send(raw);
    }

    /**
     * Send subscribe request
     * @param subscribeEvent
     * @param subscribeJsonBlock
     * @param subscribeRawBlock
     * @param subscribeBlockTxHashes
     */
    async sendSubscribe(
            subscribeEvent = false,
            subscribeJsonBlock = false,
            subscribeRawBlock = false,
            subscribeBlockTxHashes = false
        ): Promise<any> {
        const raw = Builder.sendSubscribe(
                subscribeEvent,
                subscribeJsonBlock,
                subscribeRawBlock,
                subscribeBlockTxHashes
            );

        return this.send(raw);
    }

    /**
     * Send raw transaction
     * @param hexData Hex encoded data
     * @param preExec Decides if it is a pre-executed transaction
     * @param waitNotify Decides if client waits for notify from blockchain.
     */
    async sendRawTransaction(hexData: string, preExec = false, waitNotify = false) {
        const raw = Builder.sendRawTransaction(hexData, preExec);
        return this.send(raw, waitNotify);
    }

    /**
     * Get raw transaction by transaction hash.
     * The result is hex encoded transaction.
     * @param txHash Reversed transaction hash
     */
    async getRawTransaction(txHash: string): Promise<any> {
        const raw = Builder.getRawTransaction(txHash);
        return this.send(raw);
    }

    /**
     * Get transaction info by transaction hash.
     * The result is json.
     * @param txHash Reversed transaction hash
     */
    async getRawTransactionJson(txHash: string): Promise<any> {
        const raw = Builder.getRawTransactionJson(txHash);
        return this.send(raw);
    }

    /**
     * Get the generation time for each block.
     * If the blockchain node runs in vbft, the result is null.
     */
    async getGenerateBlockTime(): Promise<any> {
        const raw = Builder.getGenerateBlockTime();
        return this.send(raw);
    }

    /**
     * Get Nodes count
     */
    async getNodeCount(): Promise<any> {
        const raw = Builder.getNodeCount();
        return this.send(raw);
    }

    /**
     * Get current block height
     */
    async getBlockHeight(): Promise<any> {
        const raw = Builder.getBlockHeight();
        return this.send(raw);
    }

    /**
     * Get block's info by block's height or hash.
     * The result is hex encoded string.
     * @param value Block's height or hash
     */
    async getBlock(value: number | string): Promise<any> {
        const raw = Builder.getBlock(value);
        return this.send(raw);
    }

    /**
     * Get block's info by block's height or hash.
     * The result is json.
     * @param value Block's height or hash
     */
    async getBlockJson(value: number | string): Promise<any> {
        const raw = Builder.getBlockJson(value);
        return this.send(raw);
    }

    /**
     * Get the balance of some address.
     * The result contains ONT and ONG.
     * @param address Address
     */
    async getBalance(address: Address): Promise<any> {
        const raw = Builder.getBalance(address);
        return this.send(raw);
    }

    /**
     * Get contract info by code hash.
     * The result is hex encoded string.
     * @param hash Contract's code hash.
     */
    async getContract(hash: string): Promise<any> {
        const raw = Builder.getContract(hash);
        return this.send(raw);
    }

    /**
     * Get contract's info by code hash
     * The result is json.
     * @param hash Contract's code hash
     */
    async getContractJson(hash: string): Promise<any> {
        const raw = Builder.getContractJson(hash);
        return this.send(raw);
    }

    /**
     * Get smart conde event by transaction hash or block's height.
     * If parameter is transaction hash, the result is the event of that transaction.
     * If parameter is block's height, the result is all the events of that block.
     * @param value Reversed transaction hash or block's height
     */
    async getSmartCodeEvent(value: number | string): Promise<any> {
        const raw = Builder.getSmartCodeEvent(value);
        return this.send(raw);
    }

    /**
     * Get block's height by transaction hash
     * @param hash Reversed transaction hash
     */
    async getBlockHeightByTxHash(hash: string): Promise<any> {
        const raw = Builder.getBlockHeightByTxHash(hash);
        return this.send(raw);
    }

    /**
     * Get stored value in smart contract by contract's code hash and the key.
     * @param codeHash Contract's code hash
     * @param key Key of stored value
     */
    async getStorage(codeHash: string, key: string): Promise<any> {
        const raw = Builder.getStorage(codeHash, key);
        return this.send(raw);
    }

    /**
     * Get merkle proof by transaction hash.
     * @param hash Reversed transaction hash
     */
    async getMerkleProof(hash: string): Promise<any> {
        const raw = Builder.getMerkleProof(hash);
        return this.send(raw);
    }

    /**
     * Get allowanece
     * @param asset Asset's type.Only ONT and ONG supported.
     * @param from Address of allowance's sender.
     * @param to Address of allowance's receiver.
     */
    async getAllowance(asset: string, from: Address, to: Address) {
        const raw = Builder.getAllowance(asset, from, to);
        return this.send(raw);
    }

    /**
     * Send msg to blockchain
     * @param raw Message to send
     * @param waitNotify Decides if need to wait for notify from blockchain
     */
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
