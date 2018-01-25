import * as Packet from './packet'
import { Claim } from './claim'
import { Transaction } from './transaction'
import * as Core from './core'
import * as utils from './utils'
import * as CONST from './consts'

export {
    Packet,
    Claim,
    Transaction,
    Core,
    utils,
    CONST
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

// var a = Core.getPrivateKeyFromWIF("L44B5gGEpqEDRS9vVPz7QT35jcBG2r3CZwSwQ4fCewXAhAhqGVpP");
// console.log(a);

var b = Packet.encrypt( "KwYgW8gcxj1JWJXhPSu4Fqwzfhp5Yfi42mdYmMa4XqK7NJxXUSK7", "Satoshi" );
console.log( b );

Packet.decrypt( "6PYN6mjwYfjPUuYT3Exajvx25UddFVLpCw4bMsmtLdnKwZ9t1Mi3CfKe8S", "Satoshi" );