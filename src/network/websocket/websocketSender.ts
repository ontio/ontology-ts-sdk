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
import * as Html5WebSocket from '@ont-community/html5-websocket';
import * as WebSocketAsPromised from 'websocket-as-promised';
import { TEST_ONT_URL } from '../../consts';

/**
 * We can import html5-websocket directly, because webpack will use html5-websocket/browser.js
 * in browser environment, which does not require 'ws'.
 */

 /**
  * Websocket sender for send messages and handle notify.
  */
export class WebsocketSender {
    private static generateReqId() {
        return Math.floor(Math.random() * 10e8);
    }

    debug: boolean;

    private wsp: any;    // WebSocketAsPromised

    constructor(url = TEST_ONT_URL.SOCKET_URL, debug = false) {
        this.debug = debug;
        this.wsp = new WebSocketAsPromised(url, {
            createWebSocket: (socketUrl: string) => new Html5WebSocket(socketUrl),
            attachRequestId: (data: any, id: number) => ({ Id: id, ...data }),
            extractRequestId: (data: any) => data && data.Id,
            packMessage: (data: any) => JSON.stringify(data),
            unpackMessage: (message: string) => JSON.parse(message)
        });

        this.wsp.onOpen.addListener(() => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('connected');
            }
        });

        this.wsp.onClose.addListener(() => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('disconnected');
            }
        });

        this.wsp.onSend.addListener((message: any) => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('sent: ', message);
            }
        });

        this.wsp.onMessage.addListener((message: any) => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('received: ', message);
            }
        });

        this.wsp.onError.addListener((event: any) => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('error: ', event);
            }
        });
    }

    async send<T extends object>(param: T, close: boolean = true) {
        try {
            if (!param) {
                return;
            }

            await this.wsp.open();
            const response = await this.wsp.sendRequest(param, { requestId: WebsocketSender.generateReqId() });

            return response;
        } finally {
            if (close) {
                await this.wsp.close();
            }
        }
    }

    addListener(listener: (result: any) => void) {
        this.wsp.onUnpackedMessage.addListener(listener);
    }

    close() {
        this.wsp.close();
    }
}
