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

    constructor() {
        this.Format = "pgp";
        this.Algorithm = "ECDSAwithSHA256";
     }
}

export class Claim {
    Context : string
    Id : string
    Content : {}
    Metadata : Metadata
    Signature : Signature

    constructor(context:string, content: {}, metadata:Metadata) {
        this.Context = context
        this.Content = content
        this.Metadata = metadata
        let body = {
            Context : context,
            Content : content,
            Metadata : metadata
        }
        this.Id = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(JSON.stringify(body))).toString()
    }

    sign( privateKey: string ) {
        let claimBody = {
            Context: this.Context,
            Id: this.Id,
            Content: this.Content,
            Metadata: this.Metadata
        }
        let unsignedData = JSON.stringify(claimBody) 
        let signatureValue = signatureData(unsignedData, privateKey)

        let sig = new Signature();
        sig.Value = signatureValue;
        this.Signature = sig

        return sig

    }
}