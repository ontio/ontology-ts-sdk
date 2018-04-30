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

import * as CryptoJS from 'crypto-js'
import { buildGetPublicKeyIdTx } from './smartcontract/ontidContract';
import { ab2hexstring, str2hexstr } from './utils';
import { buildRestfulParam } from './transaction/transactionBuilder';
import RestClient from './network/rest/restClient'
import { PgpSignature, PrivateKey } from './crypto';

export enum RevocationType {
    Contract = 'Contract',
    RevocationList = 'RevocationList'
}

export class Metadata {
    CreateTime : string
    Issuer : string
    Subject : string
    Expires : string
    Revocation : {}
    // Crl : string
    constructor(){}
}

export class Claim {
    Context : string
    Id : string
    Content : {}
    Metadata : Metadata
    Signature : PgpSignature

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

    sign( privateKey: PrivateKey ) {
        let claimBody = {
            Context: this.Context,
            Id: this.Id,
            Content: this.Content,
            Metadata: this.Metadata
        }
        let unsignedData = JSON.stringify(claimBody) 
        const signature = privateKey.sign(str2hexstr(unsignedData));
        this.Signature = signature.serializePgp();

        //TODO: get pkId and set into Signature
        // const issuer = this.Metadata.Issuer
        // const pk = ab2hexstring(getPublicKey(privateKey, true))
        // let tx = buildGetPublicKeyIdTx(issuer, pk)
        // let restClient = new RestClient()
        // return restClient.sendRawTransaction(tx.serialize(), true).then( res => {
        //     sig.PublicKeyId = issuer + '#' + res.result
        //     this.Signature = sig
        //      return this
        // })


        return this.Signature;

    }
}