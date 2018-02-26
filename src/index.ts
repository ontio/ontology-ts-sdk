import { Account } from './account'
import { Identity } from './identity'
import { Wallet } from './wallet'
import { Claim } from './claim'
import { Transaction } from './transaction'
import * as scrypt from './scrypt'
import * as core from './core'
import * as utils from './utils'
import * as CONST from './consts'
import { SDK } from './SDK/index'
export {
    Account,
    Identity,
    Claim,
    Transaction,
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