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
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { isHexString, str2hexstr } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';
import Group from './ontid/group';
import { serializeSigners, Signer } from './ontid/signer';

/**
 * Address of ONT ID contract
 */
export const ONTID_CONTRACT = '0000000000000000000000000000000000000003';

/**
 * Method names in ONT ID contract
 */
const ONTID_METHOD  = {
    regIDWithPublicKey: 'regIDWithPublicKey',
    regIdWithController: 'regIDWithController',
    revokeID: 'revokeID',
    removeController: 'removeController',
    revokeIDByController: 'revokeIDByController',
    regIDWithAttributes: 'regIDWithAttributes',
    addAttributes: 'addAttributes',
    removeAttribute: 'removeAttribute',
    addAttributesByController: 'addAttributesByController',
    removeAttributesByController: 'removeAttributesByController',
    addAttributesByIndex: 'addAttributesByIndex',
    removeAttributesByIndex: 'removeAttributesByIndex',
    getAttributes: 'getAttributes',
    getDDO: 'getDDO',
    addKey: 'addKey',
    setRecovery: 'setRecovery',
    updateRecovery: 'updateRecovery',
    addKeyByController: 'addKeyByController',
    addKeyByRecovery: 'addKeyByRecovery',
    removeKeyByRecovery: 'removeKeyByRecovery',
    removeKeyByController: 'removeKeyByController',
    removeKeyByIndex: 'removeKeyByIndex',
    removeKey: 'removeKey',
    getPublicKeys: 'getPublicKeysJson',
    addRecovery: 'addRecovery',
    changeRecovery: 'changeRecovery',
    getKeyState: 'getKeyState',
    setKeyAccess: 'setKeyAccess',
    addAuthKey: 'addAuthKey',
    removeAuthKey: 'removeAuthKey',
    addService: 'addService',
    updateService: 'updateService',
    removeService: 'removeService',
    addContext: 'addContext',
    removeContext: 'removeContext',
    getDocument: 'getDocument',
    getService: 'getService',
    getController: 'getController',
    verifySignature: 'verifySignature',
    verifyController: 'verifyController'
};

/**
 * Registers Identity.
 *
 * Register ontid with public key
 *
 * @param ontid User's ONT ID
 * @param publicKey Public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param access Accesses of public key. Available values: "all", "crud", "use". Default is "all"
 * @param payer Payer
 */
export function buildRegIDWithPublicKeyTx(
    ontid: string,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    access: string = 'all',
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.regIDWithPublicKey;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }
    const struct = new Struct();
    struct.add(ontid, publicKey.serializeHex(), str2hexstr(access));
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
 * Register one single controller
 *
 * The tx needs the signatures of: signer of the ontid, the controller, payer
 *
 * @param ontid User's ONT ID
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRegIdWithSingleControllerTx(
    ontid: string,
    controller: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.regIdWithController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(controller), index);
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
 * Register with multi controller
 *
 * The tx needs the signatures of: signer of the ontid, the controller, payer
 *
 * @param ontid User's ONT ID
 * @param controllers Multi controllers
 * @param signers Signer of controllers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRegIdWithMultiControllerTx(
    ontid: string,
    controllers: Group,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.regIdWithController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), controllers.serialize(), serializeSigners(signers));
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
 * Revoke ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param index Index of pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildMakeRevokeIdTx(
    ontid: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.revokeID;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index);
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
 * Revoke ONT ID by single controller
 * This tx needs the signature of the single controler
 *
 * @param ontid User's ONT ID
 * @param index Index of pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRevokeIdBySingleController(
    ontid: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.revokeIDByController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index);
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
 * Revoke ONT ID by multi controller
 * This tx needs the signature of the multi controlers
 *
 * @param ontid User's ONT ID
 * @param signers Signer of controllers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRevokeIdByMultiController(
    ontid: string,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.revokeIDByController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), serializeSigners(signers));
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
 * Remove controller
 * This tx needs the signature of pk with the given index
 *
 * @param ontid User's ONT ID
 * @param index Index of controller's pk
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveControllerTx(
    ontid: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index);
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
 * @param access Access of ONT ID
 * @param payer Payer
 */
