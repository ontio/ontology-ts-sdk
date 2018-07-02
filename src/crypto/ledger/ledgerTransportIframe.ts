import { timeout as timeoutFunc } from 'promise-timeout';
import { v4 as uuid } from 'uuid';
import { LedgerTransport, SendParams } from './ledgerTransport';

export class LedgerTransportIframe implements LedgerTransport {
    private channel: MessageChannel = new MessageChannel();

    /**
     * Connects to the Ledger HW and creates transport.
     *
     * Caution: Transport needs to be close before creating new one.
     * Otherwise the new one might fail.
     */
    async open() {
        this.channel = await createChannel();
        await sendToChannel(this.channel, { id: uuid(), method: 'open' });
    }

    /**
     * Closes the transport connection to the Ledger HW.
     */
    async close() {
        await sendToChannel(this.channel, { id: uuid(), method: 'close' });
        await closeChannel(this.channel);
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

export async function createChannel() {
    const promise = new Promise<MessageChannel>((resolve, reject) => {
        const channel: MessageChannel = new MessageChannel();
        const iframe: HTMLIFrameElement | null = document.querySelector('#ledger-forwarder');

        if (iframe == null || iframe.contentWindow == null) {
            reject('Can not find Ledger forwarder IFrame');
            return;
        }

        const ready = (message: any) => {
            if (message.data === 'ready') {
                channel.port1.removeEventListener('message', ready);
                resolve(channel);
            } else {
                // tslint:disable-next-line:no-console
                console.error('First event on iframe port was not "ready"');
            }
        };
        channel.port1.addEventListener('message', ready);
        channel.port1.start();

        iframe.addEventListener('load', () => {
            if (iframe == null || iframe.contentWindow == null) {
                reject('Can not find Ledger forwarder IFrame.');
                return;
            }

            iframe.contentWindow.postMessage('init', '*', [channel.port2]);
        });
    });

    return timeoutFunc(promise, 2000);
}

export async function closeChannel(channel: MessageChannel) {
    const promise = new Promise<void>((resolve, reject) => {
        const iframe: HTMLIFrameElement | null = document.querySelector('#ledger-forwarder');

        if (iframe == null || iframe.contentWindow == null) {
            reject('Can not find Ledger forwarder IFrame');
            return;
        }

        iframe.contentWindow.postMessage('close', '*');
        channel.port1.close();
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
