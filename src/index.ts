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

import { Account } from './account'
import { Identity } from './identity'
import { Wallet } from './wallet'
import { Claim } from './claim'
import { Transaction } from './transaction/transaction'
import * as TransactionBuilder from './transaction/transactionBuilder'
import {Parameter, ParameterType} from './smartcontract/abi/parameter'
import AbiFunction from './smartcontract/abi/abiFunction'
import AbiInfo from './smartcontract/abi/abiInfo'
import * as Token from './smartcontract/token'
import * as OntidContract from './smartcontract/ontidContract'
import RestClient from './network/rest/restClient'
import RpcClient from './network/rpc/rpcClient'
import WebSocketClientApi from './network/websocket/websocketClient'

import * as scrypt from './scrypt'
import * as core from './core'
import * as utils from './utils'
import * as CONST from './consts'
import { SDK } from './sdk/index'

class ONT {
  Account : any
  Identity : any
  Claim : any
  Transaction : any
  TransactionBuilder : any
  Parameter : any
  ParameterType : any
  AbiFunction : any
  AbiInfo : any
  core : any
  utils : any
  scrypt : any
  CONST : any
  Wallet : any
  SDK : any
  Token : any
  OntidContract : any
  RestClient : any
  RpcClient : any
  WebSocketClientApi : any

  constructor() {
    this.Account = Account,
    this.Identity = Identity,
    this.Claim = Claim,
    this.Transaction = Transaction,
    this.TransactionBuilder = TransactionBuilder,
    this.Parameter = Parameter
    this.ParameterType = ParameterType
    this.AbiFunction = AbiFunction
    this.AbiInfo = AbiInfo
    this.core = core,
    this.utils = utils,
    this.scrypt = scrypt,
    this.CONST = CONST,
    this.Wallet = Wallet,
    this.SDK = SDK,
    this.Token = Token,
    this.OntidContract = OntidContract
    this.RestClient = RestClient
    this.RpcClient = RpcClient
    this.WebSocketClientApi = WebSocketClientApi
  }
  

  setNode (url : string) {
    this.CONST.TEST_NODE = url
  }

  setRpcPort(port : string) {
    this.CONST.HTTP_JSON_PORT = port
  }

  setRestPort(port: string) {
    this.CONST.HTTP_REST_PORT = port
  }

  setSocketPort(port: string) {
    this.CONST.HTTP_WS_PORT = port
  }
}

export default ONT
export {
  Account,
  Identity,
  Claim,
  Transaction,
  Parameter,
  ParameterType,
  AbiFunction,
  AbiInfo,
  TransactionBuilder,
  core,
  utils,
  scrypt,
  CONST,
  Wallet,
  SDK,
  Token,
  OntidContract,
  RestClient,
  RpcClient,
  Web
}
  