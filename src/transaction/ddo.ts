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

import {StringReader, hexstr2str} from '../utils'
import {PublicKey} from '../crypto'

/**
 * Public key representation with recorded id from blockchain.
 * 
 */
export class PublicKeyWithId extends PublicKey {
    /**
     * Id of the public key.
     * 
     * Only numeric part is recorded. Full PublicKeyId will be constucted as follows:
     * <ONTID>#keys-<id>
     */
    id: number;

    constructor (key: PublicKey, id: number) {
        super(key.key, key.algorithm, key.parameters);   

        this.id = id;
    }
}

/**
 * Attribute of ONT ID Description Object.
 */
export class DDOAttribute {
    path: string;
    type: string;
    value: string;

    constructor(path: string, type: string, value: string) {
        this.path = path;
        this.type = type;
        this.value = value;
    }

    /**
     * Creates Attribute from hex string.
     * 
     * @param hex Hex representation
     */
    static deserialize(hex: string): DDOAttribute {
        const reader = new StringReader(hex);

        const path = hexstr2str(reader.readLengthPrefixed(4));
        const typeValue = reader.readLengthPrefixed(4);
        const { type, value } = DDOAttribute.deserializeTypeValue(typeValue);

        return new DDOAttribute(path, type, value);
    }

    /**
     * Creates Type + Value part from hex string.
     * 
     * @param hex Hex representation
     */
    private static deserializeTypeValue(hex: string) {
        const reader = new StringReader(hex);

        return {
            type: hexstr2str(reader.readLengthPrefixed(1)),
            value: hexstr2str(reader.readRest())
        };
    }
}

/**
 * ONT ID Description Object.
 */
export class DDO {
    publicKeys: PublicKeyWithId[];
    attributes: DDOAttribute[];
    recovery: string;

    constructor(publicKeys: PublicKeyWithId[], attributes: DDOAttribute[], recovery: string) {
        this.publicKeys = publicKeys;
        this.attributes = attributes;
        this.recovery = recovery;
    }

    /**
     * Creates DDO object from hex string.
     * 
     * @param hex Hex representation
     */
    static deserialize(hex: string): DDO {
        const reader = new StringReader(hex);
        
        const publicKeys = reader.readLengthPrefixed(4);
        const attributes = reader.readLengthPrefixed(4);
        const recovery = reader.readLengthPrefixed(4);

        return new DDO(
            this.deserializePublicKeys(publicKeys),
            this.deserializeAttributes(attributes),
            recovery
        );
    }

    /**
     * Creates PublicKeys part.
     * 
     * @param hex Hex representation
     */
    private static deserializePublicKeys(hex: string): PublicKeyWithId[] {
        if (hex.length === 0) {
            return [];
        }
        
        const reader = new StringReader(hex);

        const num = parseInt(reader.read(4), 16);
        const publicKeys: PublicKeyWithId[] = new Array(num);
        
        for (let i = 0; i < num; i++) {
            const id = parseInt(reader.readLengthPrefixed(4));
            
            const pkHex = reader.readLengthPrefixed(4);
            const pk = PublicKey.deserializeHex(pkHex);

            publicKeys[i] = new PublicKeyWithId(pk, id);
        }
        
        return publicKeys;
    }

    /**
     * Creates Attributes part.
     * 
     * @param hex Hex representation
     */
    private static deserializeAttributes(hex: string): DDOAttribute[] {
        if (hex.length === 0) {
            return [];
        }

        const reader = new StringReader(hex);

        const num = parseInt(reader.read(4), 16);
        const attributes: DDOAttribute[] = new Array(num);

		for (let i = 0; i < num; i++) {
            const attrHex = reader.readLengthPrefixed(4);
            attributes[i] = DDOAttribute.deserialize(attrHex);
		}

        return attributes;
    }
}
