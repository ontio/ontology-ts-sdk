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
import Fixed64 from '../common/fixed64';
import { REST_API, TX_MAX_SIG_SIZE } from '../consts';
import { Address, PrivateKey, SignatureScheme } from '../crypto';
import { PublicKey } from '../crypto/PublicKey';
import { ERROR_CODE } from '../error';
import AbiFunction from '../smartcontract/abi/abiFunction';
import { Parameter } from '../smartcontract/abi/parameter';

import {
    num2hexstring,
    reverseHex,
    str2hexstr
} from '../utils';
import { ParameterType } from './../smartcontract/abi/parameter';
import opcode from './opcode';
import DeployCode from './payload/deployCode';
import InvokeCode from './payload/invokeCode';
import { comparePublicKeys } from './program';
import { createCodeParamsScript, serializeAbiFunction } from './scriptBuilder';
import { Transaction, TxType } from './transaction';

import { makeTransferTx } from '../smartcontract/nativevm/ontAssetTxBuilder';
import { buildGetDDOTx, buildRegisterOntidTx } from '../smartcontract/nativevm/ontidContractTxBuilder';
import { TxSignature } from './txSignature';

// tslint:disable-next-line:variable-name
export const Default_params = {
    Action: 'sendrawtransaction',
    Version: '1.0.0',
    Type: '',
    Op: 'test'
};

/**
 * Signs the transaction object.
 *
 * If there is already a signature, the new one will replace existing.
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param privateKey Private key to sign with
 * @param schema Signature Schema to use
 */
export const signTransaction = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const signature = TxSignature.create(tx, privateKey, schema);

    tx.sigs = [signature];
};

/**
 * Signs the transaction object asynchroniously.
 *
 * If there is already a signature, the new one will replace existing.
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param privateKey Private key to sign with
 * @param schema Signature Schema to use
 */
export const signTransactionAsync = async (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const signature = await TxSignature.createAsync(tx, privateKey, schema);

    tx.sigs = [signature];
};

/**
 * Signs the transaction object.
 *
 * If there is already a signature, the new one will be added to the end.
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param privateKey Private key to sign with
 * @param schema Signature Schema to use
 */
export const addSign = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const signature = TxSignature.create(tx, privateKey, schema);

    tx.sigs.push(signature);
};

const equalPks = (pks1: PublicKey[], pks2: PublicKey[]): boolean => {
    if (pks1 === pks2) {
        return true;
    }
    pks1.sort(comparePublicKeys);
    pks2.sort(comparePublicKeys);
    if (pks1.length !== pks2.length) {
        return false;
    }
    for (let i = 0; i < pks1.length ; i++) {
        if (pks1[i].key !== pks2[i].key) {
            return false;
        }
    }
    return true;
};

/**
 * Signs the transaction with multiple signatures with multi-sign keys.
 *
 * If there is already a signature, the new ones will be added to the end.
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param M m of the (m ,n) multi sign address threshold
 * @param pubKeys Array of Public keys of (m,n) multi sign address, the number is n
 * @param privateKey Private key to sign the tx.
 * @param scheme Signature scheme to use
 */
export const signTx = (tx: Transaction, M: number, pubKeys: PublicKey[],
                       privateKey: PrivateKey, scheme?: SignatureScheme) => {

    if (tx.sigs.length === 0) {
        tx.sigs = [];
    } else {
        if (tx.sigs.length > TX_MAX_SIG_SIZE || M > pubKeys.length || M <= 0 || pubKeys.length === 0) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tx.sigs.length; i++) {
            if (equalPks(tx.sigs[i].pubKeys, pubKeys)) {
                if (tx.sigs[i].sigData.length + 1 > pubKeys.length) {
                    throw new Error('Too many sigData');
                }
                const signData = privateKey.sign(tx, scheme).serializeHex();
                tx.sigs[i].sigData.push(signData);
                return;
            }
        }
    }
    const sig = new TxSignature();
    sig.M = M;
    sig.pubKeys = pubKeys;
    sig.sigData = [privateKey.sign(tx, scheme).serializeHex()];
    tx.sigs.push(sig);
};

/**
 * Creates transaction to inovke smart contract
 * @param funcName Function name of smart contract
 * @param params Array of Parameters or serialized parameters
 * @param contractAddr Address of contract
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for gas
 */
