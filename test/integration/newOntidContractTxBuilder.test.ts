import * as b64 from 'base64-url';
import { RestClient } from '../../src';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import Group from '../../src/smartcontract/nativevm/ontid/group';
import * as NewOntidTxBuilder from '../../src/smartcontract/nativevm/ontidContractTxBuilder';
import { signTransaction } from '../../src/transaction/transactionBuilder';
import { hexstr2str } from '../../src/utils';
import { Address } from '../../src/crypto/address';
import { PrivateKey } from '../../src/crypto/PrivateKey';
import { Identity } from '../../src/identity';
import { Signer } from '../../src/smartcontract/nativevm/ontid/signer';
import { DDOAttribute } from '../../src/transaction/ddo';
import { addSign } from '../../src/transaction/transactionBuilder';
import {TEST_ONT_URL_1, TEST_ONT_URL_2} from "../../src/consts";

// tslint:disable:no-console
// tslint:disable:max-line-length
describe('test new ONT ID contract', () => {

    const gasPrice = '2500';
    const gasLimit = '20000';
    const socketClient = new WebsocketClient(TEST_ONT_URL_2.SOCKET_URL);
    const restClient = new RestClient('http://192.168.1.175:20334');  // TODO extract to const-config file
    const privateKey1 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
    const pk1 = privateKey1.getPublicKey();
    const address1 = Address.fromPubKey(pk1);
    const did1 = 'did:ont:' + address1.toBase58();
    console.log('did1: ' + did1); // did:ont:ALaRqCkXSWaHMDc5sLEEMVMWqCNDFi5eRZ

    const pri2 = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
    const pk2 = pri2.getPublicKey();
    const address2 = Address.fromPubKey(pk2);
    const did2 = 'did:ont:AU9TioM24rXk5E3tUGrv8jwgBA1aZVVKDW';
    console.log('address2: ' + address2.toBase58());

    const pri3 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const pk3 = pri3.getPublicKey();
    const address3 = Address.fromPubKey(pk3);
    const did3 = 'did:ont:AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz';
    console.log('address3: ' + address3.toBase58());

    const pri4 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b98');
    const pk4 = pri4.getPublicKey();
    const did4 = Address.generateOntid(pk4); // did:ont:AJym8dF7wZLjtoiY8C3mmYt8f2tZDxq5iz
    const address4 = Address.fromPubKey(pk4);
    console.log('address4: ' + address4.toBase58());

    const pri5 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b99');
    const pub5 = pri5.getPublicKey();
    const address5 = Address.fromPubKey(pub5);
    const did5 = 'did:ont:' + address5.toBase58();
    console.log('address5: ' + address5.toBase58()); // AH9B261xeBXdKH4jPyafcHcLkS2EKETbUj

    // const pri6 = PrivateKey.random();
    const pri6 = new PrivateKey('b1974f2ce546b0835291deea0bfdc6c288a324d13a863bb5e37bf79df40245bc');
    // console.log('pri6: ' + pri6.key);
    const pk6 = pri6.getPublicKey();
    const address6 = Address.fromPubKey(pk6);
    const did6 = 'did:ont:' + address6.toBase58();
    console.log('did6: ' + did6);
    test('buildRegIDWithPublicKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(did1, pk1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('getKeystore', async () => {
        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        const scrypt = {
            n: 4096,
            p: 8,
            r: 8,
            dkLen: 64
        };
        const identity = Identity.create(pri, '123456', 'frotest');
        const obj = identity.toJsonObj();
        const keystore = {
            type : 'I',
            label : identity.label,
            algorithm : 'ECDSA',
            scrypt,
            key : obj.controls[0].key,
            salt: obj.controls[0].salt,
            address: obj.controls[0].address,
            parameters : {
                curve : 'secp256r1'
            }
        };
        console.log(keystore);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, '500', gasLimit, address1);
        signTransaction(idTx, pri);
        addSign(idTx, privateKey1);
        const socket = new WebsocketClient();
        const idRes = await socket.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);
    });

    test('buildRegIdWithControllerTx', async () => {
        const controllers = new Group([did1], 1);
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildRegIdWithMultiControllerTx(did2, controllers, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        addSign(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildGetControllerTx', async () => {
        const tx = NewOntidTxBuilder.buildGetControllerTx(did3);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const controller = hexstr2str(res.Result.Result);
        console.log('controller: ', controller);
        if (controller.indexOf('members') > -1) { // multi controllers
            const obj = JSON.parse(controller);
            obj.members = obj.members.map((item: string) => (b64.decode(item, 'utf-8')));
            console.log(JSON.stringify(obj));
        }
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRegIdWithMultiControllerTx', async () => {
        const controllers = new Group([did1], 1);
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildRegIdWithMultiControllerTx(did3, controllers, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2); // payer's signature
        addSign(tx, privateKey1); // controllers' signatures
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildMakeRevokeIdTx', async () => {
        const tx = NewOntidTxBuilder.buildMakeRevokeIdTx(did1, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call get document
    }, 100000);

    test('buildRevokeIdByMultiController', async () => {
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildRevokeIdByMultiController(did1, signers, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveControllerTx', async () => {
        const tx = NewOntidTxBuilder.buildRemoveControllerTx(did1, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call getController
    }, 100000);

    test('buildRegIdWithAttributesTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello';
        attr.type = 'string';
        attr.value = 'world';
        const tx = NewOntidTxBuilder.buildRegIdWithAttributesTx(did4, [attr], pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributeTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello2';
        attr.type = 'string';
        attr.value = 'world2';
        const tx = NewOntidTxBuilder.buildAddAttributeTx(did4, [attr], pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveAttributeTx', async () => {
        const key = 'hello2';
        const tx = NewOntidTxBuilder.buildRemoveAttributeTx(did4, key, pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildGetAttributesTx', async () => {
        const tx = NewOntidTxBuilder.buildGetAttributesTx(did4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributesByControllerTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello3';
        attr.type = 'string';
        attr.value = 'world3';
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildAddAttributesByMultiControllerTx(did2, [attr], signers, gasPrice, gasLimit, address2);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveAttributesByControllerTx', async () => {
        const key = 'hello3';
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildRemoveAttributesByMultiControllerTx(did2, key, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        addSign(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributesByIndexTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello5';
        attr.type = 'string';
        attr.value = 'world5';
        const tx = NewOntidTxBuilder.buildAddAttributesByIndexTx(did1, [attr], 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveAttributesByIndexTx', async () => {
        const key = 'hello5';
        const tx = NewOntidTxBuilder.buildRemoveAttributesByIndexTx(did1, key, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddPubKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildAddPubKeyTx(did1, pk2, pk1, did2, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        addSign(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);
    test('buildRemovePubKeyTx', async () => {
        const tx = NewOntidTxBuilder.buildRemovePubKeyTx(did1, pk2, pk1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddKeyByMultiControllerTx', async () => {
        const priTemp = PrivateKey.random();
        const pkTemp = priTemp.getPublicKey();
        const addrTemp = Address.fromPubKey(pkTemp);
        const controllerTemp = 'did:ont:' + addrTemp.toBase58();
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildAddKeyByMultiControllerTx(did3, pkTemp, signers, controllerTemp, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveKeyByMultiControllerTx', async () => {
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildRemoveKeyByMultiControllerTx(did3, 1, signers, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildSetRecoveryTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);

        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, addr);
        signTransaction(idTx, pri);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);

        const recovery = new Group([did1], 1);
        const tx = NewOntidTxBuilder.buildSetRecoveryTx(ontid, recovery, 1, gasPrice, gasLimit, addr);
        signTransaction(tx, pri);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const pkTemp = PrivateKey.random().getPublicKey();
        const signers = [new Signer(did1, 1)];
        const tx2 = NewOntidTxBuilder.buildAddKeyByRecoveryTx(ontid, pkTemp, signers, gasPrice, gasLimit, addr);
        signTransaction(tx2, pri);
        addSign(tx2, privateKey1);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        const tx3 = NewOntidTxBuilder.buildRemoveKeyByRecoveryTx(ontid, 2, signers, gasPrice, gasLimit, addr);
        signTransaction(tx3, pri);
        addSign(tx3, privateKey1);
        const res3 = await socketClientNotAutoClose.sendRawTransaction(tx3.serialize(), false, true);
        console.log(res3);
        expect(res3.Error).toEqual(0);

        socketClientNotAutoClose.close();
    }, 100000);

    test('buildAddKeyByIndex', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);

        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, addr);
        signTransaction(idTx, pri);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);

        const tx1 = NewOntidTxBuilder.buildAddKeyByIndexTx(did1, pk, 1, gasPrice, gasLimit, address1);
        signTransaction(tx1, privateKey1);
        const res1 = await socketClientNotAutoClose.sendRawTransaction(tx1.serialize(), false, true);
        console.log(res1);
        expect(res1.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildRemoveKeyByIndexTx(did1, pk, 1, gasPrice, gasLimit, address1);
        signTransaction(tx2, privateKey1);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        socketClientNotAutoClose.close();

    }, 100000);

    test('buildUpdateRecoveryTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);
        const priTemp = PrivateKey.random();
        const pkTemp = priTemp.getPublicKey();
        const addressTemp = Address.fromPubKey(pkTemp);
        const didTemp = 'did:ont:' + addressTemp.toBase58();
        const tx0 = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(didTemp, pkTemp, gasPrice, gasLimit, addressTemp);
        signTransaction(tx0, priTemp);
        const res0 = await socketClientNotAutoClose.sendRawTransaction(tx0.serialize(), false, true);
        console.log(res0);

        const recovery = new Group([didTemp], 1);
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildUpdateRecoveryTx(did6, recovery, signers, gasPrice, gasLimit, address6);
        signTransaction(tx, pri6);
        addSign(tx, privateKey1);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        socketClientNotAutoClose.close();
    }, 100000);

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
    }, 100000);

    test('buildGetPublicKeysTx', async () => {
        const tx = NewOntidTxBuilder.buildGetPublicKeysTx(did6);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const obj = hexstr2str(res.Result.Result);
        console.log(obj);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildGetPublicKeyStateTx', async () => {
        const tx = NewOntidTxBuilder.buildGetPublicKeyStateTx(did6, 1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        const obj = hexstr2str(res.Result.Result);
        console.log(obj);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAuthKeyTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);
        const tx = NewOntidTxBuilder.buildAddNewAuthKeyTx(did1, pk2, did2, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyTx(did1, 2, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res2 = await socketClient.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
    }, 100000);

    test('buildAddNewAuthKeyByRecoveryTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);

        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const idTx = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontid, pk, gasPrice, gasLimit, addr);
        signTransaction(idTx, pri);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);
        // expect(idRes.Error).toEqual(0);

        const recovery = new Group([did1], 1);
        // must be with auth key access to set recovery
        const tx0 = NewOntidTxBuilder.buildSetRecoveryTx(ontid, recovery, 1, gasPrice, gasLimit, addr);
        signTransaction(tx0, pri);
        const res0 = await socketClientNotAutoClose.sendRawTransaction(tx0.serialize(), false, true);
        console.log(res0);
        expect(res0.Error).toEqual(0);

        const priAuth = PrivateKey.random();
        const pkAuth = priAuth.getPublicKey();
        const addrAuth = Address.fromPubKey(pkAuth);
        const ontidAuth = 'did:ont:' + addrAuth.toBase58();
        const idTx2 = NewOntidTxBuilder.buildRegIDWithPublicKeyTx(ontidAuth, pkAuth, gasPrice, gasLimit, addrAuth);
        signTransaction(idTx2, priAuth);
        const idRes2 = await socketClientNotAutoClose.sendRawTransaction(idTx2.serialize(), false, true);
        console.log(idRes2);

        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildAddNewAuthKeyByRecoveryTx(ontid, pkAuth, ontidAuth, signers, gasPrice, gasLimit, addr);
        signTransaction(tx, privateKey1);
        addSign(tx, pri);
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
        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyByRecoveryTx(ontid, authLen, signers, gasPrice, gasLimit, addr);
        signTransaction(tx2, privateKey1);
        addSign(tx2, pri);

        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
        socketClientNotAutoClose.close();
    }, 100000);

    test('buildAddNewAuthKeyByControllerTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);

        const pri = PrivateKey.random();
        console.log('pri: ' + pri.key);
        const pk = pri.getPublicKey();
        const addr = Address.fromPubKey(pk);
        const ontid = 'did:ont:' + addr.toBase58();
        console.log('ontid: ' + ontid);
        const controllers = new Group([did6], 1);
        const signers = [new Signer(did6, 1)];
        const idTx = NewOntidTxBuilder.buildRegIdWithMultiControllerTx(ontid, controllers, signers, gasPrice, gasLimit, addr);
        signTransaction(idTx, pri);
        addSign(idTx, pri6);
        const idRes = await socketClientNotAutoClose.sendRawTransaction(idTx.serialize(), false, true);
        console.log(idRes);
        // expect(idRes.Error).toEqual(0);

        const tx = NewOntidTxBuilder.buildAddNewAuthKeyByControllerTx(ontid, pk1, did1, signers, gasPrice, gasLimit, address6);
        signTransaction(tx, pri6);
        addSign(tx, privateKey1);
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

        const tx2 = NewOntidTxBuilder.buildRemoveAuthKeyByControllerTx(ontid, authLen, signers, gasPrice, gasLimit, address6);
        signTransaction(tx2, pri6);
        addSign(tx2, privateKey1);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);
        socketClientNotAutoClose.close();
    }, 100000);

    test('buildAddServiceTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);

        const tx = NewOntidTxBuilder.buildAddServiceTx(did1, 'test_service', 'test_type', 'http://test.com', 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        // expect(res.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildUpdateServiceTx(did1, 'test_service', 'test_type2', 'http://test2.com', 1, gasPrice, gasLimit, address1);
        signTransaction(tx2, privateKey1);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res2.Error).toEqual(0);

        const tx4 = NewOntidTxBuilder.buildGetServiceTx(did1, 'test_service');
        const res4 = await socketClientNotAutoClose.sendRawTransaction(tx4.serialize(), true);
        console.log(res4);
        expect(res4.Error).toEqual(0);

        const tx3 = NewOntidTxBuilder.buildRemoveServiceTx(did1, 'test_service', 1, gasPrice, gasLimit, address1);
        signTransaction(tx3, privateKey1);
        const res3 = await socketClientNotAutoClose.sendRawTransaction(tx3.serialize(), false, true);
        console.log(res3);
        expect(res3.Error).toEqual(0);

        socketClientNotAutoClose.close();

    }, 100000);

    test('contenxtTx', async () => {
        // TODO extract socket url to const-config file
        const socketClientNotAutoClose = new WebsocketClient('ws://192.168.1.175:20335', false, false);
        const context = ['context_test'];
        const tx = NewOntidTxBuilder.buildAddContextTx(did1, context, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClientNotAutoClose.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);

        const tx2 = NewOntidTxBuilder.buildRemoveContextTx(did1, context, 1, gasPrice, gasLimit, address1);
        signTransaction(tx2, privateKey1);
        const res2 = await socketClientNotAutoClose.sendRawTransaction(tx2.serialize(), false, true);
        console.log(res2);
        expect(res.Error).toEqual(0);
        socketClientNotAutoClose.close();

    }, 100000);

    test('buildVerifySignatureTx', async () => {
        const tx = NewOntidTxBuilder.buildVerifySignatureTx(did1, 1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildVerifyMultiControllerTx', async () => {
        const signers = [new Signer(did1, 1)];
        const tx = NewOntidTxBuilder.buildVerifyMultiControllerTx(did3, signers);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

});
