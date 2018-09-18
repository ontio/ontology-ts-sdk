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
import { Address, PublicKey } from '../../crypto';
import { DDOAttribute } from '../../transaction/ddo';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionBuilder';
import { num2hexstring, str2hexstr } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';

/**
 * Address of ONT ID contract
 */
export const ONTID_CONTRACT = '0000000000000000000000000000000000000003';

/**
 * Method names in ONT ID contract
 */
const ONTID_METHOD  = {
    regIDWithPublicKey: 'regIDWithPublicKey',
    regIDWithAttributes: 'regIDWithAttributes',
    addAttributes: 'addAttributes',
    removeAttribute: 'removeAttribute',
    getAttributes: 'getAttributes',
    getDDO: 'getDDO',
    addKey: 'addKey',
    removeKey: 'removeKey',
    getPublicKeys: 'getPublicKeys',
    addRecovery: 'addRecovery',
    changeRecovery: 'changeRecovery',
    getKeyState: 'getKeyState'
};

/**
 * Registers Identity.
 *
 * GAS calculation: gasLimit * gasPrice is equal to the amount of gas consumed.
 *
 * @param ontid User's ONT ID
 * @param publicKey Public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRegisterOntidTx(
    ontid: string,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.regIDWithPublicKey;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }
    const struct = new Struct();
    struct.add(ontid, publicKey.serializeHex());
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Registers Identity with initial attributes.
 *
 * @param ontid User's ONT ID
 * @param attributes Array of DDOAttributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRegIdWithAttributes(
    ontid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const method = ONTID_METHOD.regIDWithAttributes;
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    // let attrs = '';
    // for (const a of attributes) {
    //     attrs += a.serialize();
    // }

    // const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    // const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    // const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, attrs);
    // f.setParamsValue(p1, p2, p3);
    const attrLen = attributes.length;
    const struct = new Struct();
    struct.add(ontid, publicKey.serializeHex(), attrLen);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Adds attributes to ONT ID.
 *
 * @param ontid User's ONT ID
 * @param attributes Array of DDOAttributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddAttributeTx(
    ontid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addAttributes;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }
    const struct = new Struct();
    struct.add(ontid, attributes.length);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.list.push(publicKey.serializeHex());
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
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
 * @param payer Payer
 *
 */
export function buildRemoveAttributeTx(
    ontid: string,
    key: string,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttribute;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(ontid, str2hexstr(key), publicKey.serializeHex());
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );
    return tx;
}

/**
 * Queries attributes attached to ONT ID.
 *
 * @param ontid User's ONT ID
 */
export function buildGetAttributesTx(ontid: string) {
    const method = ONTID_METHOD.getAttributes;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(ontid);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT));
    return tx;
}

/**
 * Queries Description Object of ONT ID(DDO).
 *
 * @param ontid User's ONT ID
 */
export function buildGetDDOTx(ontid: string) {
    const method = ONTID_METHOD.getDDO;
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(ontid);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT));
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
 * @param payer Payer
 */
export function buildAddControlKeyTx(
    ontid: string,
    newPk: PublicKey,
    userKey: PublicKey | Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addKey;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = newPk.serializeHex();
    let p3;
    if (userKey instanceof PublicKey) {
        p3 = userKey.serializeHex();
    } else if (userKey instanceof Address) {
        p3 = userKey.serialize();
    }
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Revokes a public key from ONT ID.
 *
 * @param ontid User's ONT ID
 * @param pk2Remove Public key to be removed
 * @param sender User's public key or address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveControlKeyTx(
    ontid: string,
    pk2Remove: PublicKey,
    sender: PublicKey | Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKey;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = pk2Remove.serializeHex();
    let p3;
    if (sender instanceof PublicKey) {
        p3 = sender.serializeHex();
    } else if (sender instanceof Address) {
        p3 = sender.serialize();
    }
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
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
    const method = ONTID_METHOD.getPublicKeys;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }
    const struct = new Struct();
    struct.add(ontid);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT));
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
 * @param payer Payer
 */
export function buildAddRecoveryTx(
    ontid: string,
    recovery: Address,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addRecovery;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = recovery;
    const p3 = publicKey.serializeHex();
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT), gasPrice, gasLimit, payer);
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
 * @param payer Payer
 */
export function buildChangeRecoveryTx(
    ontid: string,
    newrecovery: Address,
    oldrecovery: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.changeRecovery;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = newrecovery;
    const p3 = oldrecovery;
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT),
    gasPrice, gasLimit);
    tx.payer = payer || oldrecovery;
    return tx;
}

/**
 * Queries the state of the public key associated with ONT ID.
 *
 * @param ontid user's ONT ID
 * @param pkId User's public key Id
 */
export function buildGetPublicKeyStateTx(ontid: string, pkId: number) {
    const method = ONTID_METHOD.getKeyState;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    // tslint:disable-next-line:no-console
    console.log('did: ' + ontid);

    const index = num2hexstring(pkId, 4, true);

    // tslint:disable-next-line:no-console
    console.log('index: ' + index);

    const struct = new Struct();
    struct.add(ontid, pkId);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT));
    return tx;
}