export const makeInvokeTransaction = (
    funcName: string,
    params: Parameter[] | string,
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
) => {
    const tx = new Transaction();
    tx.type = TxType.Invoke;

    let args = '';
    if (typeof params === 'string') {
        args = params;
    } else {
        const abiFunc = new AbiFunction(funcName, '', params);
        args = serializeAbiFunction(abiFunc);
    }

    let code = args + num2hexstring(opcode.APPCALL);
    code += contractAddr.serialize();

    const payload = new InvokeCode();
    payload.code = code;
    tx.payload = payload;

    if (gasLimit) {
        tx.gasLimit = new Fixed64(gasLimit);
    }
    if (gasPrice) {
        tx.gasPrice = new Fixed64(gasPrice);
    }
    if (payer) {
        tx.payer = payer;
    }
    return tx;
};

/**
 * Creates transaction to deploy smart contract
 * @param code Avm code of contract to deploy
 * @param name Name of contract
 * @param codeVersion version of contract
 * @param author Author of contract
 * @param email Email of author
 * @param desp Description of contract
 * @param needStorage Decides if the contract needs storage
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for gas
 */
export function makeDeployCodeTransaction(
    code: string,
    name: string= '',
    codeVersion: string= '1.0',
    author: string= '',
    email: string= '',
    desp: string= '', needStorage: boolean= true, gasPrice: string, gasLimit: string, payer?: Address) {
    const dc = new DeployCode();
    dc.author = author;
    // const vmCode = new VmCode();
    // vmCode.code = code;
    // vmCode.vmType = vmType;
    // dc.code = vmCode;
    dc.code = code;
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
    // if (DEFAULT_GAS_LIMIT === Number(0)) {
    //     tx.gasPrice = new Fixed64();
    // } else {
    //     const price = new BigNumber(gas).multipliedBy(1e9).dividedBy(new BigNumber(DEFAULT_GAS_LIMIT)).toString();
    //     tx.gasPrice = new Fixed64(price);
    // }
    tx.gasLimit = new Fixed64(gasLimit);
    tx.gasPrice = new Fixed64(gasPrice);
    if (payer) {
        tx.payer = payer;
    }

    return tx;

}

/**
 * @deprecated
 * Creates params from transaction to send with websocket
 * @param tx Transactio to send
 * @param isPreExec Decides if it is pre-execute transaction
 */
export function buildTxParam(tx: Transaction, isPreExec: boolean = false) {
    const op = isPreExec ? { PreExec: '1'} : {};
    const serialized = tx.serialize();

    return JSON.stringify(Object.assign({}, Default_params, { Data: serialized }, op));
}

/**
 * @deprecated
 * Creates params from transaction to send with rpc
 * @param tx Transaction
 * @param method Method name
 */
export function buildRpcParam(tx: Transaction, method?: string) {
    const param = tx.serialize();
    const result = {
        jsonrpc: '2.0',
        method: method || 'sendrawtransaction',
        params: [param],
        id: 10
    };
    return result;
}

/**
 * @deprecated
 * Creates params from transaction to send with restful
 * @param tx Transaction
 */
export function buildRestfulParam(tx: Transaction) {
    const param = tx.serialize();
    return {
        Action : 'sendrawtransaction',
        Version : '1.0.0',
        Data : param
    };
}

/**
 * @deprecated
 * @param url Url of blochchain node
 * @param preExec Decides if is a pre-execute request
 */
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

export function transferStringParameter(value: string): Parameter {
    const strs = value.split(':');
    if (strs.length !== 2) {
        throw new Error('Invalid parameter. ' + value);
    }
    const p = new Parameter('', strs[0] as ParameterType, strs[1]);
    if (p.type === ParameterType.Address) {
        p.type = ParameterType.ByteArray;
        p.value = new Address(p.value).serialize();
    }
    return p;
}

export function transformMapParameter(value: any) {
    const map: any = {};
    for (const k of Object.keys(value)) {
        const v = value[k];
        if (typeof v === 'number') {
            map[k] = new Parameter('', ParameterType.Integer, v);
        } else if (typeof v === 'boolean') {
            map[k] = new Parameter('', ParameterType.Boolean, v);
        } else if (Array.isArray(v)) {
            map[k] = new Parameter('', ParameterType.Array, transformArrayParameter(v));
        } else if (typeof v === 'object') {
            map[k] = new Parameter('', ParameterType.Map, transformMapParameter(v));
        } else if (typeof v === 'string') {
            map[k] = transferStringParameter(v);
        }
    }
    return map;
}

