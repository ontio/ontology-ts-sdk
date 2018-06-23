import BigInt from '../common/bigInt';
import { Parameter, ParameterType } from '../smartcontract/abi/parameter';
import { num2hexstring, str2hexstr } from '../utils';
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
        result += num2hexstring(opcode.PUSHM1);
    } else if (param === 0) {
        result += num2hexstring(opcode.PUSH0);
    } else if (param > 0 && param < 16) {
        const num = opcode.PUSH1 - 1 + param;
        result += num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString()).toHexstr();
        result = pushHexString(biHex);
    }

    return result;
};

export const pushHexString = (param: string) => {
    let result = '';
    const len = param.length / 2;
    if (len < opcode.PUSHBYTES75) {
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

// params is like [param1, param2...]
export const buildSmartContractParam = (functionName: string, params: Parameter[]) => {
    let result = '';
    for (let i = params.length - 1; i > -1; i--) {
        const type = params[i].getType();
        switch (type) {
        case ParameterType.Boolean:
            result += pushBool(params[i].getValue());
            break;

        case ParameterType.Number:
            result += pushInt(params[i].getValue());
            break;

        case ParameterType.String:
            const value = str2hexstr(params[i].getValue());
            result += pushHexString(value);
            break;

        case ParameterType.ByteArray:
            result += pushHexString(params[i].getValue());
            break;

            /* case "[object Object]":
                let temp = []
                let keys = Object.keys(params[i])
                for(let k of keys) {
                    temp.push( params[i][k])
                }
                result += buildSmartContractParam(temp)
                break; */
        default:
            throw new Error('Unsupported param type: ' + params[i]);
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
