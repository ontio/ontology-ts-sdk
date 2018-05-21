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

import { MAIN_ONT_URL, TEST_ONT_URL } from '../../consts';

/**
 * Creates WebSocket.
 *
 * In node environment html5-websocket is used. In browser, native WebSocket is used.
 *
 * @param url Url to connect to
 */
function getWebSocket(url: string): WebSocket {
    if (typeof WebSocket === 'undefined') {
        const WS = require('html5-websocket');
        return new WS(url);
    } else {
        return new WebSocket(url);
    }
}

export class WebsocketSender {
    url: string;
    debug: boolean;

    constructor(url = TEST_ONT_URL.SOCKET_URL, debug = false) {
        this.url = url;
        this.debug = debug;
    }

    send(param: string, callback: (err: any, res: any, socket: WebSocket | null) => any) {
        if (!param) {
            return;
        }

        const socket = getWebSocket(this.url);

        socket.onopen = () => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('connected');
            }
            socket.send(param);
        };

        socket.onmessage = (event) => {
            let res: any;
            if (typeof event.data === 'string') {
                res = JSON.parse(event.data);
            } else {
                res = event.data;
            }

            // pass socket to let caller decide when to close the it.
            if (callback) {
                callback(null, res, socket);
            }
        };

        socket.onerror = (err: any) => {
            if (this.debug) {
                // tslint:disable-next-line:no-console
                console.log('error', err);
            }
            // no server or server is stopped
            callback(err, null, null);
            socket.close();
        };
    }
}
