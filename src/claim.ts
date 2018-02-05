import * as CryptoJS from 'crypto-js'
var ec = require('elliptic').ec

import * as Utils from './utils'

export class Metadata {
    constructor(metadata : {} ){
        this.Context = metadata.Context
        this.Issuer = metadata.Issuer
        this.Subject = metadata.Subject
        this.Expires = metadata.Expires
        this.Revocation = metadata.Revocation
        this.Crl = metadata.Crl
    }
}

export class Claim {
    unsignedData: string;
    signedData: string;

    Context : string
    Id : string
    Claim : {}
    Metadata : Metadata
    Signature : {}

    constructor(context:string,id:string, claim: {}, metadata:Metadata, privateKey: string ) {
        this.Context = context
        this.Id = id
        this.Claim = claim
        this.Metadata = metadata
        this.unsignedData = this.create( claim );
        this.signedData = this.sign( this.unsignedData, privateKey );
    }

    create( claim : {} ): string {
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

        return JSON.stringify(this);
    }

    sign( unsignedData: string, privateKey: string ): string {
        let msg = CryptoJS.enc.Hex.parse(unsignedData);
        let msgHash = CryptoJS.SHA256(msg);
        let elliptic = new ec('p256') 
        const sig = elliptic.sign(msgHash.toString(), privateKey, null)
        const signatureValue = Buffer.concat([
            sig.r.toArrayLike(Buffer, 'be', 32),
            sig.s.toArrayLike(Buffer, 'be', 32)
          ])
        //let signatureValue = Secp256r1.sign(new Buffer(msgHash.toString(), "HEX"), new Buffer(privateKey, "HEX"));
    
        let claimData = JSON.parse(unsignedData);
        let Signature = { "Format":"", "Algorithm":"", "Value":"" };

        Signature.Format = "pgp";
        Signature.Algorithm = "ECDSAwithSHA256";
        Signature.Value = signatureValue.toString('hex');
        this.Signature = Signature

        claimData.Signature = Signature;

        return JSON.stringify(claimData);
    }
}