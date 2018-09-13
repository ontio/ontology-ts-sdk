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
import AbiFunction from '../smartcontract/abi/abiFunction';
import { Parameter } from '../smartcontract/abi/parameter';
import {
    num2hexstring,
    str2hexstr
} from '../utils';
import opcode from './opcode';
import DeployCode from './payload/deployCode';
import InvokeCode from './payload/invokeCode';
import { comparePublicKeys } from './program';
import { pushHexString, pushInt, serializeAbiFunction } from './scriptBuilder';
import { Transaction, TxType } from './transaction';
import { Transfer } from './transfer';
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
 * Creates transaction to invoke native contract
 * @param funcName Function name of contract to call
 * @param params Parameters serialized in hex string
 * @param contractAddr Adderss of contract
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for transaction gas
 */
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

    let tx: Transaction;
    if (funcName === 'transfer') {
        tx = new Transfer();
    } else {
        tx = new Transaction();
    }

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

/**
 * Creates transaction to inovke smart contract
 * @param funcName Function name of smart contract
 * @param params Array of Parameters
 * @param contractAddr Address of contract
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for gas
 */
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

    const abiFunc = new AbiFunction(funcName, '', params);
    const args = serializeAbiFunction(abiFunc);

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
