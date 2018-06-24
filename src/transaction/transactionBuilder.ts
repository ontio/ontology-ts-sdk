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
import { NATIVE_INVOKE_NAME, REST_API, TX_MAX_SIG_SIZE } from '../consts';
import { Address, PrivateKey, SignatureScheme } from '../crypto';
import { PublicKey } from '../crypto/PublicKey';
import { ERROR_CODE } from '../error';
import { Parameter } from '../smartcontract/abi/parameter';
import {
    num2hexstring,
    str2hexstr
} from '../utils';
import opcode from './opcode';
import DeployCode from './payload/deployCode';
import InvokeCode from './payload/invokeCode';
import { buildSmartContractParam, pushHexString, pushInt } from './scriptBuilder';
import { Transaction, TxType } from './transaction';
import { TxSignature } from './txSignature';
// const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

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
export const signTransaction = async (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const hash = tx.getHash();

    const signature = await TxSignature.create(hash, privateKey, schema);

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
export const addSign = async (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const hash = tx.getHash();
    const signature = await TxSignature.create(hash, privateKey, schema);

    tx.sigs.push(signature);
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
export const signTx = async (tx: Transaction, M: number, pubKeys: PublicKey[],
                             privateKey: PrivateKey, scheme?: SignatureScheme) => {

    if (tx.sigs.length === 0) {
        tx.sigs = [];
    } else {
        if (tx.sigs.length > TX_MAX_SIG_SIZE || M > pubKeys.length || M <= 0 || pubKeys.length === 0) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tx.sigs.length; i++) {
            if (tx.sigs[i].pubKeys === pubKeys) {
                if (tx.sigs[i].sigData.length + 1 > pubKeys.length) {
                    throw new Error('Too many sigData');
                }
                const signData = (await privateKey.sign(tx.getHash(), scheme)).serializeHex();
                tx.sigs[i].sigData.push(signData);
                return;
            }
        }
    }
    const sig = new TxSignature();
    sig.M = M;
    sig.pubKeys = pubKeys;
    sig.sigData = [(await privateKey.sign(tx.getHash(), scheme)).serializeHex()];
    tx.sigs.push(sig);
};

export function makeNativeContractTx(
    funcName: string,
    params: string,
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
) {
    let code = '';
    code += params;
    code += pushHexString(str2hexstr(funcName));
    code += pushHexString(contractAddr.serialize());
    code += pushInt(0);
    code += num2hexstring(opcode.SYSCALL);
    code += pushHexString(str2hexstr(NATIVE_INVOKE_NAME));
    const payload = new InvokeCode();
    payload.code = code;
    const tx = new Transaction();
    tx.type = TxType.Invoke;
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
}

export const makeInvokeTransaction = (
    funcName: string,
    params: Parameter[],
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
) => {
    const tx = new Transaction();
    tx.type = TxType.Invoke;

    const args = buildSmartContractParam(funcName, params);

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
