import {ONT_NETWORK, ONT_URL} from '../consts'
import Transaction from './transaction'
import axios from 'axios'
const WebSocket = require('ws')

export default class TxSender {
    socket_url : string
    rpc_url : string

    constructor (net : string) {
        if(net === ONT_NETWORK.MAIN) {
            this.socket_url = ONT_URL.MAIN_SOCKET
            this.rpc_url = ONT_URL.MAIN_RPC
        } else {
            this.socket_url = ONT_URL.TEST_SOCKET
            this.rpc_url = ONT_URL.TEST_PRC
        }
    }

    sendTxWithSocket(param : string, callback : (res:any, socket:any) => any) {
        if(!param) return;
        const socket = new WebSocket(this.socket_url)
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
            // console.log('response for send tx: ' + JSON.stringify(res))
            // if (callback) {
            //     callback(event.data)
            //     socket.close()
            // }
            // if (res.Action === 'Notify') {
            //     let result = parseEventNotify(res)
            //     console.log('paresed event notify: ' + JSON.stringify(result))
            // }
            // socket.close()
        
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

    sendWithRpc(param : string) {
        return axios.post(this.rpc_url, param).then((res: any) => {
            if (typeof res == 'string') {
                res = JSON.parse(res)
            }
            res = res.data
            return res
        }, (err: any) => {
            console.log('err:' + err)
            return Promise.reject(err)
        })
    }
}