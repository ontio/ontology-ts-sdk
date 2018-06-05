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
import { Address, PublicKey } from '../crypto';
import AbiInfo from '../smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../smartcontract/abi/parameter';
import abiJson from '../smartcontract/data/idContract.abi';
import { DDOAttribute } from '../transaction/ddo';
import { Transaction } from '../transaction/transaction';
import { makeInvokeTransaction } from '../transaction/transactionBuilder';
import { VmType } from '../transaction/vmcode';
import { num2hexstring, str2hexstr } from '../utils';

const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson));

/**
 * Registers Identity.
 *
 * GAS calculation: gasLimit * gasPrice is equal to the amount of gas consumed.
 *
 * @param ontid User's ONT ID
 * @param publicKey Public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildRegisterOntidTx(ontid: string, publicKey: PublicKey,
                                     gasPrice: string, gasLimit: string): Transaction {
    const f = abiInfo.getFunction('regIDWithPublicKey');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    // tslint:disable-next-line:no-console
    console.log('Register ', ontid);

    const name1 = f.parameters[0].getName();
    const type1 = ParameterType.ByteArray;

    const name2 = f.parameters[1].getName();
    const type2 = ParameterType.ByteArray;

    const p1 = new Parameter(name1, type1, ontid);
    const p2 = new Parameter(name2, type2, publicKey.serializeHex());
    f.setParamsValue(p1, p2);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.hash,
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        Address.fromPubKey(publicKey)
    );

    return tx;
}

/**
 * Registers Identity with initial attributes.
 *
 * @param ontid User's ONT ID
 * @param attributes User's serialized attributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildRegIdWithAttributes(
    ontid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string
) {
    const f = abiInfo.getFunction('regIDWithAttributes');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    let attrs = '';
    for (const a of attributes) {
        attrs += a.serialize();
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, attrs);
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        Address.fromPubKey(publicKey)
    );

    return tx;
}

/**
 * Adds attributes to ONT ID.
 *
 * @param ontid User's ONT ID
 * @param attributes User's serialized attributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildAddAttributeTx(ontid: string, attributes: DDOAttribute[], publicKey: PublicKey,
                                    gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('addAttributes');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    let attrs = '';
    for (const a of attributes) {
        attrs += a.serialize();
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, attrs);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        Address.fromPubKey(publicKey)
    );
    return tx;
}

/**
 * Removes attribute from ONT ID.
 *
 * @param ontid User's ONT ID
 * @param key Key of attribute to remove
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 *
 */
export function buildRemoveAttributeTx(ontid: string, key: string, publicKey: PublicKey,
                                       gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('removeAttribute');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, key);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        Address.fromPubKey(publicKey)
    );
    return tx;
}

/**
 * Queries attributes attached to ONT ID.
 *
 * @param ontid User's ONT ID
 */
export function buildGetAttributesTx(ontid: string) {
    const f = abiInfo.getFunction('getAttributes');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM);
    return tx;
}

/**
 * Queries ONT ID Description Object of ONT ID.
 *
 * @param ontid User's ONT ID
 */
export function buildGetDDOTx(ontid: string) {
    const f = abiInfo.getFunction('getDDO');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM);
    return tx;
}
/**
 * Adds a new public key to ONT ID.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param userKey User's public key or address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildAddControlKeyTx(ontid: string, newPk: PublicKey,  userKey: PublicKey | Address,
                                     payer: Address, gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('addKey');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newPk.serializeHex());
    let p3;
    if (userKey instanceof PublicKey) {
        p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, userKey.serializeHex());
    } else if (userKey instanceof Address) {
        p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, userKey.toHexString());
    }
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Revoked a public key from ONT ID.
 *
 * @param ontid User's ONT ID
 * @param pk2Remove Public key to be removed
 * @param sender User's public key or address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildRemoveControlKeyTx(ontid: string, pk2Remove: PublicKey, sender: PublicKey | Address,
                                        payer: Address, gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('removeKey');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk2Remove.serializeHex());
    let p3;
    if (sender instanceof PublicKey) {
        p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.serializeHex());
    } else if (sender instanceof Address) {
        p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.toHexString());
    }
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gasPrice,
        gasLimit,
        payer
    );
    return tx;
}

/**
 * Queries public keys attached to ONT ID.
 *
 * @param ontid User's ONT ID
 */
export function buildGetPublicKeysTx(ontid: string) {
    const f = abiInfo.getFunction('getPublicKeys');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM);
    return tx;
}

/**
 * Adds recovery address to ONT ID.
 *
 * @param ontid User's ONT ID
 * @param recovery Recovery address, must have not be set
 * @param publicKey User's public key, must be user's existing public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildAddRecoveryTx(ontid: string, recovery: Address,
                                   publicKey: PublicKey, gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('addRecovery');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, recovery);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, gasPrice, gasLimit);
    return tx;
}

/**
 * Changes recovery address of ONT ID.
 *
 * This contract call must be initiated by the original recovery address.
 *
 * @param ontid user's ONT ID
 * @param newrecovery New recovery address
 * @param oldrecovery Original recoevery address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function buildChangeRecoveryTx(ontid: string, newrecovery: Address,
                                      oldrecovery: Address, gasPrice: string, gasLimit: string) {
    const f = abiInfo.getFunction('changeRecovery');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newrecovery);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, oldrecovery);
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM,
    gasPrice, gasLimit, oldrecovery);
    return tx;
}

/**
 * Queries the state of the public key associated with ONT ID.
 *
 * @param ontid user's ONT ID
 * @param pkId User's public key Id
 */
export function buildGetPublicKeyStateTx(ontid: string, pkId: number) {
    const f = abiInfo.getFunction('getKeyState');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    // tslint:disable-next-line:no-console
    console.log('did: ' + ontid);

    const index = num2hexstring(pkId, 4, true);

    // tslint:disable-next-line:no-console
    console.log('index: ' + index);

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.Int, index);
    f.setParamsValue(p1, p2);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM);
    return tx;
}
