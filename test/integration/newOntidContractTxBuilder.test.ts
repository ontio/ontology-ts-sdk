import * as b64 from 'base64-url';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import Group from '../../src/smartcontract/nativevm/ontid/group';
import * as NewOntidTxBuilder from '../../src/smartcontract/nativevm/ontidContractTxBuilder';
import { signTransaction } from '../../src/transaction/transactionBuilder';
import { hexstr2str } from '../../src/utils';
import { Address } from '../../src/crypto/address';
import { PrivateKey } from '../../src/crypto/PrivateKey';
import { Signer } from '../../src/smartcontract/nativevm/ontid/signer';
import { DDOAttribute } from '../../src/transaction/ddo';
import { addSign } from '../../src/transaction/transactionBuilder';
import { TEST_ONT_URL_2 } from '../../src/consts';
import { RestClient } from '../../src';

// tslint:disable:no-console
// tslint:disable:max-line-length
describe('test new ONT ID contract', () => {

    const gasPrice = '2500';
    const gasLimit = '20000';
    const socketClient = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL);
    const restClient = new RestClient(TEST_ONT_URL_2.REST_URL);
    const privateKey1 = PrivateKey.random();
    const pk1 = privateKey1.getPublicKey();
    const address1 = Address.fromPubKey(pk1);
    const did1 = 'did:ont:' + address1.toBase58();
    console.log('did1: ' + did1);

    const pri2 = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
    const pk2 = pri2.getPublicKey();
    const address2 = Address.fromPubKey(pk2);
    const did2 = 'did:ont:AU9TioM24rXk5E3tUGrv8jwgBA1aZVVKDW';
    console.log('address2: ' + address2.toBase58());

    const pri3 = PrivateKey.random();
    const pk3 = pri3.getPublicKey();
    const address3 = Address.fromPubKey(pk3);
    const did3 = 'did:ont:' + address3.toBase58();
    console.log('address3: ' + address3.toBase58());

    const pri4 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b98');
    const pk4 = pri4.getPublicKey();
    const did4 = 'did:ont:AJym8dF7wZLjtoiY8C3mmYt8f2tZDxq5iz';
    const address4 = Address.fromPubKey(pk4);
    console.log('address4: ' + address4.toBase58());

    const pri5 = PrivateKey.random();
    const pk5 = pri5.getPublicKey();
    const address5 = Address.fromPubKey(pk5);
    const did5 = 'did:ont:' + address5.toBase58();
    console.log('did5: ' + did5);
    console.log('pk5: ' + pk5.serializeHex());

    async function waitForConditionInDidDocument(
        did: string,
        condition: (didDocument: NewOntidTxBuilder.Document) => boolean): Promise<boolean> {
        let numberOfAttempts = 0;
        let result = false;
        while (numberOfAttempts < 10) {
            await wait(1000);
            const didDocument = await NewOntidTxBuilder.getDocumentJson(did, TEST_ONT_URL_2.REST_URL);
            if (condition(didDocument)) {
                result = true;
                break;
            }
            numberOfAttempts++;
            console.log('condition not met, waiting and trying again');
            console.log(didDocument);
        }
        return result;
    }

    async function wait(ms: number) {
        return new Promise((resolve, _) => {
            setTimeout(() => {
                resolve(ms);
            }, ms);
        });
    }

    beforeAll(async () => {
        jest.setTimeout(20000);
    });

    test('buildRegIDWithPublicKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(did1, pk1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildRegIdWithMultiControllerTx', async () => {
        const controllers = new Group([did2, did4], 1);
        const signers = [new Signer(did2, 1), new Signer(did4, 1)];
        const tx = NewOntidTxBuilder.buildRegIdWithMultiControllerTx(did3, controllers, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        addSign(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(res));
        expect(res.Error).toEqual(0);
    });

    test('buildGetControllerTx', async () => {
        const tx = NewOntidTxBuilder.buildGetControllerTx(did3);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const controller = hexstr2str(res.Result.Result);
        console.log('controller: ', controller);
        if (controller.indexOf('members') > -1) { // multi controllers
            const obj = JSON.parse(controller);
            obj.members = obj.members.map((item: string) => (b64.decode(item, 'utf-8')));
            console.log(JSON.stringify(obj));
        }
        expect(res.Error).toEqual(0);
    });

    // TODO unclear how this can work since it has to be called by owner of the DID, which does not exist
    xtest('buildRemoveControllerTx', async () => {
        const tx = NewOntidTxBuilder.buildRemoveControllerTx(did3, 2, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call getController
    });

    test('buildRegIdWithAttributesTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello';
        attr.type = 'string';
        attr.value = 'world';
        const tx = NewOntidTxBuilder.buildRegIdWithAttributesTx(did5, [attr], pk5, gasPrice, gasLimit, address4);
        signTransaction(tx, pri5);
        addSign(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildAddAttributeTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello2';
        attr.type = 'string';
        attr.value = 'world2';
        const tx = NewOntidTxBuilder.buildAddAttributeTx(did4, [attr], pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
        const attributeInDocument = await waitForConditionInDidDocument(did4,
            (document) => !!document.attribute && document.attribute.some((a) => a.key === did4 + '#hello2'));
        expect(attributeInDocument).toBeTruthy();
    });

    test('buildRemoveAttributeTx', async () => {
        const key = 'hello2';
        const tx = NewOntidTxBuilder.buildRemoveAttributeTx(did4, key, pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildGetAttributesTx', async () => {
        const tx = NewOntidTxBuilder.buildGetAttributesTx(did4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildAddAttributesByControllerTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello3';
        attr.type = 'string';
        attr.value = 'world3';
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildAddAttributesByMultiControllerTx(did3, [attr], signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildRemoveAttributeByControllerTx', async () => {
        const key = 'hello3';
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildRemoveAttributeByMultiControllerTx(did3, key, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildAddAttributesByIndexTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello5';
        attr.type = 'string';
        attr.value = 'world5';
        const tx = NewOntidTxBuilder.buildAddAttributesByIndexTx(did4, [attr], 1, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
        const getTx = NewOntidTxBuilder.buildGetAttributesTx(did4);
        const getRes = await restClient.sendRawTransaction(getTx.serialize(), true);
        console.log(getRes);
    });

    test('buildRemoveAttributeByIndexTx', async () => {
        const key = 'hello5';
        const tx = NewOntidTxBuilder.buildRemoveAttributeByIndexTx(did4, key, 1, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildAddPubKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildAddPubKeyTx(did1, pk2, pk1, did2, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildRemovePubKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildRemovePubKeyTx(did1, pk2, pk1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildAddKeyByMultiControllerTx', async () => {
        const priTemp = PrivateKey.random();
        const pkTemp = priTemp.getPublicKey();
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildAddKeyByMultiControllerTx(did3, pkTemp, signers, '', gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
        const publicKeyInDocument = await waitForConditionInDidDocument(did3,
            (document) => document.publicKey.some((pk) => pk.publicKeyHex === pkTemp.serializeHex()));
        expect(publicKeyInDocument).toBeTruthy();
    });

    test('buildRemoveKeyByMultiControllerTx', async () => {
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildRemoveKeyByMultiControllerTx(did3, 1, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildSetRecoveryTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, address2);
        signTransaction(idTx, pri);
        addSign(idTx, pri2);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);

        const recovery = new Group([did1], 1);
        const tx = NewOntidTxBuilder.buildSetRecoveryTx(ontid, recovery, 1, gasPrice, gasLimit, address2);
        signTransaction(tx, pri);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const pkTemp = PrivateKey.random().getPublicKey();
        const signers = [new Signer(did1, 1)];
        const tx2 = NewOntidTxBuilder.buildAddKeyByRecoveryTx(ontid, pkTemp, signers, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        const tx3 = NewOntidTxBuilder.buildRemoveKeyByRecoveryTx(ontid, 2, signers, gasPrice, gasLimit, address2);
        signTransaction(tx3, pri);
        addSign(tx3, privateKey1);
        addSign(tx3, pri2);
        const res3 = await socketClientNotAutoClose.sendRawTransaction(tx3.serialize(), false, true);
        console.log(res3);
        expect(res3.Error).toEqual(0);

        socketClientNotAutoClose.close();
    });

    test('buildAddKeyByIndex', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, address2);
        signTransaction(idTx, pri);
        addSign(idTx, pri2);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);

        const tx1 = NewOntidTxBuilder.buildAddKeyByIndexTx(did1, pk, 1, gasPrice, gasLimit, address2);
        signTransaction(tx1, privateKey1);
        addSign(tx1, pri2);
        const res1 = await socketClientNotAutoClose.sendRawTransaction(tx1.serialize(), false, true);
        console.log(res1);
        expect(res1.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildRemoveKeyByIndexTx(did1, pk, 1, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        socketClientNotAutoClose.close();

    });

    test('buildUpdateRecoveryTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const initialRecovery = new Group([did2], 1);
        const tx0 = NewOntidTxBuilder.buildSetRecoveryTx(did1, initialRecovery, 1, gasPrice, gasLimit, address2);
        signTransaction(tx0, privateKey1);
        addSign(tx0, pri2);
        const res0 = await socketClientNotAutoClose.sendRawTransaction(tx0.serialize(), false, true);
        console.log(res0);

        const updatedRecovery = new Group([did4], 1);
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildUpdateRecoveryTx(did1, updatedRecovery, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        addSign(tx, pri4);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        socketClientNotAutoClose.close();
    });

    test('buildGetDocumentTx', async () => {
        // const tx = NewOntidTxBuilder.buildGetDocumentTx(did1);
        // const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        // console.log(res);
        // const obj = hexstr2str(res.Result.Result);
        // console.log(obj);
        // expect(res.Error).toEqual(0);
        const ontid = 'did:ont:AN3iwgee5JKzZV99gknpdmQf5XUJJbQ7xQ';
        const doc = await NewOntidTxBuilder.getDocumentJson(ontid, 'http://polaris1.ont.io:20334');
        console.log(doc);
    });

    test('buildGetPublicKeysTx', async () => {
        const tx = NewOntidTxBuilder.buildGetPublicKeysTx(did5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const obj = hexstr2str(res.Result.Result);
        console.log(obj);
        expect(res.Error).toEqual(0);
    });

    test('buildGetPublicKeyStateTx', async () => {
        const tx = NewOntidTxBuilder.buildGetPublicKeyStateTx(did5, 1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const obj = hexstr2str(res.Result.Result);
        console.log(obj);
        expect(res.Error).toEqual(0);
    });

    test('buildAddAuthKeyTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const tx = NewOntidTxBuilder.buildAddNewAuthKeyTx(did1, pk4, did4, 1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const authKeyInDocument = await waitForConditionInDidDocument(did1,
            (document) => document.authentication.some((auth: any) => {
                return typeof auth === 'object' && auth.publicKeyHex === pk4.serializeHex();
            }));
        expect(authKeyInDocument).toBeTruthy();

        // key has index 4 due to previous adds and removals
        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyTx(did1, 4, 1, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
    });

    test('buildAddNewAuthKeyByRecoveryTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, address2);
        signTransaction(idTx, pri);
        addSign(idTx, pri2);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);
        expect(idRes.Error).toEqual(0);

        const recovery = new Group([did1], 1);
        // must be with auth key access to set recovery
        const tx0 = NewOntidTxBuilder.buildSetRecoveryTx(ontid, recovery, 1, gasPrice, gasLimit, address2);
        signTransaction(tx0, pri);
        addSign(tx0, pri2);
        const res0 = await socketClientNotAutoClose.sendRawTransaction(tx0.serialize(), false, true);
        console.log(res0);
        expect(res0.Error).toEqual(0);

        const priAuth = PrivateKey.random();
        const pkAuth = priAuth.getPublicKey();
        const addrAuth = Address.fromPubKey(pkAuth);
        const ontidAuth = 'did:ont:' + addrAuth.toBase58();
        const idTx2 = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontidAuth, pkAuth, gasPrice, gasLimit, address2);
        signTransaction(idTx2, priAuth);
        addSign(idTx2, pri2);
        const idRes2 = await socketClientNotAutoClose.sendRawTransaction(idTx2.serialize(), false, true);
        console.log(idRes2);

        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildAddNewAuthKeyByRecoveryTx(ontid, pkAuth, ontidAuth, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const txDoc = NewOntidTxBuilder.buildGetDocumentTx(ontid);
        const resDoc = await socketClient.sendRawTransaction(txDoc.serialize(), true);
        console.log(resDoc);
        const obj = hexstr2str(resDoc.Result.Result);
        console.log(obj);
        const authLen = JSON.parse(obj).authentication.length;
        console.log('authLen: ' + authLen);
        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyByRecoveryTx(ontid, authLen, signers, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);

        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
        socketClientNotAutoClose.close();
    });

    test('buildAddNewAuthKeyByControllerTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const controllers = new Group([did4], 1);
        const signers = [new Signer(did4, 1)];
        const idTx = NewOntidTxBuilder.buildRegIdWithMultiControllerTx(ontid, controllers, signers, gasPrice, gasLimit, address2);
        signTransaction(idTx, pri4);
        addSign(idTx, pri2);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);
        expect(idRes.Error).toEqual(0);

        const tx = NewOntidTxBuilder.buildAddNewAuthKeyByControllerTx(ontid, pk1, did1, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri4);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const txDoc = NewOntidTxBuilder.buildGetDocumentTx(ontid);
        const resDoc = await socketClient.sendRawTransaction(txDoc.serialize(), true);
        console.log(resDoc);
        const obj = hexstr2str(resDoc.Result.Result);
        console.log(obj);
        const authLen = JSON.parse(obj).authentication.length;
        console.log(authLen);

        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyByControllerTx(ontid, authLen, signers, gasPrice, gasLimit, address2);
        signTransaction(tx2, pri4);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
        socketClientNotAutoClose.close();
    });

    test('buildAddServiceTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const tx = NewOntidTxBuilder.buildAddServiceTx(did1, 'test_service', 'test_type', 'http://test.com', 1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildUpdateServiceTx(did1, 'test_service', 'test_type2', 'http://test2.com', 1, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        const tx4 = NewOntidTxBuilder.buildGetServiceTx(did1, 'test_service');
        const res4 = await socketClientNotAutoClose.sendRawTransaction(tx4.serialize(), true);
        console.log(res4);
        expect(res4.Error).toEqual(0);

        const tx3 = NewOntidTxBuilder.buildRemoveServiceTx(did1, 'test_service', 1, gasPrice, gasLimit, address2);
        signTransaction(tx3, privateKey1);
        addSign(tx3, pri2);
        const res3 = await socketClientNotAutoClose.sendRawTransaction(tx3.serialize(), false, true);
        console.log(res3);
        expect(res3.Error).toEqual(0);

        socketClientNotAutoClose.close();

    });

    test('contextTx', async () => {
        const socketClientNotAutoClose = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL, false, false);
        const context = ['context_test'];
        const tx = NewOntidTxBuilder.buildAddContextTx(did1, context, 1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildRemoveContextTx(did1, context, 1, gasPrice, gasLimit, address2);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri2);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res.Error).toEqual(0);
        socketClientNotAutoClose.close();

    });

    test('buildVerifySignatureTx', async () => {
        const tx = NewOntidTxBuilder.buildVerifySignatureTx(did1, 1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildVerifyMultiControllerTx', async () => {
        const signers = [new Signer(did2, 1), new Signer(did4, 1)];
        const tx = NewOntidTxBuilder.buildVerifyMultiControllerTx(did3, signers);
        signTransaction(tx, pri2);
        addSign(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

    test('buildMakeRevokeIdTx', async () => {
        const tx = NewOntidTxBuilder.buildMakeRevokeIdTx(did1, 1, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call get document
    });

    test('buildRevokeIdByMultiController', async () => {
        const signers = [new Signer(did2, 1)];
        const tx = NewOntidTxBuilder.buildRevokeIdByMultiController(did3, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
        expect(res.Error).toEqual(0);
    });

});
