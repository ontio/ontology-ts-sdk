import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto';
import { Address } from '../src/crypto/address';
import { Identity } from '../src/identity';
import RpcClient from '../src/network/rpc/rpcClient';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildGetDDOTx, buildRegisterOntidTx } from '../src/smartcontract/ontidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';

// tslint:disable:no-console
describe('test rpc client', () => {
    const rpcClient = new RpcClient();

    const codeHash = 'ff00000000000000000000000000000000000003';

    let txHash: string;
    let blockHash: string;
    let height: number;

    const privateKey = PrivateKey.random();
    const publicKey = privateKey.getPublicKey();
    const account = Account.create(privateKey, '123456', '');
    const identity = Identity.create(privateKey, '123456', '');
    const ontid =  identity.ontid;
    const address = account.address;

    /**
     * Registers new ONT ID to create transaction with Events and new block
     */
    beforeAll(async () => {
        const tx = buildRegisterOntidTx(ontid, publicKey, '0', '30000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);

        const client = new WebsocketClient();
        const result = await client.sendRawTransaction(tx.serialize(), false, true);
        txHash = result.Result.TxHash;
    }, 10000);

    /**
     * Gets current block height to be used by following tests.
     */
    test('test getBlockHeight', async () => {
        const res = await rpcClient.getBlockHeight();
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
        expect(res.result).toBeDefined();
        height = res.result - 1;
    });

    /**
     * Gets block hash to be used by following tests.
     */
    test('test getBlockJson by height', async () => {
        const res = await rpcClient.getBlockJson(height);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
        expect(res.result).toBeTruthy();
        expect(res.result.Hash).toBeDefined();
        blockHash = res.result.Hash;
    });

    test('test getBlock by height', async () => {
        const res = await rpcClient.getBlock(height);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test sendRawTransaction', async () => {
        const tx = buildGetDDOTx(ontid);
        const res = await rpcClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getRawTransaction', async () => {
        const res = await rpcClient.getRawTransaction(txHash);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getGenerateBlockTime', async () => {
        const res = await rpcClient.getGenerateBlockTime();
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getNodeCount', async () => {
        const res = await rpcClient.getNodeCount();
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getBlockJson', async () => {
        const res = await rpcClient.getBlockJson(blockHash);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getBalance', async () => {
        const res = await rpcClient.getBalance(address);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getContract', async () => {
        const res = await rpcClient.getContract(codeHash);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getContractJson', async () => {
        const res = await rpcClient.getContractJson(codeHash);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getBlock by hash', async () => {
        const res = await rpcClient.getBlock(blockHash);
        console.log(res);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getBlockCount', async () => {
        const res = await rpcClient.getBlockCount();
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getSmartCodeEvent by height', async () => {
        const res = await rpcClient.getSmartCodeEvent(height);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getSmartCodeEvent by hash', async () => {
        const res = await rpcClient.getSmartCodeEvent(txHash);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getBlockHeightByTxHash', async () => {
        const res = await rpcClient.getBlockHeightByTxHash(txHash);
        expect(res.desc).toEqual('SUCCESS');
    });

    test('test getStorage', async () => {
        const key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702';
        const res = await rpcClient.getStorage(codeHash, key);
        console.log('getStorage');
        console.log(res);
        expect(res.result).toBeDefined();
    });

    // wait for update this api in testnet
    /* test('test getMerkleProof', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rpcClient.getMerkleProof(hash)
        expect(res.desc).toEqual('SUCCESS')
    }) */
});
