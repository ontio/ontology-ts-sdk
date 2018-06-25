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
import LedgerNode from '@ledgerhq/hw-transport-node-hid';

/**
 * Low level interface to Ledger HW NEO application.
 */
export class LedgerTransport {
    /**
     * Connects to the Ledger HW and creates transport.
     *
     * Caution: Transport needs to be close before creating new one.
     * Otherwise the new one might fail.
     */
    static async open() {
        const supported = await LedgerNode.isSupported();
        if (!supported) {
            throw new Error('Your computer does not support the ledger!');
        }

        const paths = await LedgerNode.list();
        if (paths.length === 0) {
            throw new Error('USB Error: No device found.');
        }

        const transport = new LedgerTransport();
        transport.delegate = await LedgerNode.open(paths[0]);
        return transport;
    }

    private delegate: any;

    /**
     * Closes the transport connection to the Ledger HW.
     */
    async close() {
        await this.delegate.close();
    }

    /**
     * Sends data with params to the Ledger HW.
     *
     * @param params Send Params
     * @param msg - Hex encoded data
     * @param statusList List of valid status codes
     * @return Hex encoded result from Ledger
     */
    async send(params: SendParams, data: string, statusList: number[]): Promise<string> {
        const resulBuffer: Buffer = await this.delegate.send(
            params.cla,
            params.ins,
            params.p1,
            params.p2,
            Buffer.from(data, 'hex'),
            statusList
        );

        return resulBuffer.toString('hex');
    }
}

/**
 * Parameters for the Ledger HW
 */
export interface SendParams {
    /**
     * Start of the buffer.
     * Needs to be 0x80.
     */
    cla: number;

    /**
     * Main instruction.
     * Possible values: Signing(0x02) or GetPublicKey (0x04).
     */
    ins: number;

    /**
     * Parameter 1.
     */
    p1: number;

    /**
     * Parameter 2.
     */
    p2: number;
}
