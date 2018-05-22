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
import * as cryptoJS from 'crypto-js';
import { reverse } from 'dns';
import Fixed64 from '../common/fixed64';
import { DEFAULT_GAS_LIMIT, HTTP_REST_PORT, REST_API, TEST_NODE, TOKEN_TYPE } from '../consts';
import * as core from '../core';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey, SignatureScheme } from '../crypto';
import { ERROR_CODE } from '../error';
import AbiFunction from '../smartcontract/abi/abiFunction';
import AbiInfo from '../smartcontract/abi/abiInfo';
import { Parameter,  ParameterType } from '../smartcontract/abi/parameter';
import json from '../smartcontract/data/idContract.abi';
import { Contract, State, Transfers } from '../smartcontract/token';
import {
    ab2hexstring,
    axiosPost,
    hex2VarBytes,
    hexstr2str,
    num2hexstring,
    num2VarInt,
    reverseHex,
    str2hexstr,
    str2VarBytes
} from '../utils';
import opcode from './opcode';
import DeployCode from './payload/deployCode';
import InvokeCode from './payload/invokeCode';
import { Fee, Sig, Transaction, TxType } from './transaction';
import { TransactionAttribute, TransactionAttributeUsage } from './txAttribute';
import { VmCode, VmType } from './vmcode';

const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

// tslint:disable-next-line:variable-name
export const Default_params = {
    Action: 'sendrawtransaction',
    Version: '1.0.0',
    Type: '',
    Op: 'test'
};

const ONT_CONTRACT = 'ff00000000000000000000000000000000000001';

export const makeTransferTransaction = (
    tokenType: string,
    from: Address,
    to: Address,
    value: string,
    privateKey: PrivateKey
) => {
    const state = new State();
    state.from = from;
    state.to = to;

    // multi 10^8 to keep precision
    const valueToSend = new BigNumber(Number(value)).toString();

    state.value = new Fixed64(valueToSend);
    const transfer = new Transfers();
    transfer.states = [state];

    const contract = new Contract();
    contract.address = ONT_CONTRACT;
    contract.method = 'transfer';
    contract.args = transfer.serialize();

    const tx = new Transaction();
    tx.version = 0x00;
    tx.type = TxType.Invoke;

    // inovke
    let code = '';
    // TODO: change with token type

    code += contract.serialize();
    const vmcode = new VmCode();
    vmcode.code = code;
    vmcode.vmType = VmType.NativeVM;
    const invokeCode = new InvokeCode();
    invokeCode.code = vmcode;
    tx.payload = invokeCode;

    signTransaction(tx, privateKey);

    return tx;
};

/**
 * Signs the transaction object.
 *
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param privateKey Private key to sign with
 * @param schema Signature Schema to use
 */
export const signTransaction = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const publicKey = privateKey.getPublicKey();

    if (schema === undefined) {
        schema = privateKey.algorithm.defaultSchema;
    }

    const signature = privateKey.sign(tx.getHash(), schema);
    const sig = new Sig();
    sig.M = 1;
    sig.pubKeys = [publicKey];
    sig.sigData = [signature.serializeHex()];
    tx.sigs = [sig];
};

/**
 *
 * @param tx
 * @param pris
 * @param schema
 */
export const signTx = (tx: Transaction, pris: PrivateKey[][], schema?: SignatureScheme) => {
    const sigs = new Array<Sig>(pris.length);
    for (let i = 0; i < pris.length; i++) {
        sigs[i] = new Sig();
        sigs[i].M = 0;
        sigs[i].pubKeys = new Array<PublicKey>(pris[i].length);
        sigs[i].sigData = new Array<string>(pris[i].length);
        for (let j = 0; j < pris[i].length; j++) {
            sigs[i].M++;
            const signature = pris[i][j].sign(tx.getHash(), schema);
            const publicKey = pris[i][j].getPublicKey();
            sigs[i].pubKeys[j] = publicKey;
            sigs[i].sigData[j] = signature.serializeHex();
        }
    }
    tx.sigs = sigs;
};

