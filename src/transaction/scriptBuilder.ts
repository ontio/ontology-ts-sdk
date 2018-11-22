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
import BigInt from '../common/bigInt';
import { ERROR_CODE } from '../error';
import AbiFunction from '../smartcontract/abi/abiFunction';
import { Parameter, ParameterType, ParameterTypeVal } from '../smartcontract/abi/parameter';
import Struct from '../smartcontract/abi/struct';
import { num2hexstring, num2VarInt, str2hexstr } from '../utils';
import opcode from './opcode';

export const pushBool = (param: boolean) => {
    let result = '';
    if (param) {
        result += num2hexstring(opcode.PUSHT);
    } else {
        result += num2hexstring(opcode.PUSHF);
    }
    return result;
};

export const pushInt = (param: number) => {
    let result = '';
    if (param === -1) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param === 0) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param > 0 && param < 16) {
        const num = opcode.PUSH1 - 1 + param;
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString()).toHexstr();
        result = pushHexString(biHex);
    }

    return result;
};

export const pushBigNum = (param: BigNumber) => {
    let result = '';
    if (param.isEqualTo(-1)) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param.isEqualTo(0)) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param.isGreaterThan(0) && param.isLessThan(16)) {
        const num = opcode.PUSH1 - 1 + param.toNumber();
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString()).toHexstr();
        result = pushHexString(biHex);
    }
    return result;
};

export const pushHexString = (param: string) => {
    let result = '';
    const len = param.length / 2;
    if (len <= opcode.PUSHBYTES75) {
        result += num2hexstring(len);
    } else if (len < 0x100) {
        result += num2hexstring(opcode.PUSHDATA1);
        result += num2hexstring(len);
    } else if (len < 0x10000) {
        result += num2hexstring(opcode.PUSHDATA2);
        result += num2hexstring(len, 2, true);
    } else {
        result += num2hexstring(opcode.PUSHDATA4);
        result += num2hexstring(len, 4, true);
    }
    result += param;
    return result;
};

