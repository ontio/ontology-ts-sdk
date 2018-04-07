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

import {ONT_NETWORK, MAIN_ONT_URL, TEST_ONT_URL} from '../consts'
import {Transaction} from './transaction'
import axios from 'axios'

var WebSocket : any
if(typeof window != 'undefined' && (window as any).WebSocket){
 WebSocket = (window as any).WebSocket
} else {
    WebSocket = require('ws')
}

export default class TxSender {
    SOCKET_URL : string

    constructor (socketUrl : string) {
        this.SOCKET_URL = socketUrl
    }

    sendTxWithSocket(param : string, callback : (res:any, socket:any) => any) {
        if(!param) return;
        const socket = new WebSocket(this.SOCKET_URL)
        socket.onopen = () => {
            console.log('connected')
            socket.send(param)
        }
        socket.onmessage = (event : any) => {
            let res
            if (typeof event.data === 'string') {
                res = JSON.parse(event.data)
            } else {
                res = event.data
            }
        
            //pass socket to let caller decide when to close the it.
            if(callback) {
                callback(res, socket)
            }
        }
        socket.onerror = (event : any) => {
            //no server or server is stopped
            console.log(event)
            socket.close()
        }
    }

}