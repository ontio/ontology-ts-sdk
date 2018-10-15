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

import { BigNumber } from 'bignumber.js';
import { Address } from '../../crypto/address';
import opcode from '../../transaction/opcode';
import { hex2VarBytes, num2hexstring, str2VarBytes } from '../../utils';
import { pushBigNum, pushBool, pushHexString, pushInt } from './../../transaction/scriptBuilder';
import { Parameter, ParameterType } from './parameter';
import Struct from './struct';

export function buildParams(params: Parameter[]): string {
    let result = '';
    for (const p of params) {
        const type = p.getType();
        switch (type) {
        case ParameterType.ByteArray:
            result += hex2VarBytes(p.value);
            break;
        case ParameterType.Int:
            result += num2hexstring(p.value, 4, true);
            break;
        case ParameterType.String:
            result += str2VarBytes(p.value);
            break;
        case ParameterType.Address:
            result += p.value.serialize();
        default:
            break;
        }
    }
    return result;
}

export function createCodeParamScript(obj: any): string {
    let result = '';
    // Consider string as hexstr
    if (typeof obj === 'string') {
        result += pushHexString(obj);
    } else if (typeof obj === 'boolean') {
        result += pushBool(obj);
    } else if (typeof obj === 'number') {
        result += pushInt(obj);
    } else if (obj instanceof BigNumber) {
        result += pushBigNum(obj);
    } else if (obj instanceof Address) {
        result += pushHexString(obj.serialize());
    } else if (obj instanceof Struct) {
        for (const v of obj.list) {
            result += createCodeParamScript(v);
            result += num2hexstring(opcode.DUPFROMALTSTACK);
            result += num2hexstring(opcode.SWAP);
            result += num2hexstring(opcode.APPEND);
        }
    }
    return result;
}

export function buildNativeCodeScript(list: any[]) {
    let result = '';
    for (let i = list.length - 1; i >= 0; i--) {
        const val = list[i];
        // Consider string as hexstr
        if (typeof val === 'string') {
            result += pushHexString(val);
        } else if (typeof val === 'boolean') {
            result += pushBool(val);
        } else if (typeof val === 'number') {
            result += pushInt(val);
        } else if (val instanceof BigNumber) {
            result += pushBigNum(val);
        } else if (val instanceof Address) {
            result += pushHexString(val.serialize());
        } else if (val instanceof Struct) {
            result += pushInt(0);
            result += num2hexstring(opcode.NEWSTRUCT);
            result += num2hexstring(opcode.TOALTSTACK);
            for (const v of val.list) {
                result += createCodeParamScript(v);
                result += num2hexstring(opcode.DUPFROMALTSTACK);
                result += num2hexstring(opcode.SWAP);
                result += num2hexstring(opcode.APPEND);
            }
            result += num2hexstring(opcode.FROMALTSTACK);
        } else if (Array.isArray(val) && isTypedArray(val, Struct)) {
            result += pushInt(0);
            result += num2hexstring(opcode.NEWSTRUCT);
            result += num2hexstring(opcode.TOALTSTACK);
            for (const s of val) {
                result += createCodeParamScript(s);
            }
            result += num2hexstring(opcode.FROMALTSTACK);
            result += pushInt(val.length);
            result += num2hexstring(opcode.PACK);
        } else if (Array.isArray(val)) {
            result += buildNativeCodeScript(val);
            result += pushInt(val.length);
            result += num2hexstring(opcode.PACK);
        }
    }
    return result;
}

export function isTypedArray(arr: any[], type: any) {
    let result = true;
    for (const a of arr) {
        if (!(a instanceof type)) {
            result = false;
            break;
        }
    }
    return result;
}
