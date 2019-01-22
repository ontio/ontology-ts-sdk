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

import * as crypto from 'crypto';
import * as elliptic from 'elliptic';
import * as pkcs7 from 'pkcs7';

export class Ecies {
    /**
     * Algorithm used for encryption.
     */
    encAlg: string;
    /**
     * Hash Algorithm used for kdf.
     */
    hashAlg: string;
    /**
     * Hash digest byte size.
     */
    digestSize: number;
    /**
     * Key input and out put format.
     */
    keyFormat: string;
    /**
     * Initialized Vector
     */
    iv: Buffer;
    /**
     * Elliptic Curve instance
     */
    ec: any;
    /**
     * key pair from
     * ec instance
     */
    keyPair: any;

    /**
     * if true, the pubkey will be
     * in compressed format, begin with '02' or '03'.
     * if false, begin with '04'
     */
    compact: boolean;

    /**
     * for curve name,
     * go https://github.com/indutny/elliptic
     * for reference
     */
    constructor(Curve: string) {
        // default setting
        this.encAlg = 'aes-256-cbc';
        this.hashAlg = 'sha256';
        this.digestSize = 32;
        this.keyFormat = 'hex';
        this.compact = true;

        // const curve = Curve || 'secp256r1';
        const curve = Curve || 'p256';

        this.ec = new elliptic.ec(curve);
        this.keyPair = this.ec.genKeyPair();
        this.iv = Buffer.alloc(0);
    }
    /**
     * generate random key pair
     */
    generateKeyPair(): any {
        this.keyPair = this.ec.genKeyPair();
        return {
            priv: this.keyPair.getPrivate('hex'),
            pub: this.keyPair.getPublic(this.compact, 'hex')
        };
    }
    /**
     * set key pair with private key
     * @param privHex private key in hex coding.
     */
    setKeyPair(privHex: string) {
        this.keyPair = this.ec.keyFromPrivate(privHex, 'hex');
    }
    /**
     * get key pair in use
     * @return = {pri, pub}
     * all in hex coding.
     */
    getKeyPair(): any {
        return {
            priv: this.keyPair.getPrivate('hex'),
            pub: this.keyPair.getPublic(this.compact, 'hex')
        };
    }

    /**
     * encrypt a message with given
     * public key and initialized vector
     *
     * @param pubkey hex string of public key
     * @param msg byte buffer of message
     * @param keylen byte length of kdf's output.
     */
    // tslint:disable-next-line:variable-name
    enc(pubkey: string, msg: Buffer, keylen: number, _iv?: string): any {
        const publicB = this.ec.keyFromPublic(pubkey, 'hex').getPublic();

        // generate a random number
        // r = (0, order)
        const tmpKP = this.ec.genKeyPair();
        const r = tmpKP.getPrivate();

        const gTilde = tmpKP.getPublic();
        const hTilde = publicB.mul(r);

        const out = gTilde.encode('hex');
        const PEH = hTilde.getX().toString('hex');
        const seed = Buffer.from(out + PEH, 'hex');

        const derivedKeyArray = this.kdf2(
            seed,
            keylen * 8,
            this.digestSize,
            this.hashAlg
        );
        if (!derivedKeyArray) {
            return;
        }
        const derivedKey = Buffer.concat(derivedKeyArray);

        let iv = Buffer.alloc(16);
        if (!_iv) {
            // generate a random iv, fixed size
            crypto.randomFillSync(iv);
        } else {
            iv = Buffer.from(_iv, 'hex');
        }

        const algorithm = this.encAlg;

        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
        cipher.setAutoPadding(false);

        const msgCipher =
            cipher.update(pkcs7.pad(msg), 'binary', 'hex') +
            cipher.final('hex');

        return {
            iv: iv.toString('hex'),
            out,
            msgCipher
        };
    }
    /**
     * encrypt a message with given
     * public key and initialized vector
     *
     * @param msgCipher
     * @param out
     * @param iv
     * @param keylen
     */
    dec(msgCipher: string, out: string, iv: any, keylen: number): Buffer {
        const gTilde = this.ec.keyFromPublic(out, 'hex').getPublic();

        const hTilde = gTilde.mul(this.keyPair.getPrivate());
        const PEH = hTilde.getX().toString('hex');
        const seed = Buffer.from(out + PEH, 'hex');

        const derivedKeyArray = this.kdf2(
            seed,
            keylen * 8,
            this.digestSize,
            this.hashAlg
        );
        if (!derivedKeyArray) {
            return Buffer.alloc(0);
        }
        const derivedKey = Buffer.concat(derivedKeyArray);
        const iv2 = Buffer.from(iv, 'hex');

        const algorithm = this.encAlg;
        const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv2);
        decipher.setAutoPadding(false);
        const plain =
            decipher.update(msgCipher, 'hex', 'binary') +
            decipher.final('binary');

        // un padding
        const unpad = pkcs7.unpad(Buffer.from(plain, 'binary'));

        return Buffer.from(unpad);
    }

    /* utils */
    kdf2(
        seed: Buffer,
        len: number,
        digestSize: number,
        hashFunc: string
    ): Buffer[] {
        if (len < 0) {
            return [];
        }
        const byteLen = Math.ceil(len / 8);
        const b = Math.ceil(byteLen / digestSize);
        const key = [];
        const offset = byteLen - (b - 1) * digestSize; // byte offset

        let counter = 1; // 1 for pbkdf2, 0 for pbkdf1

        let hashIns;
        while (counter < b) {
            hashIns = crypto.createHash(hashFunc);
            const h = hashIns
                .update(Buffer.concat([seed, this.I2OSP(counter, 4)]))
                .digest();
            key[counter - 1] = Buffer.alloc(offset);
            key[counter - 1] = h;
            counter++;
        }
        hashIns = crypto.createHash(hashFunc);
        const hEnd = hashIns
            .update(Buffer.concat([seed, this.I2OSP(counter, 4)]))
            .digest();
        key[counter - 1] = Buffer.alloc(offset);
        key[counter - 1] = hEnd;

        return key;
    }

    I2OSP(num: number, len: number): Buffer {
        const buf = Buffer.allocUnsafe(len);
        buf.writeUIntBE(num, 0, len);
        return buf;
    }
}
