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

import { Account } from './account';
import { Claim } from './claim';
import * as CONST from './consts';
import * as Crypto from './crypto';
import { Identity } from './identity';
import * as NeoCore from './neocore';
import RestClient from './network/rest/restClient';
import RpcClient from './network/rpc/rpcClient';
import { WebsocketClient } from './network/websocket/websocketClient';
import * as scrypt from './scrypt';
import { SDK } from './sdk/index';
import AbiFunction from './smartcontract/abi/abiFunction';
import AbiInfo from './smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from './smartcontract/abi/parameter';
import Struct from './smartcontract/abi/struct';
import * as GovernanceTxBuilder from './smartcontract/nativevm/governanceContractTxBuilder';
import * as OntAssetTxBuilder from './smartcontract/nativevm/ontAssetTxBuilder';
import * as OntidContract from './smartcontract/nativevm/ontidContractTxBuilder';
import * as Token from './smartcontract/nativevm/token';
import * as Oep4 from './smartcontract/neovm/oep4TxBuilder';
import * as Oep5 from './smartcontract/neovm/oep5TxBuilder';
import * as Oep8 from './smartcontract/neovm/oep8TxBuilder';
import { DDO, DDOAttribute } from './transaction/ddo';
import * as ScriptBuilder from './transaction/scriptBuilder';
import { Transaction } from './transaction/transaction';
import * as TransactionBuilder from './transaction/transactionBuilder';
import { Transfer } from './transaction/transfer';
import { TxSignature } from './transaction/txSignature';
import * as utils from './utils';
import { Wallet } from './wallet';

class ONT {
    Account: any;
    Identity: any;
    Claim: any;
    DDO: any;
    DDOAttribute: any;
    Transaction: any;
    Transfer: any;
    TxSignature: any;
    TransactionBuilder: any;
    OntAssetTxBuilder: any;
    Parameter: any;
    ParameterType: any;
    AbiFunction: any;
    AbiInfo: any;
    utils: any;
    scrypt: any;
    CONST: any;
    Wallet: any;
    SDK: any;
    Token: any;
    OntidContract: any;
    GovernanceTxBuilder: any;
    RestClient: any;
    RpcClient: any;
    WebsocketClient: any;
    Crypto: any;
    Struct: any;
    ScriptBuilder: any;
    NeoCore: any;
    Oep4: any;
    Oep8: any;
    Oep5: any;

    constructor() {
        this.Account = Account;
        this.Identity = Identity;
        this.Claim = Claim;
        this.DDO = DDO;
        this.DDOAttribute = DDOAttribute;
        this.Transaction = Transaction;
        this.Transfer = Transfer;
        this.TxSignature = TxSignature;
        this.TransactionBuilder = TransactionBuilder;
        this.OntAssetTxBuilder = OntAssetTxBuilder;
        this.GovernanceTxBuilder = GovernanceTxBuilder;
        this.Parameter = Parameter;
        this.ParameterType = ParameterType;
        this.AbiFunction = AbiFunction;
        this.AbiInfo = AbiInfo;
        this.utils = utils;
        this.scrypt = scrypt;
        this.CONST = CONST;
        this.Wallet = Wallet;
        this.SDK = SDK;
        this.Token = Token;
        this.OntidContract = OntidContract;
        this.RestClient = RestClient;
        this.RpcClient = RpcClient;
        this.WebsocketClient = WebsocketClient;
        this.Crypto = Crypto;
        this.Struct = Struct;
        this.ScriptBuilder = ScriptBuilder;
        this.NeoCore = NeoCore;
        this.Oep4 = Oep4;
        this.Oep8 = Oep8;
        this.Oep5 = Oep5;
    }
    setNode(url: string) {
        this.CONST.TEST_NODE = url;
    }

    setRpcPort(port: string) {
        this.CONST.HTTP_JSON_PORT = port;
    }

    setRestPort(port: string) {
        this.CONST.HTTP_REST_PORT = port;
    }

    setSocketPort(port: string) {
        this.CONST.HTTP_WS_PORT = port;
    }
}

export default ONT;

export {
    Account,
    Identity,
    Claim,
    DDO,
    DDOAttribute,
    Transaction,
    Transfer,
    TxSignature,
    Parameter,
    ParameterType,
    AbiFunction,
    AbiInfo,
    TransactionBuilder,
    OntAssetTxBuilder,
    GovernanceTxBuilder,
    utils,
    scrypt,
    CONST,
    Wallet,
    SDK,
    Token,
    OntidContract,
    RestClient,
    RpcClient,
    WebsocketClient,
    Crypto,
    Struct,
    ScriptBuilder,
    NeoCore,
    Oep4,
    Oep8,
    Oep5
};