export function buildRegIdWithAttributesTx(
    ontid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    access: string = 'all',
    payer?: Address
) {
    const method = ONTID_METHOD.regIDWithAttributes;
    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    const attrLen = attributes.length;
    struct.add(ontid, publicKey.serializeHex(), attrLen);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.add(str2hexstr(access));
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
 * Adds attribute to ONT ID by single controllers.
 *
 * @param ontid User's ONT ID
 * @param attributes Attributes to add
 * @param index Index of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddAttributesBySingleControllerTx(
    ontid: string,
    attributes: DDOAttribute[],
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addAttributesByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), attributes.length);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.add(index);
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
 * Adds attribute to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param attributes Attributes to add
 * @param signers Signers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddAttributesByMultiControllerTx(
    ontid: string,
    attributes: DDOAttribute[],
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addAttributesByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), attributes.length);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.add(serializeSigners(signers));
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
 * Adds attribute to ONT ID by pk
 *
 * @param ontid User's ONT ID
 * @param attributes Attributes to add
 * @param index Index of pk
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddAttributesByIndexTx(
    ontid: string,
    attributes: DDOAttribute[],
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addAttributesByIndex;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), attributes.length);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.add(index);
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
 * remove attribute to ONT ID by single controller.
 *
 * @param ontid User's ONT ID
 * @param key Key of attribute to remove
 * @param index Index of the controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveAttributesBySingleControllerTx(
    ontid: string,
    key: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttributesByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), str2hexstr(key));
    struct.add(index);
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
 * remove attribute to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveAttributesByMultiControllerTx(
    ontid: string,
    key: string,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttributesByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), str2hexstr(key));
    struct.add(serializeSigners(signers));
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
 * remove attribute to ONT ID by pk
 *
 * @param ontid User's ONT ID
 * @param key Key of attribute to remove
 * @param index Index of the pk
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveAttributesByIndexTx(
    ontid: string,
    key: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttributesByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();

    struct.add(str2hexstr(ontid), str2hexstr(key));
    struct.add(index);
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
export function buildAddPubKeyTx(
    ontid: string,
    newPk: PublicKey,
    userKey: PublicKey,
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
    const p3 = userKey.serializeHex();
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
 * Adds a new public key to ONT ID by single controller.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddPubKeyBySingleControllerTx(
    ontid: string,
    newPk: PublicKey,
    index: number,
    controller: string,
    access: string = 'all',
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
    const struct = new Struct();
    struct.add(p1, p2, index, str2hexstr(controller), str2hexstr(access));

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
 * Adds a new public key to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddKeyByMultiControllerTx(
    ontid: string,
    newPk: PublicKey,
    signers: Signer[],
    controller: string,
    access: string = 'all',
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addKeyByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = newPk.serializeHex();
    const struct = new Struct();
    struct.add(p1, p2, serializeSigners(signers), str2hexstr(controller), str2hexstr(access));

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
 * Set recovery to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param newRecovery newRecovery
 * @param signers signers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildSetRecoveryTx(
    ontid: string,
    newRecovery: Group,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.updateRecovery;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), newRecovery.serialize(), serializeSigners(signers));
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
 * Update recovery to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param recovery recovery
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildUpdateRecoveryTx(
    ontid: string,
    recovery: Group,
    index: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.regIdWithController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), recovery.serialize(), index);

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
 * Adds a new public key to ONT ID by recovery
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddKeyByRecoveryTx(
    ontid: string,
    newPk: PublicKey,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addKeyByRecovery;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(str2hexstr(ontid), newPk.serializeHex(), serializeSigners(signers));

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
 * remove a new public key to ONT ID by recovery
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param controller Controller's ONT ID
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveKeyByRecoveryTx(
    ontid: string,
    pubkeyIndex: number,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKeyByRecovery;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(str2hexstr(ontid), pubkeyIndex, serializeSigners(signers));

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
 * remove a new public key of ONT ID by single controllers.
 *
 * @param ontid User's ONT ID
 * @param pubkeyIndex Index of pubkey to be removed
 * @param controllerIndex Index of Controller's pubkey
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveKeyBySingleControllerTx(
    ontid: string,
    pubkeyIndex: number,
    controllerIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKeyByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const struct = new Struct();
    struct.add(str2hexstr(ontid), pubkeyIndex, controllerIndex);

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
 * Adds a new public key to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param pubkeyIndex Index of pubkey to be removed
 * @param signers Controllers' signers
 * @param index Index of the public key to verify signature of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveKeyByMultiControllerTx(
    ontid: string,
    pubkeyIndex: string,
    signers: Signer[],
    controller: string,
    access: string = 'all',
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKeyByController;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    if (!isHexString(pubkeyIndex)) {
        throw new Error('Parameter pubkeyIndex should be hex string');
    }

    const struct = new Struct();
    struct.add(str2hexstr(ontid), pubkeyIndex, serializeSigners(signers));

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
    // console.log('did: ' + ontid);

    // const index = num2hexstring(pkId, 4, true);

    // tslint:disable-next-line:no-console
    // console.log('index: ' + index);

    const struct = new Struct();
    struct.add(ontid, pkId);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(ONTID_CONTRACT));
    return tx;
}

/**
 * Add auth key to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param isNewPublicKey Decides if add the pubkey of ONT ID to the auth key
 * @param index If isNewPublicKey set true, this is the index of the pubkey to set as auth key
 * @param pubkey If isNewPublicKey set false, this is the new public key to set as auth key
 * @param controller ONT ID of the new pubkey
 * @param signIndex Index of signer's pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddAuthKeyTx(
    ontid: string,
    ifNewPublicKey: boolean,
    index: number,
    pubkey: PublicKey,
    controller: string,
    signIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addAuthKey;
    const struct1 = new Struct();
    struct1.add(pubkey.serializeHex(), str2hexstr(controller));
    const struct = new Struct();
    struct.add(str2hexstr(ontid), ifNewPublicKey, index, struct1, signIndex);

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
 * Remove auth key of ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param index If isNewPublicKey set true, this is the index of the pubkey to set as auth key
 * @param signIndex Index of signer's pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveAuthKeyTx(
    ontid: string,
    index: number,
    signIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAuthKey;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index, signIndex);

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
 * Add service to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param serviceId Identifier of service
 * @param type Type of service
 * @param serviceEndpoint Endpoint of service
 * @param index Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddServiceTx(
    ontid: string,
    serviceId: string,
    type: string,
    serviceEndpoint: string,
    index: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), str2hexstr(type), str2hexstr(serviceEndpoint), index);

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
 * Update service to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param serviceId Identifier of service
 * @param type Type of service
 * @param serviceEndpoint Endpoint of service
 * @param index Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildUpdateServiceTx(
    ontid: string,
    serviceId: string,
    type: string,
    serviceEndpoint: string,
    index: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.updateService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), str2hexstr(type), str2hexstr(serviceEndpoint), index);

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
 * Remove service to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param serviceId Identifier of service
 * @param index Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveServiceTx(
    ontid: string,
    serviceId: string,
    index: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), index);

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
 * Add context to ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param serviceId Identifier of service
 * @param index Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddContextTx(
    ontid: string,
    context: string[],
    index: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addContext;
    const struct = new Struct();
    const contexts = context.map((item: string) => str2hexstr(item));
    struct.add(str2hexstr(ontid), contexts, index);

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
 * Remove context of ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param serviceId Identifier of service
 * @param index Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveContextTx(
    ontid: string,
    context: string[],
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addContext;
    const struct = new Struct();
    const contexts = context.map((item: string) => str2hexstr(item));
    struct.add(str2hexstr(ontid), contexts, index);

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
 * Set key access of ONT ID
 *
 *
 * @param ontid User's ONT ID
 * @param setIndex Index of pubkey to set access
 * @param access Access to set.
 * @param signIndex Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildSetKeyAccessTx(
    ontid: string,
    setIndex: number,
    access: string,
    signIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.setKeyAccess;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), setIndex, str2hexstr(access), signIndex);

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
 * Verify signature
 * Tx needs contain the signature to verify
 *
 * @param ontid User's ONT ID
 * @param keyIndex Index of pubkey
 * @param gasLimit Gas limit
 */
export function buildVerifySignatureTx(
    ontid: string,
    keyIndex: number
): Transaction {
    const method = ONTID_METHOD.verifySignature;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), keyIndex);
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}

/**
 * Verify single controller
 *
 *
 * @param ontid User's ONT ID
 * @param keyIndex Index of pubkey
 * @param gasLimit Gas limit
 */
export function buildVerifySingleControllerTx(
    ontid: string,
    keyIndex: number
): Transaction {
    const method = ONTID_METHOD.verifyController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), keyIndex);
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}

