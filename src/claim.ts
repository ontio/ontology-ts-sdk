import * as CryptoJS from 'crypto-js'
var ec = require('elliptic').ec
import { signatureData } from './core'
import * as Utils from './utils'

export class Metadata {
    CreateTime : string
    Issuer : string
    Subject : string
    Expires : string
    Revocation : string
    Crl : string

    constructor(){}
}

export class Signature {
    Format : string
    Algorithm : string
    Value : string

    constructor() { }
}

export class Claim {
    unsignedData: string;
    signedData: string;

    Context : string
    Id : string
    Content : {}
    Metadata : Metadata
    Signature : Signature

    constructor(context:string, content: {}, metadata:Metadata) {
        this.Context = context
        this.Id = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(JSON.stringify(content))).toString()
        this.Content = content
        this.Metadata = metadata

        let claimBody = {
            Context: this.Context,
            Id: this.Id,
            Content: this.Content,
            Metadata: this.Metadata
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

        sig.Format = "pgp";
        sig.Algorithm = "ECDSAwithSHA256";
        sig.Value = signatureValue;
        this.Signature = sig

        claimData.signature = sig;
        this.signedData = JSON.stringify(claimData)
        return this.signedData;
    }
}