export function transformArrayParameter(val: any) {
    const list = [];
    for (const v of val) {
        let p = new Parameter('', ParameterType.ByteArray, v);
        if (typeof v === 'number') {
            p.type = ParameterType.Integer;
        } else if (typeof v === 'boolean') {
            p.type = ParameterType.Boolean;
        } else if (Array.isArray(v)) {
            p.type = ParameterType.Array;
            p.value = transformArrayParameter(v);
        } else if (typeof v === 'object') {
            p.type = ParameterType.Map;
            p.value = transformMapParameter(v);
        } else if (typeof v === 'string') {
            p = transferStringParameter(v);
        }
        list.push(p);
    }
    return list;
}

export function transformParameter(arg: any) {
    const name = arg.name;
    const value = arg.value;
    let p = new Parameter(name, ParameterType.ByteArray, value);
    if (typeof value === 'number') {
        p.type = ParameterType.Integer;
        p.value = Number(value);
    } else if (typeof value === 'boolean') {
        p.type = ParameterType.Boolean;
        p.value = Boolean(value);
    } else if (Array.isArray(value)) {
        p.type = ParameterType.Array;
        p.value = transformArrayParameter(value);
    } else if (typeof value === 'object') {
        p.type = ParameterType.Map;
        p.value = transformMapParameter(value);
    } else if (typeof value === 'string') {
        p = transferStringParameter(value);
    }
    return p;
}

export function buildParamsByJson(json: any) {
    const paramsList = [];
    const functions = json.functions;
    for (const obj of functions) {
        const { operation, args } = obj;
        const list = [];
        list.push(str2hexstr(operation));
        const temp = [];
        for (const arg of args) {
            temp.push(transformParameter(arg));
        }
        list.push(temp);
        paramsList.push(list);
    }
    return paramsList;
}

export function makeTransactionsByJson(json: any) {
    if (!json) {
        throw new Error('Invalid parameter. Expect JSON object');
    }
    if (!json.action ||
        (json.action !== 'invoke' &&
        json.action !== 'invokeRead' &&
        json.action !== 'invokePasswordFree')) {
        throw new Error('Invalid parameter. The action type must be "invoke or invokeRead"');
    }
    if (!json.params || !json.params.invokeConfig) {
        throw new Error('Invalid parameter. The params can not be empty.');
    }
    const invokeConfig = json.params.invokeConfig;
    // tslint:disable-next-line:prefer-const
    let { payer, gasPrice, gasLimit, contractHash } = invokeConfig;
    if (!contractHash) {
        throw new Error('Invalid parameter. The contractHash can not be empty.');
    }
    const contractAddr = new Address(reverseHex(contractHash));
    payer = payer ? new Address(payer) : null;
    gasPrice = gasPrice + '' || '500';
    gasLimit = gasLimit + '' || '200000';
    const txList = [];
    if (contractHash.indexOf('00000000000000000000000000000000000000') > -1) { // native contract
        const tx = buildNativeTxFromJson(invokeConfig);
        txList.push(tx);
    } else {
        const parameters = buildParamsByJson(invokeConfig);
        for (const list of parameters) {
            const params = createCodeParamsScript(list);
            const tx = makeInvokeTransaction('', params, contractAddr, gasPrice, gasLimit, payer);
            txList.push(tx);
        }
    }

    return txList;
}

export function buildNativeTxFromJson(json: any) {
    const funcArgs = json.functions[0];
    const args = funcArgs.args;
    if (json.contractHash.indexOf('02') > -1 || json.contractHash.indexOf('01') > -1) { // ONT ONG contract
        const tokenType = json.contractHash.indexOf('02') > -1 ? 'ONG' : 'ONT';
        if (funcArgs.operation === 'transfer') {
            const from = new Address(args[0].value.split(':')[1]);
            const to = new Address(args[1].value.split(':')[1]);
            const amount = args[2].value.split(':')[1] + ''; // convert to string
            const payer = new Address(json.payer);
            const tx = makeTransferTx(tokenType, from, to, amount, json.gasPrice, json.gasLimit, payer);
            return tx;
        }
    } else if (json.contractHash.indexOf('03') > -1) { // ONT ID contract
        if (funcArgs.operation === 'regIDWithPublicKey') {
            const ontid = args[0].value.substr(args[0].value.indexOf(':') + 1);
            const pk = new PublicKey(args[1].value.split(':')[1]);
            const payer = new Address(json.payer);
            const tx = buildRegisterOntidTx(ontid, pk, json.gasPrice, json.gasLimit, payer);
            return tx;
        } else if (funcArgs.operation === 'getDDO') {
            const ontid = args[0].value.substr(args[0].value.indexOf(':') + 1);
            const tx = buildGetDDOTx(ontid);
            return tx;
        }
    }
}
