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

export function buildRegisterOntidTx(ontid: string, publicKey: PublicKey, gas: string): Transaction {
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
        gas,
        Address.addressFromPubKey(publicKey)
    );

    return tx;
}

/**
 *
 * @param ontid user's ONT ID
 * @param attributes user's serialized attributes
 * @param publicKey user's public key
 */
export function buildRegIdWithAttributes(
    ontid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gas: string
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
        gas,
        Address.addressFromPubKey(publicKey)
    );

    return tx;
}

/**
 *
 * @param ontid user's ONT ID
 * @param key key of the attribute, hex string
 * @param type type of the attribute, hex string
 * @param value value of the attribute, hex string
 * @param publicKey user's public key
 */
export function buildAddAttributeTx(ontid: string, attributes: DDOAttribute[], publicKey: PublicKey, gas: string) {
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
        gas,
        Address.addressFromPubKey(publicKey)
    );
    return tx;
}

/**
 * @param ontid user's ONT ID
 * @param key key of attribute to be remove
 * @param publicKey user's publicKey
 */
export function buildRemoveAttributeTx(ontid: string, key: string, publicKey: PublicKey, gas: string) {
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
        gas,
        Address.addressFromPubKey(publicKey)
    );
    return tx;
}

/**
 *  @param ontid user's ONT ID
 */
export function buildGetAttributesTx(ontid: string) {
    const f = abiInfo.getFunction('getAttributes');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, '0');
    return tx;
}

export function buildGetDDOTx(ontid: string) {
    const f = abiInfo.getFunction('getDDO');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, '0');
    return tx;
}

/**
 * @param ontid user's ONT ID
 * @param newPk new public key to be added
 * @param publicKey user's public key
 */
export function buildAddControlKeyTx(ontid: string, newPk: PublicKey,  publicKey: PublicKey, gas: string) {
    const f = abiInfo.getFunction('addKey');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newPk.serializeHex());
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gas,
        Address.addressFromPubKey(publicKey)
    );

    return tx;
}

/**
 *
 * @param ontid user's ONT ID
 * @param pk2Remove public key to be removed
 * @param sender user's public key
 */
export function buildRemoveControlKeyTx(ontid: string, pk2Remove: PublicKey, sender: PublicKey, gas: string) {
    const f = abiInfo.getFunction('removeKey');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk2Remove.serializeHex());
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, sender.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(
        f.name,
        f.parameters,
        abiInfo.getHash(),
        VmType.NativeVM,
        gas,
        Address.addressFromPubKey(sender)
    );
    return tx;
}

export function buildGetPublicKeysTx(ontid: string) {
    const f = abiInfo.getFunction('getPublicKeys');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    f.setParamsValue(p1);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, '0');
    return tx;
}

/**
 *
 * @param ontid user's ONT ID
 * @param recovery recovery address, must have not be set
 * @param publicKey user's public key, must be user's existing public key
 */
export function buildAddRecoveryTx(ontid: string, recovery: Address, publicKey: PublicKey, gas: string) {
    const f = abiInfo.getFunction('addRecovery');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, recovery);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, gas);
    return tx;
}

/**
 *
 * @param ontid user's ONT ID
 * @param newrecovery new recovery address
 * @param oldrecovery original recoevery address
 * This contract call must be initiated by the original recovery address.
 */
export function buildChangeRecoveryTx(ontid: string, newrecovery: Address, oldrecovery: Address, gas: string) {
    const f = abiInfo.getFunction('changeRecovery');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, newrecovery);
    const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, oldrecovery);
    f.setParamsValue(p1, p2, p3);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, gas, oldrecovery);
    return tx;
}

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

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, '0');
    return tx;
}

/**
 * This method is Deprecated.
 */
export function buildGetPublicKeyIdTx(ontid: string, pk: PublicKey) {
    const f = abiInfo.getFunction('GetPublicKeyId');

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, pk.serializeHex());
    f.setParamsValue(p1, p2);

    const tx = makeInvokeTransaction(f.name, f.parameters, abiInfo.getHash(), VmType.NativeVM, '0');
    return tx;
}