export const pushBool = (param: boolean) => {
    let result = '';
    if (param) {
        result += opcode.PUSHT;
    } else {
        result += opcode.PUSHF;
    }
    return result;
};

export const pushInt = (param: number) => {
    let result = '';
    if (param === -1) {
        result += opcode.PUSHM1;
    } else if (param === 0) {
        result += opcode.PUSH0;
    } else if (param > 0 && param < 16) {
        const num = opcode.PUSH1 - 1 + param;
        result += num2hexstring(num);
    } else {
        result += num2VarInt(param);
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
    // to work with vm
    if (params.length === 0) {
        result += '00';
        params.length = 1;
    }
    const paramsLen = num2hexstring(params.length + 0x50);
    result += paramsLen;

    const paramsEnd = 'c1';
    result += paramsEnd;

    result += hex2VarBytes(functionName);

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
                type : 'int',
                value : p.getValue().toString()
            };
            break;
        case ParameterType.Long:
            o = {
                type : 'int64',
                value : p.getValue()
            };
            break;
        case ParameterType.IntArray:
            o = {
                type : 'int_array',
                value : p.getValue()
            };
            break;
        case ParameterType.LongArray:
            o = {
                type : 'int_array',
                value : p.getValue()
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

export const buildNativeContractParam = (params: Parameter[]) => {
    let result = '';

    for ( const p of params) {
        const type = p.getType();
        switch (type) {
        case ParameterType.ByteArray:
            result += hex2VarBytes(p.value);
            break;
        case ParameterType.Int:
            result += p.value;
        default:
            break;
        }
    }

    return result;
};

export const makeInvokeCode = (
    funcName: string,
    params: Parameter[],
    codeHash: string,
    vmType: VmType = VmType.NEOVM
) => {
    const invokeCode = new InvokeCode();
    const vmCode = new VmCode();
    const funcNameHex = str2hexstr(funcName);

    if (vmType === VmType.NEOVM) {
        const args = buildSmartContractParam(funcNameHex, params);
        const contract = new Contract();
        contract.address = codeHash;
        contract.args = args;
        contract.method = '';
        let code = contract.serialize();
        code = num2hexstring(opcode.APPCALL) + code;

        vmCode.code = code;
        vmCode.vmType = vmType;

    } else if (vmType === VmType.WASMVM) {
        const args = buildWasmContractParam(params);
        const contract = new Contract();
        contract.version = '01';
        contract.address = codeHash;
        contract.method = funcName;
        contract.args = args;
        const code = contract.serialize();

        vmCode.code = code;
        vmCode.vmType = vmType;

    } else if (vmType === VmType.NativeVM) {
        const args = buildNativeContractParam(params);
        const contract = new Contract();
        contract.address = codeHash;
        contract.args = args;
        contract.method = funcName;
        const code = contract.serialize();
        vmCode.code = code;
        vmCode.vmType = vmType;
    }

    invokeCode.code = vmCode;
    return invokeCode;
};

export const makeInvokeTransaction = (
    funcName: string,
    parameters: Parameter[],
    scriptHash: string,
    vmType: VmType = VmType.NEOVM,
    gas: string,
    payer?: Address
) => {
    const tx = new Transaction();
    tx.type = TxType.Invoke;
    tx.version = 0x00;

    // let scriptHash = abiInfo.getHash()
    if (scriptHash.substr(0, 2) === '0x') {
        scriptHash = scriptHash.substring(2);
        scriptHash = reverseHex(scriptHash);
    }

    // tslint:disable-next-line:no-console
    console.log('codehash: ' + scriptHash);

    const payload = makeInvokeCode(funcName, parameters, scriptHash, vmType);

    tx.payload = payload;

    // gas
    if (DEFAULT_GAS_LIMIT === Number(0)) {
        tx.gasPrice = new Fixed64();
    } else {
        const price = new BigNumber(gas).multipliedBy(1e9).dividedBy(new BigNumber(DEFAULT_GAS_LIMIT)).toString();
        tx.gasPrice = new Fixed64(price);
    }
    if (payer) {
        tx.payer = payer;
    }
    return tx;
};

export function makeDeployCodeTransaction(
    code: string,
    vmType: VmType = VmType.NEOVM,
    name: string= '',
    codeVersion: string= '1.0',
    author: string= '',
    email: string= '',
    desp: string= '', needStorage: boolean= true, gas: string, payer?: Address) {
    const dc = new DeployCode();
    dc.author = author;
    const vmCode = new VmCode();
    vmCode.code = code;
    vmCode.vmType = vmType;
    dc.code = vmCode;
    dc.version = codeVersion;
    dc.description = desp;
    dc.email = email;
    dc.name = name;
    dc.needStorage = needStorage;

    const tx = new Transaction();
    tx.version = 0x00;

    tx.payload = dc;

    tx.type = TxType.Deploy;
    // gas
    if (DEFAULT_GAS_LIMIT === Number(0)) {
        tx.gasPrice = new Fixed64();
    } else {
        const price = new BigNumber(gas).multipliedBy(1e9).dividedBy(new BigNumber(DEFAULT_GAS_LIMIT)).toString();
        tx.gasPrice = new Fixed64(price);
    }
    if (payer) {
        tx.payer = payer;
    }

    return tx;

}

export function buildTxParam(tx: Transaction, isPreExec: boolean = false) {
    const op = isPreExec ? { PreExec: '1'} : {};
    const serialized = tx.serialize();

    return JSON.stringify(Object.assign({}, Default_params, { Data: serialized }, op));
}

// {"jsonrpc": "2.0", "method": "sendrawtransaction", "params": ["raw transactioin in hex"], "id": 0}
export function buildRpcParam(tx: any, method?: string) {
    const param = tx.serialize();
    const result = {
        jsonrpc: '2.0',
        method: method || 'sendrawtransaction',
        params: [param],
        id: 10
    };
    return result;
}

export function buildRestfulParam(tx: any) {
    const param = tx.serialize();
    return {
        Action : 'sendrawtransaction',
        Version : '1.0.0',
        Data : param
    };
}

export function sendRawTxRestfulUrl(url: string, preExec: boolean = false) {
    if (url.charAt(url.length - 1) === '/') {
        url = url.substring(0, url.length - 1);
    }

    let restUrl = url + REST_API.sendRawTx;
    if (preExec) {
        restUrl += '?preExec=1';
    }

    return restUrl;
}

/* {
    "Action": "Notify",
        "Desc": "SUCCESS",
            "Error": 0,
                "Result": {
        "Container": "ea02f7d3c828c79c65c198e016554d6c8ea7a7502dc164d649afe2c0059aa2b1",
            "CodeHash": "8665eebe481029ea4e1fcf32aad2edbbf1728beb",
                "State": [{
                    "Value": [{
                        "Value": "417474726962757465"
                    }, {
                        "Value": "757064617465"
                    }, {
                        "Value": "6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b"
                    }, {
                        "Value": "436c616d3a74776974746572"
                    }]
                }],
                    "BlockHeight": 37566
    },
    "Version": "1.0.0"
} */

const enum EventType {
    Attribute = 'Attribute',
    Register = 'Register',
    PublicKey = 'PublicKey'
}

/**
 * @deprecated Use NotifyEvent.deserialize() instead.
 */
export function parseEventNotify(res: any)  {
    // parse state
    for (const r of res.Result) {
        const states = r.States;
        const parsedStates = [];

        if (states && states.length > 0) {
            for (const s of states) {
                parsedStates.push(hexstr2str(s));
            }
        }
        r.States = parsedStates;
    }
    return res;
}
