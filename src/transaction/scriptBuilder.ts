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
import { I128, I128FromBigInt, I128FromInt } from '../common/int128';
import { Address } from '../crypto';
import { ERROR_CODE } from '../error';
import AbiFunction from '../smartcontract/abi/abiFunction';
import { Parameter, ParameterType, ParameterTypeVal } from '../smartcontract/abi/parameter';
import Struct from '../smartcontract/abi/struct';
import {
    // tslint:disable-next-line:max-line-length
    ab2hexstring, bigIntFromBytes, hexstr2str, isHexString, num2hexstring, num2VarInt, str2hexstr, StringReader
} from '../utils';
import opcode from './opcode';
import { pushHexString } from './program';

export const pushBool = (param: boolean) => {
    let result = '';
    if (param) {
        result += num2hexstring(opcode.PUSHT);
    } else {
        result += num2hexstring(opcode.PUSHF);
    }
    return result;
};

export const pushInt = (param: number, ledgerCompatible: boolean = true) => {
    let result = '';
    if (param === -1) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param === 0) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param > 0 && param < 16) {
        const num = opcode.PUSH1 - 1 + param;
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString(), ledgerCompatible).toHexstr();
        result = pushHexString(biHex);
    }

    return result;
};

export const pushBigNum = (param: BigNumber, ledgerCompatible: boolean = true) => {
    let result = '';
    if (param.isEqualTo(-1)) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param.isEqualTo(0)) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param.isGreaterThan(0) && param.isLessThan(16)) {
        const num = opcode.PUSH1 - 1 + param.toNumber();
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString(), ledgerCompatible).toHexstr();
        result = pushHexString(biHex);
    }
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

export const pushMap = (val: Map<string, any>, ledgerCompatible: boolean) => {
    let result = '';
    result += num2hexstring(opcode.NEWMAP);
    result += num2hexstring(opcode.TOALTSTACK);
    for (const k of val.keys()) {
        result += num2hexstring(opcode.DUPFROMALTSTACK);
        result += pushHexString(str2hexstr(k));
        result += pushParam(val.get(k), ledgerCompatible);
        result += num2hexstring(opcode.SETITEM);
    }
    result += num2hexstring(opcode.FROMALTSTACK);
    return result;
};

export const pushParam = (p: any, ledgerCompatible: boolean) => {
    if (!p) {
        throw Error('Parameter can not be undefined');
    }
    let result = '';
    if (p.type === ParameterType.ByteArray) {
        result += pushHexString(p.value);
    } else if (p.type === ParameterType.Address) {
        result += pushHexString(p.value.serialize());
    } else if (p.type === ParameterType.String) {
        result += pushHexString(str2hexstr(p.value));
    } else if (p.type === ParameterType.Boolean) {
        result += pushBool(Boolean(p.value));
        result += num2hexstring(opcode.PUSH0);
        result += num2hexstring(opcode.BOOLOR);
    } else if (p.type === ParameterType.Map) {
        result += pushMap(convertMap(p), ledgerCompatible);
    } else if (p instanceof Map) {
        result += pushMap(p, ledgerCompatible);
    } else if (p.type === ParameterType.Array) {
        for (let i = p.value.length - 1; i > -1; i--) {
            result += pushParam(p.value[i], ledgerCompatible);
        }
        result += pushInt(p.value.length, ledgerCompatible);
        result += num2hexstring(opcode.PACK);
    } else if (p.type === ParameterType.Integer) {
        result += pushInt(p.value, ledgerCompatible);
        result += num2hexstring(opcode.PUSH0);
        result += num2hexstring(opcode.ADD);
    } else if (p.type === ParameterType.Long) {
        result += pushBigNum(new BigNumber(p.value), ledgerCompatible);
        result += num2hexstring(opcode.PUSH0);
        result += num2hexstring(opcode.ADD);
    } else {
        throw Error('Invalid parameter type: ' + JSON.stringify(p));
    }
    return result;
};

export const serializeAbiFunction = (abiFunction: AbiFunction, ledgerCompatible: boolean = true) => {
    const list = [];
    list.push(str2hexstr(abiFunction.name));
    const tmp = [];
    for (const p of abiFunction.parameters) {
        if (p.getType() === ParameterType.String) {
            tmp.push(str2hexstr(p.getValue()));
        } else if (p.getType() === ParameterType.Long) {
            tmp.push(new BigNumber(p.getValue()));
        } else if (p.getType() === ParameterType.Map) {
            tmp.push(convertMap(p));
        } else if (p.getType() === ParameterType.Address) {
            tmp.push(p.getValue().serialize());
        } else {
            tmp.push(p.getValue());
        }
    }
    if (list.length > 0) {
        list.push(tmp);
    }
    const result = createCodeParamsScript(list, ledgerCompatible);
    return result;
};

export function convertArray(list: Parameter[]): any {
    const tmp = [];
    for (const p of list) {
        if (p.getType && p.getType() === ParameterType.String) {
            tmp.push(str2hexstr(p.getValue()));
        } else if (p.getType && p.getType() === ParameterType.Long) {
            tmp.push(new BigNumber(p.getValue()));
        } else if (p.getType && p.getType() === ParameterType.Array) {
            tmp.push(convertArray(p.value));
        } else if (p.getType && p.getType() === ParameterType.Map) {
            tmp.push(convertMap(p));
        } else if (p.getType && p.getType() === ParameterType.Address) {
            tmp.push(p.getValue().serialize());
        } else {
            tmp.push(p.getValue ? p.getValue() : p);
        }
    }
    return tmp;
}

