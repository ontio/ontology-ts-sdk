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
    alg = 'aes-256-cbc';
    hash = 'sha256';
    code = 'ascii';
    DigestSize = 32;
    keyFormat = 'hex';
    iv = crypto.randomBytes(16);
    ec = new elliptic.ec('secp256k1');
    keyPair = this.ec.genKeyPair();

    constructor(Curve = 'secp256k1', iv: Buffer, privHex?: string) {
        this.ec = new elliptic.ec(Curve);
        if (!this.iv) {
            this.iv = new Buffer('');
        } else {
            this.iv.copy(iv);
        }

        if (privHex) {
            this.setKeyPair(privHex);
        }
    }

    generateKeyPair() {
        this.keyPair = this.ec.genKeyPair();
        return {
            priv: this.keyPair.getPrivate('hex'),
            pub: this.keyPair.getPublic('hex')
        };
    }

    setKeyPair(privHex: string) {
        this.keyPair = this.ec.keyFromPrivate(privHex, 'hex');
    }

    getKeyPair() {
        return {
            priv: this.keyPair.getPrivate('hex'),
            pub: this.keyPair.getPublic('hex')
        };
    }

    setCurve(curve: string) {
        this.ec = new elliptic.ec(curve);
    }

    getCurve() {
        return this.ec.curve;
    }

    setHash(hashFunc: string) {
        this.hash = hashFunc;
    }

    getHash() {
        return this.hash;
    }

    enc(H: string, msg: string, iv: any) {
        const publicB = this.ec.keyFromPublic(H, 'hex').getPublic();

        const gTilde = this.keyPair.getPublic();
        const hTilde = publicB.mul(this.keyPair.getPrivate());

        const out = gTilde.encode('hex');
        const PEH = hTilde.getX().toString('hex');
        const seed = Buffer.from(out + PEH, 'hex');

        const derivedKeyArray = this.kdf2(seed, 256, this.DigestSize, this.hash);
        if (!derivedKeyArray) {
            return;
        }
        const derivedKey = Buffer.concat(derivedKeyArray);

        iv = iv || this.iv;

        const algorithm = this.alg;
        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
        cipher.setAutoPadding(false);

        const msgCipher = cipher.update(
                pkcs7.pad(Buffer.from(msg, 'utf8')),
                'binary',
                'hex'
            ) + cipher.final('hex');

        return {
            iv: iv.toString('hex'),
            out,
            msgCipher
        };
    }

    dec(msgCipher: string, out: string, iv: any) {
        const gTilde = this.ec.keyFromPublic(out, 'hex').getPublic();

        const hTilde = gTilde.mul(this.keyPair.getPrivate());
        const PEH = hTilde.getX().toString('hex');
        const seed = Buffer.from(out + PEH, 'hex');

        const derivedKeyArray = this.kdf2(seed, 256, this.DigestSize, this.hash);
        if (!derivedKeyArray) {
            return;
        }
        const derivedKey = Buffer.concat(derivedKeyArray);
        const iv2 = Buffer.from(iv, 'hex');

        const algorithm = this.alg;
        const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv2);
        decipher.setAutoPadding(false);
        const plain = decipher.update(msgCipher, 'hex', 'binary') + decipher.final('binary');

        return Buffer.from(pkcs7.unpad(Buffer.from(plain, 'binary'))).toString('utf8');
    }

    /* utils */
    kdf2(seed: Buffer, len: number, DigestSize: number, hashFunc: string): Buffer[] {
        if (len < 0) { return []; }
        const byteLen = Math.ceil(len / 8);
        const b = Math.ceil(byteLen / DigestSize);
        const key = [];
        const offset = byteLen - (b - 1) * DigestSize; // byte offset

        let counter = 1; // 1 for pbkdf2, 0 for pbkdf1

        let hashIns;
        while (counter < b) {
            hashIns = crypto.createHash(hashFunc);
            const h = hashIns.update(Buffer.concat([seed, this.I2OSP(counter, 4)]))
                .digest();
            key[counter - 1] = Buffer.from(h, 0, offset);
            counter++;
        }
        hashIns = crypto.createHash(hashFunc);
        const hEnd = hashIns.update(Buffer.concat([seed, this.I2OSP(counter, 4)]))
        .digest();
        key[counter - 1] = Buffer.from(hEnd, 0, offset);

        return key;
    }

    I2OSP(num: number, len: number): Buffer {
        const buf = Buffer.allocUnsafe(len);
        buf.writeUIntBE(num, 0, len);
        return buf;
    }
}
