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

import { SignatureScheme } from './SignatureScheme';

/**
 * Type of key. ECDSA is the default one to use.
 */
export class KeyType {
    static values: KeyType[] = [];

    static ECDSA = new KeyType('ECDSA', 0x12, SignatureScheme.ECDSAwithSHA256);
    static SM2 = new KeyType('SM2', 0x13, SignatureScheme.SM2withSM3);
    static EDDSA = new KeyType('EDDSA', 0x14, SignatureScheme.EDDSAwithSHA512);

    /**
     * Finds Key type corresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): KeyType {
        const item = KeyType.values.find((v) => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Key type corresponding to specified label representation.
     *
     * @param label Label
     */
    static fromLabel(label: string): KeyType {
        const item = KeyType.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    label: string;
    hex: number;
    defaultSchema: SignatureScheme;

    constructor(label: string, hex: number, defaultSchema: SignatureScheme) {
        this.label = label;
        this.hex = hex;
        this.defaultSchema = defaultSchema;

        KeyType.values.push(this);
    }
}