export function convertMap(p: Parameter): any {
    const map = new Map();
    for (const k of Object.keys(p.value)) {
        const pVal = p.value[k];
        // map.set(k, pVal);
        if (pVal.type && pVal.type === ParameterType.Map) {
            map.set(k, convertMap(pVal));
        } else {
            map.set(k, pVal);
        }
    }
    return map;
}

/**
 * To deserialize the value return from smart contract invoke.
 * @param hexstr
 */
export function deserializeItem(sr: StringReader): any {
    const t = parseInt(sr.read(1), 16);
    if ( t === ParameterTypeVal.ByteArray) {
        return sr.readNextBytes();
    } else if (t === ParameterTypeVal.Boolean) {
        return sr.readBoolean();
    } else if (t === ParameterTypeVal.Integer) {
        const v = bigIntFromBytes(sr.readNextBytes()).toNumber();
        return v;
    } else if (t === ParameterTypeVal.Array || t === ParameterTypeVal.Struct ) {
        const length = sr.readNextLen();
        const list = [];
        for (let i = length; i > 0; i--) {
            const ele = deserializeItem(sr);
            list.push(ele);
        }
        return list;
    } else if (t === ParameterTypeVal.Map ) {
        const length = sr.readNextLen();
        const map = new Map();
        for (let i = length; i > 0; i--) {
            const key = hexstr2str(deserializeItem(sr));
            const value = deserializeItem(sr);
            map.set(key, value);
        }
        return map;
    } else {
        throw Error('Invalid parameter type: ' + t);
    }
}

export const createCodeParamsScript = (list: any[], ledgerCompatible: boolean = true) => {
    let result = '';
    for (let i = list.length - 1; i >= 0; i--) {
        const val = list[i];
        if (typeof val === 'string') {
            result += pushHexString(val);
        } else if (typeof val === 'number') {
            result += pushInt(val, ledgerCompatible);
        } else if (typeof val === 'boolean') {
            result += pushBool(val);
        } else if (val instanceof BigNumber) {
            result += pushBigNum(val, ledgerCompatible);
        } else if (val instanceof Map) {
            result += pushMap(val, ledgerCompatible);
            // const mapBytes = getMapBytes(val);
            // result += pushHexString(mapBytes);
        } else if (val instanceof Struct) {
            const structBytes = getStructBytes(val);
            result += pushHexString(structBytes);
        } else if (val instanceof Array) {
            result += createCodeParamsScript(convertArray(val), ledgerCompatible);
            result += pushInt(val.length, ledgerCompatible);
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

export function buildWasmContractParam(params: Parameter[]): string {
    let result = '';

    for (const p of params) {
        const type = p.getType();

        switch (type) {
        case ParameterType.String:
            result += writeString(p.value);
            break;
        case ParameterType.Int:
            result += I128FromInt(p.value).serialize();
            break;
        case ParameterType.Long:
            result += I128FromBigInt(p.value).serialize();
            break;
        case ParameterType.ByteArray:
            result += writeVarBytes(p.value);
            break;
        case ParameterType.H256:
            result += writeH256(p.value);
            break;
        case ParameterType.Address:
            result += writeAddress(p.value);
            break;
        case ParameterType.Boolean:
            result += writeBool(p.value);
            break;
        case ParameterType.Array:
            result += writeVarUint(p.value.length);
            result += buildWasmContractParam(p.value);
            break;
        default:
            throw new Error(`Not a supported type: ${p.type}`);
        }
    }

    return result;
}

export function writeUint16(data: number): string {
    return num2hexstring(data, 2, true);
}

export function writeUint32(data: number): string {
    return num2hexstring(data, 4, true);
}

export function writeUint64(data: number): string {
    return num2hexstring(data, 8, true);
}

// data is hexstring;
export function writeVarBytes(data: string): string {
    if (!isHexString(data)) {
        throw new Error('[writeVarBytes] The param is not hex string.');
    }
    let result = '';
    result += num2VarInt(data.length / 2);
    result += data;
    return result;
}

export function writeString(data: string): string {
    return writeVarBytes(str2hexstr(data));
}

export function writeAddress(data: Address): string {
    return data.serialize();
}

export function writeH256(data: string) {
    return data;
}

export function writeI128(data: I128): string {
    return data.serialize();
}

export function writeBool(data: boolean): string {
    if (data) {
        return '01';
    } else {
        return '00';
    }
}

export function writeVarUint(data: number): string {
    const buf = [];
    if (data < 0xFD) {
        buf[0] = data;
    } else if (data <= 0xFFFF) {
        buf[0] = 0xFD;
        putLittleEndianUint(buf, 1, 2, data);
    } else if (data <= 0xFFFFFFFF) {
        buf[0] = 0xFE;
        putLittleEndianUint(buf, 1, 4, data);
    } else {
        buf[0] = 0xFF;
        putLittleEndianUint(buf, 1, 8, data);
    }
    return ab2hexstring(buf);
}

function putLittleEndianUint(buf: number[], start: number, size: number, data: number) {
    buf[start] = data;
    for (let i = start + 1; i <= size; i++) {
        data = data >> (8 * (i - 1));
        buf[i] = data & 0xFF;
    }
}
