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
import RestClient from '../../network/rest/restClient';
import { DDOAttribute } from '../../transaction/ddo';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { hexstr2str, str2hexstr } from '../../utils';
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
    removeAttributeByController: 'removeAttributeByController',
    addAttributesByIndex: 'addAttributesByIndex',
    removeAttributeByIndex: 'removeAttributeByIndex',
    getAttributes: 'getAttributes',
    getDDO: 'getDDO',
    addKey: 'addKey',
    setRecovery: 'setRecovery',
    updateRecovery: 'updateRecovery',
    addKeyByController: 'addKeyByController',
    addKeyByRecovery: 'addKeyByRecovery',
    addKeyByIndex: 'addKeyByIndex',
    removeKeyByRecovery: 'removeKeyByRecovery',
    removeKeyByController: 'removeKeyByController',
    removeKeyByIndex: 'removeKeyByIndex',
    removeKey: 'removeKey',
    getPublicKeys: 'getPublicKeysJson',
    addRecovery: 'addRecovery',
    changeRecovery: 'changeRecovery',
    getKeyState: 'getKeyState',
    setKeyAccess: 'setKeyAccess',
    addNewAuthKey: 'addNewAuthKey',
    removeAuthKey: 'removeAuthKey',
    addNewAuthKeyByRecovery: 'addNewAuthKeyByRecovery',
    removeAuthKeyByRecovery: 'removeAuthKeyByRecovery',
    addNewAuthKeyByController: 'addNewAuthKeyByController',
    removeAuthKeyByController: 'removeAuthKeyByController',
    setAuthKeyByController: 'setAuthKeyByController',
    addService: 'addService',
    updateService: 'updateService',
    removeService: 'removeService',
    addContext: 'addContext',
    removeContext: 'removeContext',
    getDocument: 'getDocumentJson',
    getService: 'getServiceJson',
    getController: 'getControllerJson',
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
 * @param payer Payer
 */
