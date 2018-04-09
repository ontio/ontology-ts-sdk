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
    "curve": "secp256r1" // also called p256
  }
}

export const ALGORITHM_TYPE = {

}

export const TEST_NODE = '139.219.111.50'
// export const TEST_NODE = '192.168.50.10'

// export const TEST_NODE = '54.222.182.88'
export const MAIN_NODE = '54.222.182.88'


export const HTTP_REST_PORT = '20334'
export const HTTP_WS_PORT   = '20335'
export const HTTP_JSON_PORT = '20336'

export const REST_API = {
  getBalance: '/api/v1/balance',
  sendRawTx: '/api/v1/transaction',
  getMerkleProof : '/api/v1/merkleproof' // end with /txHash
}


export const ONT_NETWORK = {
  MAIN : 'MainNet',
  TEST : 'TestNet'
}

export const TEST_ONT_URL = {
  SOCKET_URL: `ws://${TEST_NODE}:${HTTP_WS_PORT}`,

  RPC_URL: `http://${TEST_NODE}:${HTTP_JSON_PORT}`,

  REST_URL: `http://${TEST_NODE}:${HTTP_REST_PORT}`,

  sendRawTxByRestful : `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.sendRawTx}`
}

export const MAIN_ONT_URL = {
  SOCKET_URL: `ws://${MAIN_NODE}:${HTTP_WS_PORT}`,

  RPC_URL: `http://${MAIN_NODE}:${HTTP_JSON_PORT}/`,

  REST_URL: `http://${MAIN_NODE}:${HTTP_REST_PORT}/`,

  sendRawTxByRestful : `http://${TEST_NODE}:${HTTP_REST_PORT}${REST_API.sendRawTx}`

}


export const TOKEN_TYPE = {
  ONT : 'ONT',
  ONG : 'ONG'
}