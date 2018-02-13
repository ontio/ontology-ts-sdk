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

    constructor(context:string, claim: {}, metadata:Metadata, privateKey: string ) {
        this.context = context
        this.id = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(JSON.stringify(claim))).toString()
        this.claim = claim
        this.metadata = metadata
        this.unsignedData = this.create();
        this.signedData = this.sign( this.unsignedData, privateKey );
    }

    create(): string {
        // let claimData = { "Context":"", "Id":"", "Claim":{}, "Metadata":{} };
        // let MetaData  = { "CreateTime":"", "Issuer":"", "Subject":"", "Expires":"", "Revocation":"", "Crl":"" };
        // //let Signature = { "Format":"", "Algorithm":"", "Value":"" };

        // MetaData.CreateTime = "2017-01-01T22:01:20Z";
        // MetaData.Issuer = "did:ont:8uQhQMGzWxR8vw5P3UWH1j";
        // MetaData.Subject = "did:ont:4XirzuHiNnTrwfjCMtBEJ6";
        // MetaData.Expires = "2018-01-01";
        // MetaData.Revocation = "RevocationList";
        // MetaData.Crl = "http://192.168.1.1/rev.crl";

        // //Signature.Format = "pgp";
        // //Signature.Algorithm = "ECDSAwithSHA256";

        // claimData.Context = "claim:standard0001";
        // claimData.Id = "d3vfrev1590jcw";
        // claimData.Claim = JSON.parse(claimStr);
        // claimData.Metadata = MetaData;
        // //claimData.Signature = Signature;

        let claimBody = {
            context : this.context,
            id : this.id,
            claim : this.claim,
            metadata : this.metadata
        }
        return JSON.stringify( claimBody );
    }

    sign( unsignedData: string, privateKey: string ): string {
        // let msg = CryptoJS.enc.Hex.parse(unsignedData);
        // let msgHash = CryptoJS.SHA256(msg);
        // let elliptic = new ec('p256') 
        // const sig = elliptic.sign(msgHash.toString(), privateKey, null)
        // const signatureValue = Buffer.concat([
        //     sig.r.toArrayLike(Buffer, 'be', 32),
        //     sig.s.toArrayLike(Buffer, 'be', 32)
        //   ])
        //let signatureValue = Secp256r1.sign(new Buffer(msgHash.toString(), "HEX"), new Buffer(privateKey, "HEX"));
    
        let signatureValue = signatureData(unsignedData, privateKey)
        let claimData = JSON.parse(unsignedData);
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