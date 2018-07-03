import { timeout as timeoutFunc } from 'promise-timeout';
import { v4 as uuid } from 'uuid';
import { LedgerTransport, SendParams } from './ledgerTransport';

/**
 * Alternative implementation of Ledger communication using embedded Iframe from HTTPS location.
 *
 * This is needed in case the Application is not server through HTTPS or is a browser extention.
 */
export class LedgerTransportIframe implements LedgerTransport {
    private debug: boolean;
    private forwarderUrl: string;
    private channel: MessageChannel;
    private iframe: HTMLIFrameElement;

    /**
     * Creates Iframe transport
     * @param forwarderUrl HTTPS url of Forwarder
     * @param debug Enable debug messages
     */
    constructor(forwarderUrl: string, debug: boolean = false) {
        this.forwarderUrl = forwarderUrl;
        this.debug = debug;
    }

    /**
     * Connects to the Ledger HW and creates transport.
     *
     * Caution: Transport needs to be close before creating new one.
     * Otherwise the new one might fail.
     */
    async open() {
        const [channel, iframe] = await createChannel(this.forwarderUrl, this.debug);

        this.channel = channel;
        this.iframe = iframe;
        await sendToChannel(this.channel, { id: uuid(), method: 'open' });
    }

    /**
     * Closes the transport connection to the Ledger HW.
     */
    async close() {
        await sendToChannel(this.channel, { id: uuid(), method: 'close' });
        await closeChannel(this.channel, this.iframe);
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
        const response = await sendToChannel(this.channel, {
            id: uuid(),
            method: 'send',
            cla: params.cla,
            ins: params.ins,
            p1: params.p1,
            p2: params.p2,
            data,
            statusList
        });

        return response.result;
    }
}

export interface ChannelMessage {
    id: string;
}

export interface ChannelResponse extends ChannelMessage {
    result: string;
}

export async function createChannel(forwarderUrl: string, debug: boolean) {
    const promise = new Promise<[MessageChannel, HTMLIFrameElement]>((resolve, reject) => {
        const channel: MessageChannel = new MessageChannel();
        const iframe = document.createElement('iframe');

        const ready = (message: any) => {
            if (debug) {
                // tslint:disable-next-line:no-console
                console.log('Received ready message from Iframe.', message);
            }

            if (message.data === 'ready') {
                channel.port1.removeEventListener('message', ready);
                resolve([channel, iframe]);
            } else {
                if (debug) {
                    // tslint:disable-next-line:no-console
                    console.error('First event on Iframe port was not "ready"');
                }
            }
        };
        channel.port1.addEventListener('message', ready);
        channel.port1.start();

        iframe.src = forwarderUrl;
        iframe.setAttribute('style', 'display:none');
        iframe.addEventListener('load', () => {
            if (debug) {
                // tslint:disable-next-line:no-console
                console.log('Load event of Iframe fired.');
            }

            if (iframe == null || iframe.contentWindow == null) {
                reject('Can not find Ledger forwarder IFrame.');
                return;
            }

            iframe.contentWindow.postMessage('init', '*', [channel.port2]);
        });
        document.body.appendChild(iframe);
    });

    return timeoutFunc(promise, 2000);
}

export async function closeChannel(channel: MessageChannel, iframe: HTMLIFrameElement) {
    const promise = new Promise<void>((resolve, reject) => {
        if (iframe == null || iframe.contentWindow == null) {
            reject('Can not find Ledger forwarder IFrame');
            return;
        }

        iframe.contentWindow.postMessage('close', '*');
        channel.port1.close();
        document.body.removeChild(iframe);
        resolve();
    });

    return timeoutFunc(promise, 2000);
}

export async function sendToChannel<T extends ChannelMessage>(channel: MessageChannel, msg: T, timeoutMs = 2000) {
    const promise = new Promise<ChannelResponse>((resolve) => {

        const listener = (result: MessageEvent) => {
            const data = result.data as ChannelResponse;

            if (data.id === msg.id) {
                channel.port1.removeEventListener('message', listener);
                resolve(data);
            }
        };

        channel.port1.addEventListener('message', listener);
        channel.port1.postMessage(msg);
    });

    return timeoutFunc(promise, timeoutMs);
}
