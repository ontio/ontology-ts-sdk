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
import { ERROR_CODE } from "../error";
import { u160ToAddress, addressToU160 } from "../core";
import { PublicKey } from "./PublicKey";
import * as core from '../core'


 export class Address {
     value : string
     
     constructor(value:string) {
        if(value.length === 40 || value.length === 34) {
            this.value = value
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
     }

     toBase58() {
         if(this.value.length === 34) {
             return this.value
         } else {
             return u160ToAddress(this.value)
         }
     }

     toHexString() {
         if(this.value.length === 40) {
             return this.value
         } else {
             return addressToU160(this.value)
         }
     }

     static addressFromPubKey(publicKey : PublicKey) : Address {
         let programHash = core.hash160(publicKey.serializeHex());
         programHash = '01' + programHash.substring(2)
         return new Address(programHash)
     }

     static addressFromMultiPubKeys(m : number, publicKeys : Array<PublicKey>) :Address {
         if(m <= 0 || m > publicKeys.length || publicKeys.length > 24 ) {
             throw ERROR_CODE.INVALID_PARAMS
         }
         const pkHexStrs = publicKeys.map( p => p.serializeHex())
         pkHexStrs.sort()
         let result = ''
         for(let s of pkHexStrs) {
            result += s
         }
         let programHash = core.hash160(result)
         programHash = '02' + programHash.substr(2)
         return new Address(programHash)
     }

 }