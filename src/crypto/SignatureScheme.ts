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
export class SignatureScheme {
    static values: SignatureScheme[] = [];

    static ECDSAwithSHA224 = new SignatureScheme('SHA224withECDSA', 0, 'ES224');
    static ECDSAwithSHA256 = new SignatureScheme('SHA256withECDSA', 1, 'ES256');
    static ECDSAwithSHA384 = new SignatureScheme('SHA384withECDSA', 2, 'ES384');
    static ECDSAwithSHA512 = new SignatureScheme('SHA512withECDSA', 3, 'ES512');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_224 = new SignatureScheme('SHA3-224withECDSA', 4, 'ES3-224');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_256 = new SignatureScheme('SHA3-256withECDSA', 5, 'ES3-256');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_384 = new SignatureScheme('SHA3-384withECDSA', 6, 'ES3-384');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_512 = new SignatureScheme('SHA3-512withECDSA', 7, 'ES3-512');
    static ECDSAwithRIPEMD160 = new SignatureScheme('RIPEMD160withECDSA', 8, 'ER160');
    static SM2withSM3 = new SignatureScheme('SM3withSM2', 9, 'SM');
    static EDDSAwithSHA512 = new SignatureScheme('SHA512withEdDSA', 10, 'EDS512');

    /**
     * Finds Signature schema corresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.hex === hex);
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
    static fromLabel(label: string): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Signature schema corresponding to specified label representation in JWS.
     *
     * @param label Label
     */
    static fromLabelJWS(label: string): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.labelJWS === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    label: string;
    hex: number;
    labelJWS: string;

    constructor(label: string, hex: number, labelJWS: string) {
        this.label = label;
        this.hex = hex;
        this.labelJWS = labelJWS;

        SignatureScheme.values.push(this);
    }
}
