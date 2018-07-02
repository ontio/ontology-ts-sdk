import LedgerNodeHid from '@ledgerhq/hw-transport-node-hid';
import LedgerNodeU2f from '@ledgerhq/hw-transport-u2f';
import { LedgerTransport, SendParams } from './ledgerTransport';

const isBrowser = typeof window !== 'undefined'
    && ({}).toString.call(window) === '[object Window]';

export class LedgerTransportNode implements LedgerTransport {
    private delegate: any;

    /**
     * Connects to the Ledger HW and creates transport.
     *
     * Caution: Transport needs to be close before creating new one.
     * Otherwise the new one might fail.
     */
    async open() {
        let LedgerNode;
        let scrambleKey;

        if (isBrowser) {
            LedgerNode = LedgerNodeU2f;
            scrambleKey = 'ONT';
        } else {
            LedgerNode = LedgerNodeHid;
            scrambleKey = null;
        }

        const supported = await LedgerNode.isSupported();
        if (!supported) {
            throw new Error('Your computer does not support the ledger!');
        }

        const paths = await LedgerNode.list();
        if (paths.length === 0) {
            throw new Error('USB Error: No device found.');
        }

        this.delegate = await LedgerNode.open(paths[0]);
        this.delegate.setDebugMode(true);
        this.delegate.setScrambleKey(scrambleKey);
        this.delegate.setExchangeTimeout(5000);
    }

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
