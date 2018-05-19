import { WebsocketClient } from '../src/network/websocket/websocketClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContractTxBuilder';
import { TEST_ONT_URL } from '../src/consts';
import { Address } from '../src/crypto'

describe('test websocket', () => {
    const client = new WebsocketClient(TEST_ONT_URL.SOCKET_URL, false);

    var txHash = 'd5200d614994ea5242462f3a6601134ef235b9be03b6ce2f39e871fec2c36768',
        blockHash = '9d51e95d4cc0365b3ed06f66c5df4808491c09723810cc28ad37d5be152f230b',
        codeHash = 'ff00000000000000000000000000000000000003',
        height = 1000,
        ontid = 'did:ont:TA7j42nDdZSyUBdYhWoxnnE5nUdLyiPoK3',
        address = 'TA5k9pH3HopmscvgQYx8ptfCAPuj9u2HxG'

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
        const address = new Address('TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE')
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
        const result = await client.getMerkleProof(txHash);

        expect(result.Action).toBe('getmerkleproof');
        expect(result.Desc).toBe('SUCCESS');
        expect(result.Result).toBeDefined();
        expect(result.Result.Type).toBe('MerkleProof');
    });
})
