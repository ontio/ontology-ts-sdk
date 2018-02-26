import * as CryptoJS from 'crypto-js'
var ec = require('elliptic').ec
import { signatureData } from './core'
import * as Utils from './utils'

export class Metadata {
    createTime : string
    issuer : string
    subject : string
    expires : string
    revocation : string
    crl : string

    constructor(){}
}

export class Signature {
    format : string
    algorithm : string
    value : string

    constructor() { }
}

export class Claim {
    unsignedData: string;
    signedData: string;

    context : string
    id : string
    claim : {}
    metadata : Metadata
    signature : Signature

    constructor(context:string, claim: {}, metadata:Metadata) {
        this.context = context
        this.id = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(JSON.stringify(claim))).toString()
        this.claim = claim
        this.metadata = metadata

        let claimBody = {
            context: this.context,
            id: this.id,
            claim: this.claim,
            metadata: this.metadata
        }  
        this.unsignedData = JSON.stringify(claimBody) 
    }

    sign( privateKey: string ): string {
        // let msg = CryptoJS.enc.Hex.parse(unsignedData);
        // let msgHash = CryptoJS.SHA256(msg);
        // let elliptic = new ec('p256') 
        // const sig = elliptic.sign(msgHash.toString(), privateKey, null)
        // const signatureValue = Buffer.concat([
        //     sig.r.toArrayLike(Buffer, 'be', 32),
        //     sig.s.toArrayLike(Buffer, 'be', 32)
        //   ])
        //let signatureValue = Secp256r1.sign(new Buffer(msgHash.toString(), "HEX"), new Buffer(privateKey, "HEX"));
    
        let signatureValue = signatureData(this.unsignedData, privateKey)
        let claimData = JSON.parse(this.unsignedData);
        let sig = new Signature();

        sig.format = "pgp";
        sig.algorithm = "ECDSAwithSHA256";
        sig.value = signatureValue;
        this.signature = sig

        claimData.signature = sig;
        this.signedData = JSON.stringify(claimData)
        return this.signedData;
    }
}