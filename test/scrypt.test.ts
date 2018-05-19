import { PublicKey } from './../src/crypto/PublicKey';
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
import * as scrypt from '../src/scrypt'
import * as core from '../src/core'
import { ERROR_CODE } from '../src/error';
import { ab2hexstring, str2hexstr } from '../src/utils';
import { PrivateKey, KeyType, KeyParameters, CurveLabel , Address} from '../src/crypto';
import { Account } from '../src/account';
import { u160ToAddress } from '../src/core';

describe('test scrypt', () => {
    it('test encrypt and decrypt', () => {
        // let privateKey = PrivateKey.random();
        let privateKey = new PrivateKey('40b6b5a45bc3ba6bd4f49b0c6b024d5c6851db4cdf1a99c2c7adad9675170b07')
        let publicKey = privateKey.getPublicKey().serializeHex()
        let address = Address.addressFromPubKey(privateKey.getPublicKey())
        console.log('add: '+address)
        
        let encrypt = scrypt.encrypt(privateKey.key, publicKey, '123456')
        expect(encrypt).toBeDefined()

        let encryptPri = privateKey.encrypt('123456')

        let decryptPri =  encryptPri.decrypt('123456', address)

        expect(decryptPri.key).toEqual(privateKey.key)
        
        // console.log('encrypt : '+ encrypt)

        // let checksum = core.getChecksumFromAddress(address)
        
        // let decrypt = scrypt.decrypt(encrypt, '123456', checksum)
        // expect(decrypt).toEqual(privateKey.key)
        
        

        // const key = '6PYReg3c35DGiwKvfTCKSFHEUv9imMoLNXu5RWsYi3Y9C8EQzTDKfWvLzv';
        // let pass = 'passwordtest'
        // let pri = scrypt.decrypt(key, pass)
        // scrypt.checkDecrypted(key, pri, new PrivateKey(pri).getPublicKey().key);
        // console.log(pri)
    })

})

