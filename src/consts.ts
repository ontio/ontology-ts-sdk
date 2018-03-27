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

export const ADDR_VERSION = '41'

export const DEFAULT_SCRYPT = {
    cost: 4096,// 除以2时间减半
    blockSize: 8,
    parallel: 8,
    size: 64
  }

  // specified by oep, same as bip38
export const OEP_HEADER = '0142'

export const OEP_FLAG = 'e0'


// Ont://nativeMethod?param1=xxx&param2=yyy
export const WEBVIEW_SCHEME = 'Ont'

export class Algorithm {
  algorithm: string
  parameters: {}
}

export const DEFAULT_ALGORITHM = {
  algorithm : "ECDSA",
  parameters : {
    "curve": "secp256r1"
  }
}


// export const Test_node = '52.80.115.91'
// export const Test_node = '192.168.3.128'
export const Test_node = '54.222.182.88'

export const HttpRestPort = '20334'
export const HttpWsPort   = '20385'
export const HttpJsonPort = '20386'

export const restApi = {
  getBalance: '/api/v1/balance',
  sendRawTx: '/api/v1/transaction'
}

export const sendRawTxByRestful = `http://${Test_node}:${HttpRestPort}${restApi.sendRawTx}`

export const Test_websocket_port = '20385'
export const Test_http_port = '20336'

export const tx_url = `http://${Test_node}:${Test_http_port}/`
export const socket_url = `ws://${Test_node}:${Test_websocket_port}`

export const ONT_NETWORK = {
  MAIN : 'MainNet',
  TEST : 'TestNet'
}

export const ONT_URL = {
  MAIN_SOCKET : socket_url,
  TEST_SOCKET : socket_url,

  MAIN_RPC : tx_url,
  TEST_PRC : tx_url
}

export const TOKEN_TYPE = {
  ONT : 'ONT',
  ONG : 'ONG'
}