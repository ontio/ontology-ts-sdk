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

import * as scrypt from './scrypt'
import * as core from './core'
import * as utils from './utils'
import * as CONST from './consts'
import { SDK } from './SDK/index'

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
      this.SDK = SDK
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
    SDK
  }
  
// var a = new Claim('{"Name":"zhangsan","Gender":"male","Age":25}',"8de516a7cddf22e328a61faf80f698ad7a410953d86fe06d031e08de7161a051")
// console.log(a.unsignedData)
// console.log(a.signedData)

// var a = new Transaction();
// var txData = a.makeInvokeCodeTransaction( "eacecb46f117f55c80147a9d391c7c65af10bd36", "ee6469643a6f6e743a41526a42735a32546e6f336345384e3132706631454b6a67464c37646a42475734", "037a1d32ff0f96f4a353097c2bed2fb4bff386467bddd9c907dcf3963aeb0b66e8" );
// console.log(txData);

// var sign = Core.signatureData( txData, "0eb7f605520dd843f930177c247e276bf8d65f5c35be1bcdac0078a25cf8fba3" );
// console.log(sign);

// var data = Core.AddContract( txData, sign, "037a1d32ff0f96f4a353097c2bed2fb4bff386467bddd9c907dcf3963aeb0b66e8" );
// console.log(data);

// var b = scrypt.encrypt( "KwYgW8gcxj1JWJXhPSu4Fqwzfhp5Yfi42mdYmMa4XqK7NJxXUSK7", "Satoshi" );
// console.log( b );

// scrypt.decrypt( "6PYN6mjwYfjPUuYT3Exajvx25UddFVLpCw4bMsmtLdnKwZ9t1Mi3CfKe8S", "Satoshi" );

// var privateKey = utils.ab2hexstring( core.generatePrivateKey() );
// console.log("privateKey:", privateKey);
// var a = new Account();
// var b = a.createSecp256r1( privateKey, "123456", "test" );
// console.log(b);
// a.decrypt( b, "123456" );


// var privateKey = utils.ab2hexstring( core.generatePrivateKey() );
// console.log("privateKey:", privateKey);
// var a = new Identity();
// var b = a.createSecp256r1( privateKey, "123456", "test" );
// console.log(b);
// console.log("ontid:",a.identity.ontid);
// a.decrypt( b, "123456" );

//var a = new Wallet();
// var b = a.create( "myName", "123456" );
// console.log(b);
//var b = '{"name":"myName","version":"1.0","scrypt":{"n":16384,"r":8,"p":8},"identities":[{"ontid":"did:ont:TRzzdEQDcyZLtrrgjA7iqxDM8ETv5VnHtZ","label":"Default Identity","isDefault":true,"lock":false,"controls":[{"algorithm":"ECDSA","parameters":{"curve":"secp256r1"},"id":"1","key":"6PYWBhHThQpuXzVKYD33RVNtKwjkY7oGYkbg1s1xZvnzdSQQEnW5wGpZQq"}],"extra":null}],"accounts":[{"address":"TFXZXPFCxvvunYxrUtxkNsKo9X9fHxATiD","label":"Default Account","isDefault":true,"lock":false,"algorithm":"ECDSA","parameters":{"curve":"secp256r1"},"key":"6PYMFiDpGEQnkmxGniLR4fhMkgFQmMv2RDGGhvtP1P5jZG2G3udvrb2zsX","contract":{"script":"210270cfbe2c5e3509f6ce639e6643409f71d537db8c3ced407c6774ea8b9d493868ac","parameters":[],"deployed":false},"extra":null}],"extra":null}';
//var b = '{"accounts":[{"address":"TEP9pXcePEALEvTqZq4YFikzBUWVhzkXYk","algorithm":"","contract":{"deployed":false,"parameters":["Signature"],"script":"2102738571174ca5f8eba804075d19b33b987641ba8a30061d94f87dc369d018cd19ac"},"isDefault":false,"key":"6PYVat55KiX14KxjAxPtxVCyiRAuL6HT9HF1cgmacrEsfWn3BQFrAqhMK1","label":"","lock":false,"parameter":""}],"identities":[{"controls":[{"algorithm":"ECDSA","id":"","key":"6PYWozsqytsiUoTfS6TVjn2hcYCdhwLfjiDBpC6pUwbGpBMFKjcvkrbX7S","parameters":{"curve":"secp256r1"}}],"isDefault":false,"label":"","lock":false,"ontid":"did:ont:TXfsPC6H2waHSKC7C6QnYZNiKgQibJeskU"}],"name":"ont","scrypt":{"n":16384,"p":8,"r":8},"version":"v1.0.0"}';
//a.decrypt( b, "123456" );


// for ( var i=0; i<100; i++ ){
//   var privateKey = utils.ab2hexstring( core.generatePrivateKey() );
//   var a = new Account();
//   var b = a.createSecp256r1( privateKey, "123456", "test" );
//   console.log(a.jsonData.address);
// }