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
 * Elliptic curve used.
 */
export class CurveLabel {
    static values: CurveLabel[] = [];

    static SECP224R1 = new CurveLabel('P-224', 1, 'p224');
    static SECP256R1 = new CurveLabel('P-256', 2, 'p256');
    static SECP384R1 = new CurveLabel('P-384', 3, 'p384');
    static SECP521R1 = new CurveLabel('P-521', 4, 'p521');
    static SM2P256V1 = new CurveLabel('sm2p256v1', 20, 'sm2p256v1');
    static ED25519 = new CurveLabel('ed25519', 25, 'ed25519');

    /**
     * Finds Curvecorresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): CurveLabel {
        const item = CurveLabel.values.find((v) => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Curve corresponding to specified label representation.
     *
     * @param label Label
     */
    static fromLabel(label: string): CurveLabel {
        const item = CurveLabel.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    label: string;
    hex: number;
    preset: string;

    constructor(label: string, hex: number, preset: string) {
        this.label = label;
        this.hex = hex;
        this.preset = preset;

        CurveLabel.values.push(this);
    }
}