/**
 * Verify multi controller
 *
 *
 * @param ontid User's ONT ID
 * @param signers Signers of multi controllers
 * @param gasLimit Gas limit
 */
export function buildVerifyMultiControllerTx(
    ontid: string,
    signers: Signer[]
): Transaction {
    const method = ONTID_METHOD.verifyController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), serializeSigners(signers));
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}

/**
 * Get service
 * Pre-exec this tx
 *
 * @param ontid User's ONT ID
 * @param signers Signers of multi controllers
 */
export function buildGetServiceTx(
    ontid: string,
    serviceId: string
): Transaction {
    const method = ONTID_METHOD.getService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId));
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}

/**
 * Get controller
 * Pre-exec this tx
 *
 * @param ontid User's ONT ID
 * @param signers Signers of multi controllers
 */
export function buildGetControllerTx(
    ontid: string
): Transaction {
    const method = ONTID_METHOD.getController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid));
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}

/**
 * Get document
 * Pre-exec this tx
 *
 * @param ontid User's ONT ID
 * @param signers Signers of multi controllers
 */
export function buildGetDocumentTx(
    ontid: string
): Transaction {
    const method = ONTID_METHOD.getDocument;
    const struct = new Struct();
    struct.add(str2hexstr(ontid));
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(ONTID_CONTRACT),
        '0',
        '0'
    );

    return tx;
}
