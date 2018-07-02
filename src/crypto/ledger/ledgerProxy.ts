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
import { StringReader } from '../../utils';
import { LedgerTransport } from './ledgerTransport';
import { LedgerTransportNode } from './ledgerTransportNode';

let transportInternal: LedgerTransport = new LedgerTransportNode();

/**
 * Sets the instance of ledger transport (Node/IFrame)
 * @param t Ledger transport
 */
export function setLedgerTransport(transport: LedgerTransport) {
    transportInternal = transport;
}

/**
 * Detects if Ledger is installed, connected and NEO app is running.
 *
 */
export async function isLedgerSupported() {
    try {
        await getPublicKey(0);
        return true;
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(e);
        return false;
    }
}

/**
 * Retrieves the public key corresponding to BIP44 index.
 *
 * @param index Index of the public key
 */
export async function getPublicKey(index: number) {
    await transportInternal.open();

    try {
        const path = BIP44(index);
        const params = { cla: 0x80, ins: 0x04, p1: 0x00, p2: 0x00 };
        const result = await transportInternal.send(params, path, [VALID_STATUS]);
        return result.substring(0, 130);
    } catch (err) {
        throw evalTransportError(err);
    } finally {
        await transportInternal.close();
    }
}

/**
 * Computes ECDSA signature of the data from Ledger using index.
 *
 * @param transportType Type of transport (HID - Node.JS/Electron, U2F - Browser)
 */
export async function computesSignature(index: number, data: string): Promise<string> {
    await transportInternal.open();

    try {
        const path = BIP44(index);
        data += path;

        const chunks = data.match(/.{1,510}/g) || [];
        if (chunks.length === 0) {
            throw new Error(`Invalid data provided: ${data}`);
        }

        let response = null;
        for (let i = 0; i < chunks.length; i++) {

            const params = {
                cla: 0x80,
                ins: 0x02,
                p1: i === chunks.length - 1 ? 0x80 : 0x00,
                p2: 0x00
            };

            response = await transportInternal.send(params, chunks[i], [VALID_STATUS]);
        }

        if (response === null || response === '9000') {
            throw new Error('No more data but Ledger did not return signature!');
        }

        return convertDerToHex(response);
    } catch (err) {
        throw evalTransportError(err);
    } finally {
        await transportInternal.close();
    }
}

/**
 * Constructs BIP44 address path from index.
 *
 * @param index Address index
 */
function BIP44(index: number = 0) {
    const acctNumber = index.toString(16).padStart(8, '0');
    return (
        '8000002C' +      // purpose
        '80000378' +      // coin type NEO
        '80000000' +      // account
        '00000000' +      // change (external)
        acctNumber        // Zero padded account index
    );
}

/**
 * Converts DER encoded signature to hex encoded.
 *
 * @param response Signature in DER format
 * @return Signature in hex format
 */
function convertDerToHex(response: string): string {
    const ss = new StringReader(response);
    // The first byte is format. It is usually 0x30 (SEQ) or 0x31 (SET)
    // The second byte represents the total length of the DER module.
    ss.read(2);
    // Now we read each field off
    // Each field is encoded with a type byte, length byte followed by the data itself
    ss.read(1); // Read and drop the type
    const r = ss.readNextBytes();
    ss.read(1);
    const s = ss.readNextBytes();

    // We will need to ensure both integers are 32 bytes long
    const integers = [r, s].map((i) => {
        if (i.length < 64) {
            i = i.padStart(64, '0');
        }
        if (i.length > 64) {
            i = i.substr(-64);
        }
        return i;
    });

    return integers.join('');
}

const VALID_STATUS = 0x9000;
const MSG_TOO_BIG = 0x6d08;
const APP_CLOSED = 0x6e00;
const TX_DENIED = 0x6985;
const TX_PARSE_ERR = 0x6d07;

/**
 * Adds user friendly message to Error object.
 * @param err Error object
 */
function evalTransportError(err: any) {
    switch (err.statusCode) {
    case APP_CLOSED:
        err.message = 'Your NEO app is closed! Please login.';
        break;
    case MSG_TOO_BIG:
        err.message = 'Your transaction is too big for the ledger to sign!';
        break;
    case TX_DENIED:
        err.message = 'You have denied the transaction on your ledger.';
        break;
    case TX_PARSE_ERR:
        err.message = 'Error parsing transaction. Make sure your NEO app version is up to date.';
        break;
    }
    return err;
}
