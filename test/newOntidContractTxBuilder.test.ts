import { DDOAttribute } from './../src/transaction/ddo';
import { Signer } from './../src/smartcontract/nativevm/ontid/signer';
import { addSign } from './../src/transaction/transactionBuilder';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildAddAttributesBySingleControllerTx, buildAddAttributesByMultiControllerTx,
    buildGetAttributesTx, buildRemoveAttributeTx, buildAddAttributeTx, buildRegIdWithAttributesTx, buildRemoveControllerTx, buildRevokeIdByMultiController, buildRevokeIdBySingleController, buildRegIDWithPublicKeyTx, buildRegIdWithSingleControllerTx, buildRegIdWithMultiControllerTx, buildMakeRevokeIdTx
} from '../src/smartcontract/nativevm/newOntidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';
import { Address } from './../src/crypto/address';
import { PrivateKey } from './../src/crypto/PrivateKey';
import Group from '../src/smartcontract/nativevm/ontid/group';

// tslint:disable:no-console
describe('test new ONT ID contract', () => {

    const gasPrice = '0';
    const gasLimit = '20000';
    const socketClient = new WebsocketClient('ws://192.168.1.175:20335');
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
    const did5 = Address.generateOntid(pub5);
    const address5 = Address.fromPubKey(pub5);
    console.log('address5: ' + address5.toBase58()); // AH9B261xeBXdKH4jPyafcHcLkS2EKETbUj
    test('buildRegIDWithPublicKeyTx', async () => {
        const tx = buildRegIDWithPublicKeyTx(did1, pk1, gasPrice, gasLimit, 'all', address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRegIdWithSingleControllerTx', async () => {
        const tx = buildRegIdWithSingleControllerTx(did2, did1, 1, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2);
        addSign(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRegIdWithMultiControllerTx', async () => {
        const controllers = new Group([did1], 1);
        const signers = [new Signer(did1, 1)];
        const tx = buildRegIdWithMultiControllerTx(did3, controllers, signers, gasPrice, gasLimit, address2);
        signTransaction(tx, pri2); // payer's signature
        addSign(tx, privateKey1); // controllers' signatures
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildMakeRevokeIdTx', async () => {
        const tx = buildMakeRevokeIdTx(did1, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call get document
    }, 100000);

    test('buildRevokeIdBySingleController', async () => {
        const tx = buildRevokeIdBySingleController(did1, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRevokeIdByMultiController', async () => {
        const signers = [new Signer(did1, 1)];
        const tx = buildRevokeIdByMultiController(did1, signers, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveControllerTx', async () => {
        const tx = buildRemoveControllerTx(did1, 1, gasPrice, gasLimit, address1);
        signTransaction(tx, privateKey1);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
        // TODO call getController
    }, 100000);

    test('buildRegIdWithAttributesTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello';
        attr.type = 'string',
        attr.value = 'world';
        const tx = buildRegIdWithAttributesTx(did4, [attr], pk4, gasPrice, gasLimit, 'all', address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributeTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello2';
        attr.type = 'string',
        attr.value = 'world2';
        const tx = buildAddAttributeTx(did4, [attr], pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildRemoveAttributeTx', async () => {
        const key = 'hello2';
        const tx = buildRemoveAttributeTx(did4, key, pk4, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildGetAttributesTx', async () => {
        const tx = buildGetAttributesTx(did4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributesBySingleControllerTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello3';
        attr.type = 'string',
        attr.value = 'world3';
        const tx = buildAddAttributesBySingleControllerTx(did4, [attr], 1, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

    test('buildAddAttributesByMultiControllerTx', async () => {
        const attr = new DDOAttribute();
        attr.key = 'hello4';
        attr.type = 'string',
        attr.value = 'world4';
        const signers = [new Signer(did1, 1)]; //
        const tx = buildAddAttributesByMultiControllerTx(did4, [attr], signers, gasPrice, gasLimit, address4);
        signTransaction(tx, pri4);
        addSign(tx, privateKey1); // signature of controller. Should add controller first.
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 100000);

});
