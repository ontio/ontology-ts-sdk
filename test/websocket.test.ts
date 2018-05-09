import { WebsocketClient } from '../src/network/websocket/websocketClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';
import { TEST_ONT_URL } from '../src/consts';

describe('test websocket', () => {
    const client = new WebsocketClient(TEST_ONT_URL.SOCKET_URL, false);

    const txHash = '131ce8746c384ba0d535308286b67ca54a0e458af43c1727c6124eabfb946a08',
        blockHash = '8f1677db846208433fa9d6236f6fbf96628f060a2a13ca33c8e311c7495c4cce',
        codeHash = '80b0cc71bda8653599c5666cae084bff587e2de1',
        height = 1000,
        ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW',
        address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE'

    test('send heartbeat', async () => {
        const result = await client.sendHeartBeat();
        
        expect(result.Action).toBe('heartbeat');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result.ConstractsFilter).toBeNull();
        expect(result.Result.SubscribeEvent).toBeFalsy();
        expect(result.Result.SubscribeJsonBlock).toBeFalsy();
        expect(result.Result.SubscribeRawBlock).toBeFalsy();
        expect(result.Result.SubscribeBlockTxHashs).toBeFalsy();
    });

    test('send subscribe', async () => {
        const result = await client.sendSubscribe();
        
        expect(result.Action).toBe('subscribe');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result.ConstractsFilter).toBeNull();
        expect(result.Result.SubscribeEvent).toBeFalsy();
        expect(result.Result.SubscribeJsonBlock).toBeFalsy();
        expect(result.Result.SubscribeRawBlock).toBeFalsy();
        expect(result.Result.SubscribeBlockTxHashs).toBeFalsy();
    });

    test('send sendRawTransaction', async () => {
        const tx = buildGetDDOTx(ontid);
        const result = await client.sendRawTransaction(tx.serialize(), true);
        
        expect(result.Action).toBe('sendrawtransaction');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
    });

    test('test getRawTransaction', async () => {
        const result = await client.getRawTransaction(txHash);
        
        expect(result.Action).toBe('gettransaction');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
    });

    test('test getRawTransactionJson', async () => {
        const result = await client.getRawTransactionJson(txHash);

        expect(result.Action).toBe('gettransaction');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
        expect(result.Result.Payload).toBeDefined();
    });

    test('test getGenerateBlockTime', async () => {
        const result = await client.getGenerateBlockTime();

        expect(result.Action).toBe('getgenerateblocktime');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });

    test('test getNodeCount', async () => {
        const result = await client.getNodeCount();

        expect(result.Action).toBe('getconnectioncount');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });

    test('test getBlockHeight', async () => {
        const result = await client.getBlockHeight();

        expect(result.Action).toBe('getblockheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });

    test('test getBlock by height', async () => {
        const result = await client.getBlock(height);

        expect(result.Action).toBe('getblockbyheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test('test getBlock by hash', async () => {
        const result = await client.getBlock(blockHash);

        expect(result.Action).toBe('getblockbyhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test('test getBlockJson by height', async () => {
        const result = await client.getBlockJson(height);

        expect(result.Action).toBe('getblockbyheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.Hash).toBeDefined();
    });

    test('test getBlockJson by hash', async () => {
        const result = await client.getBlockJson(blockHash);

        expect(result.Action).toBe('getblockbyhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.Hash).toBeDefined();
    });

    test('test getBalance', async () => {
        const address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE';
        const result = await client.getBalance(address);

        expect(result.Action).toBe('getbalance');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.ont).toBeDefined();
        expect(result.Result.ong).toBeDefined();
        expect(result.Result.ong_appove).toBeDefined();
    });

    test('test getContract', async () => {
        const result = await client.getContract(codeHash);

        expect(result.Action).toBe('getcontract');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    }, 10000);

    test('test getContractJson', async () => {
        const result = await client.getContractJson(codeHash);

        expect(result.Action).toBe('getcontract');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.Code).toBeDefined();
    });

    test.skip('test getSmartCodeEvent by height', async () => {
        const result = await client.getSmartCodeEvent(height);

        expect(result.Action).toBe('getsmartcodeeventbyheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test.skip('test getSmartCodeEvent by txHash', async () => {
        const result = await client.getSmartCodeEvent(txHash);

        expect(result.Action).toBe('getsmartcodeeventbyhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test('test getBlockHeightByTxHash', async () => {
        const result = await client.getBlockHeightByTxHash(txHash);

        expect(result.Action).toBe('getblockheightbytxhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });
    
    test.skip('test getStorage', async () => {
        const key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702';
        const result = await client.getStorage(codeHash, key);

        expect(result.Action).toBe('getstorage');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
    });

    test('test getMerkleProof', async () => {
        const hash = 'fa482262546c152f53ddf757ec5f48008f7297e9b970debf82236916474bfd29';
        const result = await client.getMerkleProof(hash);

        expect(result.Action).toBe('getmerkleproof');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
        expect(result.Result.Type).toBe('MerkleProof');
    });
})
