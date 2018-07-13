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

import { PublicKey } from '../crypto';
import { hexstr2str, str2VarBytes, StringReader } from '../utils';

/**
 * Public key representation with recorded id from blockchain.
 *
 */
export class PublicKeyWithId {
    /**
     * Deserialize from hex string to PublicKeyWithId
     * @param hexstr
     */
    static deserialize(hexstr: string): PublicKeyWithId[] {
        const sr = new StringReader(hexstr);

        const result: PublicKeyWithId[] = [];
        while (!sr.isEmpty()) {
            const index = sr.readUint32();
            const data = sr.readNextBytes();
            const p = new PublicKeyWithId();
            p.id = index;
            p.pk = PublicKey.deserializeHex(new StringReader(data));
            result.push(p);
        }
        return result;
    }

    /**
     * Id of the public key.
     *
     * Only numeric part is recorded. Full PublicKeyId will be constucted as follows:
     * <ONTID>#keys-<id>
     */
    id: number;
    pk: PublicKey;
}

/**
 * Description attribute of ONT ID
 */
export class DDOAttribute {
    static deserialize(hexstr: string) {
        const sr = new StringReader(hexstr);

        const result: DDOAttribute[] = [];
        while (!sr.isEmpty()) {
            const key = hexstr2str(sr.readNextBytes());
            const type = hexstr2str(sr.readNextBytes());
            const value = hexstr2str(sr.readNextBytes());
            const d = new DDOAttribute();
            d.key = key;
            d.type = type;
            d.value = value;
            result.push(d);
        }

        return result;
    }

    /**
     * Key of the attribute
     */
    key: string;
    /**
     * Type of the attribute
     */
    type: string;
    /**
     * Value of the attribute
     */
    value: string;

    /**
     * Serialize DDO to hex string
     */
    serialize(): string {
        let result = '';
        result += str2VarBytes(this.key);
        result += str2VarBytes(this.type);
        result += str2VarBytes(this.value);
        return result;
    }
}

/**
 * Description object of ONT ID
 */
export class DDO {
    /**
     * Deserialize from hex string to DDO
     * @param hexstr Hex encoded string
     */
    static deserialize(hexstr: string): DDO {
        const ss = new StringReader(hexstr);

        const ddo = new DDO();
        const pkLen = ss.readNextLen();

        if (pkLen > 0) {
            ddo.publicKeys = PublicKeyWithId.deserialize(ss.read(pkLen));
        }

        const attrLen = ss.readNextLen();
        if (attrLen > 0) {
            ddo.attributes = DDOAttribute.deserialize(ss.read(attrLen));
        }

        const recoveryLen = ss.readNextLen();
        if (recoveryLen > 0) {
            ddo.recovery = ss.read(recoveryLen);
        }
        return ddo;
    }

    /**
     * Array of public keys
     */
    publicKeys: PublicKeyWithId[] = [];
    /**
     * Array of attributes
     */
    attributes: DDOAttribute[] = [];
    /**
     * Recovery of DDO
     */
    recovery: string = '';
}
