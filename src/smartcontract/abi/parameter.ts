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
export enum ParameterType  {
    Boolean = 'Boolean',
    Number  = 'Number',
    String  = 'String',
    ByteArray = 'ByteArray',
    Int = 'Int',
    Long = 'Long',
    IntArray = 'IntArray',
    LongArray = 'LongArray',
    Address = 'Address'
}

export class Parameter {
    public name: string;
    public type: ParameterType;
    public value: any;
    constructor(name: string, type: ParameterType, value: any) {
        this.name = name;
        this.type = type;
        this.value = value;
    }

    getName(): string {
        return this.name;
    }

    getType(): ParameterType {
        return this.type;
    }

    getValue(): any {
        return this.value;
    }

    setValue(value: any): boolean {
        if (value.type === this.type && value.name === this.name && value.value) {
            this.value = value.value;
            return true;
        }
        return false;
    }
}
