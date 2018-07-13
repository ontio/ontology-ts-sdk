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

import { Parameter } from './parameter';

/**
 * Describes the Abi function
 */
export default class AbiFunction {
    name: string;
    returntype: string;
    parameters: Parameter[];

    constructor(name: string, returntype: string, parameters: Parameter[]) {
        this.name = name;
        this.returntype = returntype;
        this.parameters = parameters;
    }

    getParameter(name: string): any {
        // const p = {} as Parameter;

        for (const v of this.parameters) {
            if (v.getName() === name) {
                return v;
            }
        }
        return null;
    }

    setParamsValue(...args: Parameter[]): void {
        for (let i = 0, len = args.length; i < len; i++) {
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0 ; j < this.parameters.length; j++) {
                if (args[i].name === this.parameters[j].getName()) {
                    this.parameters[j].setValue(args[i]);
                }
            }
        }
        // const parameters = [];
        // for (let i = 0, len = args.length; i < len; i++) {
        //     parameters.push(args[i]);
        // }
        // this.parameters = parameters;
    }

    toString(): string {
        const json = {
            name : this.name,
            returntype : this.returntype,
            parameters : this.parameters
        };

        return JSON.stringify(json);
    }
}