export function buildRegIDWithPublicKeyTx(
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
 * Registers Identity.
 *
 * Register ontid with public key
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
) {
    return buildRegIDWithPublicKeyTx(ontid, publicKey, gasPrice, gasLimit, payer);
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
 * @param payer Payer
 */
export function buildRegIdWithAttributesTx(
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

    const struct = new Struct();
    const attrLen = attributes.length;
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
 * remove attribute to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param key Key of attribute to remove
 * @param signers Signers of multi controllers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveAttributeByMultiControllerTx(
    ontid: string,
    key: string,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttributeByController;

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
export function buildRemoveAttributeByIndexTx(
    ontid: string,
    key: string,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAttributeByIndex;

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
 * @param userKey User's public key
 * @param controller Controller of new pk
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddPubKeyTx(
    ontid: string,
    newPk: PublicKey,
    userKey: PublicKey,
    controller: string,
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
    struct.add(str2hexstr(controller));
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
 * Adds a new public key and its controller to ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param signers Singers of controllers
 * @param controller ONT ID of the new pk. Optional
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddKeyByMultiControllerTx(
    ontid: string,
    newPk: PublicKey,
    signers: Signer[],
    controller: string,
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
    struct.add(p1, p2, serializeSigners(signers));
    if (controller) {
        struct.add(str2hexstr(controller));
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
 * Adds a new public key to ONT ID by auth key.
 *
 * @param ontid User's ONT ID
 * @param newPk New public key to be added
 * @param index Index of auth key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddKeyByIndexTx(
    ontid: string,
    newPk: PublicKey,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addKeyByIndex;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = newPk.serializeHex();
    const struct = new Struct();
    struct.add(p1, p2, index);
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
 * remove public key of ONT ID by auth key.
 *
 * @param ontid User's ONT ID
 * @param newPk Pubkey to remove
 * @param index Index of auth key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveKeyByIndexTx(
    ontid: string,
    newPk: PublicKey,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKeyByIndex;

    if (ontid.substr(0, 3) === 'did') {
        ontid = str2hexstr(ontid);
    }

    const p1 = ontid;
    const p2 = newPk.serializeHex();
    const struct = new Struct();
    struct.add(p1, p2, index);
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
 * @param index Index of new recovery
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildSetRecoveryTx(
    ontid: string,
    newRecovery: Group,
    index: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.setRecovery;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), newRecovery.serialize(), index);
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
 * @param recovery recovery New recovery to add
 * @param signers Signers of old recovery
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildUpdateRecoveryTx(
    ontid: string,
    recovery: Group,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.updateRecovery;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), recovery.serialize(), serializeSigners(signers));

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
 * @param signers Signers of recovery
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
 * @param pubkeyIndex Index of pk to remove
 * @param signers Signers of recovery
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
 * remove public key of ONT ID by multi controllers.
 *
 * @param ontid User's ONT ID
 * @param pubkeyIndex Index of pubkey to be removed
 * @param signers Controllers' signers
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveKeyByMultiControllerTx(
    ontid: string,
    pubkeyIndex: number,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeKeyByController;

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
 * @param Pk(auth key) of ONT ID.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemovePubKeyTx(
    ontid: string,
    pk2Remove: PublicKey,
    pk: PublicKey,
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
    const p3 = pk.serializeHex();
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
 * @param pubkey If isNewPublicKey set false, this is the new public key to set as auth key
 * @param controller ONT ID of the new auth key
 * @param signIndex Index of signer's pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddNewAuthKeyTx(
    ontid: string,
    pubkey: PublicKey,
    controller: string,
    signIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addNewAuthKey;
    const struct1 = new Struct();
    struct1.add(pubkey.serializeHex(), str2hexstr(controller));
    const struct = new Struct();
    struct.add(str2hexstr(ontid), struct1, signIndex);

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
 * @param index Index of the auth key to remove
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
 * Add new auth key to ONT ID by recovery
 *
 *
 * @param ontid User's ONT ID
 * @param pubkey Pk to add as new auth key
 * @param controller ONT ID of the new auth key
 * @param signers Signers of recovery
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddNewAuthKeyByRecoveryTx(
    ontid: string,
    pubkey: PublicKey,
    controller: string,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addNewAuthKeyByRecovery;
    const struct1 = new Struct();
    struct1.add(pubkey.serializeHex(), str2hexstr(controller));
    const struct = new Struct();
    struct.add(str2hexstr(ontid), struct1, serializeSigners(signers));

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
 * remove auth key of ONT ID by recovery
 *
 *
 * @param ontid User's ONT ID
 * @param index Index of auth key to remove
 * @param signers Signers of recovery
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveAuthKeyByRecoveryTx(
    ontid: string,
    index: number,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAuthKeyByRecovery;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index, serializeSigners(signers));

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
 * Add new auth key to ONT ID by controller
 *
 *
 * @param ontid User's ONT ID
 * @param pubkey Pk to add as new auth key
 * @param controller ONT ID of the new auth key
 * @param signers Signers of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddNewAuthKeyByControllerTx(
    ontid: string,
    pubkey: PublicKey,
    controller: string,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addNewAuthKeyByController;
    const struct1 = new Struct();
    struct1.add(pubkey.serializeHex(), str2hexstr(controller));
    const struct = new Struct();
    struct.add(str2hexstr(ontid), struct1, serializeSigners(signers));

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
 * remove auth key of ONT ID by controller
 *
 *
 * @param ontid User's ONT ID
 * @param index Index of auth key to remove
 * @param signers Signers of controller
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveAuthKeyByControllerTx(
    ontid: string,
    index: number,
    signers: Signer[],
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeAuthKeyByController;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), index, serializeSigners(signers));

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
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddServiceTx(
    ontid: string,
    serviceId: string,
    type: string,
    serviceEndpoint: string,
    pkIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), str2hexstr(type), str2hexstr(serviceEndpoint), pkIndex);

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
 * @param pkIndex Index of signer's pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildUpdateServiceTx(
    ontid: string,
    serviceId: string,
    type: string,
    serviceEndpoint: string,
    pkIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.updateService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), str2hexstr(type), str2hexstr(serviceEndpoint), pkIndex);

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
 * @param pkIndex Index of signer's pubkey
 * @param gasLimit Gas limit
 * @param gasPrice Gas price
 * @param payer Payer. Optional.
 */
export function buildRemoveServiceTx(
    ontid: string,
    serviceId: string,
    pkIndex: number,
    gasPrice: string,
    gasLimit: string,

    payer?: Address
): Transaction {
    const method = ONTID_METHOD.removeService;
    const struct = new Struct();
    struct.add(str2hexstr(ontid), str2hexstr(serviceId), pkIndex);

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
 * @param context Context to add
 * @param pkIndex Index of pk
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildAddContextTx(
    ontid: string,
    context: string[],
    pkIndex: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addContext;
    const struct = new Struct();
    const contexts = context.map((item: string) => str2hexstr(item));
    struct.add(str2hexstr(ontid));
    struct.add(contexts.length);
    contexts.forEach((item: string) => struct.add(item));
    struct.add(pkIndex);

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
 * @param context Context to remove
 * @param pkIndex Index of signer's pubkey
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer. Optional.
 */
export function buildRemoveContextTx(
    ontid: string,
    context: string[],
    pkIndex: number,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = ONTID_METHOD.addContext;
    const struct = new Struct();
    const contexts = context.map((item: string) => str2hexstr(item));
    struct.add(str2hexstr(ontid));
    struct.add(contexts.length);
    contexts.forEach((item: string) => struct.add(item));
    struct.add(pkIndex);

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
 * Verify multi controller
 *
 *
 * @param ontid User's ONT ID
 * @param signers Signers of multi controllers
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

export interface DocumentPubKey {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
}
export interface Document {
    '@context': [string];
    id: string;
    publicKey: [DocumentPubKey];
    authentication: [string];
    controller: string | null;
    recovery: string | null;
    service: [any];
    attribute: [DDOAttribute] | null;
    created: number;
    updated: number;
    proof: string;
}
export async function getDocumentJson(ontid: string, restNode: string): Promise<Document> {
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
    const restClient = new RestClient(restNode);
    const res = await restClient.sendRawTransaction(tx.serialize(), true);
    const str = hexstr2str(res.Result.Result);
    const obj: Document = JSON.parse(str);
    return obj;
}