export const getStructBytes = (val: Struct) => {
    let result = '';
    result += num2hexstring(ParameterTypeVal.Struct);
    result += num2hexstring(val.list.length); // val is array-like
    for (const v of val.list) {
        if (typeof v === 'string') {// consider as hex string
            result += num2hexstring(ParameterTypeVal.ByteArray);
            result += pushHexString(v);
        } else if (typeof v === 'number') {
            result += num2hexstring(ParameterTypeVal.ByteArray);
            result += pushHexString(num2VarInt(v));
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }
    return result;
};

export const getMapBytes = (val: Map<string, Parameter>) => {
    let result = '';
    result += num2hexstring(ParameterTypeVal.Map);
    result += num2hexstring(val.size);
    for (const k of val.keys()) {
        result += num2hexstring(ParameterTypeVal.ByteArray);
        result += pushHexString(str2hexstr(k));
        const p = val.get(k);
        if (p && p.getType() === ParameterType.ByteArray) {
            result += num2hexstring(ParameterTypeVal.ByteArray);
            result += pushHexString(p.getValue());
        } else if (p && p.getType() === ParameterType.String) {
            result += num2hexstring(ParameterTypeVal.ByteArray);
            result += pushHexString(str2hexstr(p.getValue()));
        } else if (p && p.getType() === ParameterType.Integer) {
            result += num2hexstring(ParameterTypeVal.Integer);
            result += pushHexString(num2VarInt(p.getValue()));
        } else if (p && p.getType() === ParameterType.Long) {
            result += num2hexstring(ParameterTypeVal.Integer);
            result += pushHexString(num2VarInt(p.getValue()));
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }
    return result;
};

export const serializeAbiFunction = (abiFunction: AbiFunction) => {
    const list = [];
    list.push(str2hexstr(abiFunction.name));
    const tmp = [];
    for (const p of abiFunction.parameters) {
        if (p.getType() === ParameterType.String) {
            tmp.push(str2hexstr(p.getValue()));
        } else if (p.getType() === ParameterType.Long) {
            tmp.push(new BigNumber(p.getValue()));
        } else {
            tmp.push(p.getValue());
        }
    }
    if (list.length > 0) {
        list.push(tmp);
    }
    console.log(JSON.stringify(list));
    const result = createCodeParamsScript(list);
    return result;
};

export function convertArray(list: any[]): any {
    const tmp = [];
    for (const p of list) {
        if (p.getType && p.getType() === ParameterType.String) {
            tmp.push(str2hexstr(p.getValue()));
        } else if (p.getType && p.getType() === ParameterType.Long) {
            tmp.push(new BigNumber(p.getValue()));
        } else if (Array.isArray(p)) {
            tmp.push(convertArray(p));
        } else {
            tmp.push(p.getValue ? p.getValue() : p);
        }
    }
    return tmp;
}

export const createCodeParamsScript = (list: any[]) => {
    let result = '';
    for (let i = list.length - 1; i >= 0; i--) {
        const val = list[i];
        if (typeof val === 'string') {
            result += pushHexString(val);
        } else if (typeof val === 'number') {
            result += pushInt(val);
        } else if (typeof val === 'boolean') {
            result += pushBool(val);
        } else if (val instanceof BigNumber) {
            result += pushBigNum(val);
        } else if (val instanceof Map) {
            const mapBytes = getMapBytes(val);
            result += pushHexString(mapBytes);
        } else if (val instanceof Struct) {
            const structBytes = getStructBytes(val);
            result += pushHexString(structBytes);
        } else if (val instanceof Array) {
            result += createCodeParamsScript(convertArray(val));
            result += pushInt(val.length);
            result += num2hexstring(opcode.PACK);
        }
    }
    return result;
};

// deprecated
export const buildSmartContractParam = (functionName: string, params: Parameter[]) => {
    let result = '';
    for (let i = params.length - 1; i > -1; i--) {
        const type = params[i].getType();
        switch (type) {
        case ParameterType.Boolean:
            result += pushBool(params[i].getValue());
            break;

        case ParameterType.Integer:
            result += pushInt(params[i].getValue());
            break;

        case ParameterType.String:
            const value = str2hexstr(params[i].getValue());
            result += pushHexString(value);
            break;

        case ParameterType.ByteArray:
            result += pushHexString(params[i].getValue());
            break;

        case ParameterType.Map:
            const mapBytes = getMapBytes(params[i].getValue());
            result += pushHexString(mapBytes);
            break;

        case ParameterType.Struct:
            const structBytes = getStructBytes(params[i].getValue());
            result += pushHexString(structBytes);
            break;
        // case ParameterType.Array:
        //     result += buildSmartContractParam(params[i].getValue());
        //     result += pushInt(params[i].getValue().length);
        //     result += num2hexstring(opcode.PACK);
        //     break;
        default:
            throw new Error('Unsupported param type: ' + JSON.stringify(params[i]));
        }
    }

    result += pushInt(params.length);
    result += num2hexstring(opcode.PACK);

    result += pushHexString(str2hexstr(functionName));

    return result;
};

export const buildWasmContractParam = (params: Parameter[]) => {
    const pList = [];

    for (const p of params) {
        const type = p.getType();
        let o;

        switch (type) {
        case ParameterType.String:
            o = {
                type: 'string',
                value: p.getValue()
            };
            break;
        case ParameterType.Int:
            o = {
                type: 'int',
                value: p.getValue().toString()
            };
            break;
        case ParameterType.Long:
            o = {
                type: 'int64',
                value: p.getValue()
            };
            break;
        case ParameterType.IntArray:
            o = {
                type: 'int_array',
                value: p.getValue()
            };
            break;
        case ParameterType.LongArray:
            o = {
                type: 'int_array',
                value: p.getValue()
            };
            break;
        default:
            break;
        }
        pList.push(o);
    }

    const result = {
        Params: pList
    };
    return str2hexstr(JSON.stringify(result));
};
