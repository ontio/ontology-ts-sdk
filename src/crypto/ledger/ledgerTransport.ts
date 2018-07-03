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

/**
 * Low level interface to Ledger HW ONT application.
 */
export interface LedgerTransport {
    /**
     * Connects to the Ledger HW and creates transport.
     *
     * Caution: Transport needs to be close before creating new one.
     * Otherwise the new one might fail.
     */
    open: () => Promise<void>;

    /**
     * Closes the transport connection to the Ledger HW.
     */
    close: () => Promise<void>;

    /**
     * Sends data with params to the Ledger HW.
     *
     * @param params Send Params
     * @param msg - Hex encoded data
     * @param statusList List of valid status codes
     * @return Hex encoded result from Ledger
     */
    send: (params: SendParams, data: string, statusList: number[]) => Promise<string>;
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
