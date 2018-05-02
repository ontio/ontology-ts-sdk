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

/**
 * Schema used during signing and verification of signature.
 */
export class SignatureSchema {
    static values: SignatureSchema[] = [];

    static ECDSAwithSHA224 = new SignatureSchema('ECDSAwithSHA224', 0);
	static ECDSAwithSHA256 = new SignatureSchema('ECDSAwithSHA256', 1);
	static ECDSAwithSHA384 = new SignatureSchema('ECDSAwithSHA384', 2);
	static ECDSAwithSHA512 = new SignatureSchema('ECDSAwithSHA512', 3);
	static ECDSAwithSHA3_224 = new SignatureSchema('ECDSAwithSHA3-224', 4);
	static ECDSAwithSHA3_256 = new SignatureSchema('ECDSAwithSHA3-256', 5);
	static ECDSAwithSHA3_384 = new SignatureSchema('ECDSAwithSHA3-384', 6);
	static ECDSAwithSHA3_512 = new SignatureSchema('ECDSAwithSHA3-512', 7);
	static ECDSAwithRIPEMD160 = new SignatureSchema('ECDSAwithRIPEMD160', 8);
	static SM2withSM3 = new SignatureSchema('SM2withSM3', 9);
	static EDDSAwithSHA512 = new SignatureSchema('EDDSAwithSHA512', 10);

    label: string;
    hex: number;

    constructor(label: string, hex: number) {
        this.label = label;
        this.hex = hex;
        
        SignatureSchema.values.push(this);
    }

    /**
     * Finds Signature schema corresponding to specified hex representation.
     * 
     * @param hex Byte hex value
     */
    static fromHex(hex: number): SignatureSchema {
        const item = SignatureSchema.values.find(v => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Signature schema corresponding to specified label representation.
     * 
     * @param label Label
     */
    static fromLabel(label: string): SignatureSchema {
        const item = SignatureSchema.values.find(v => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }
};
