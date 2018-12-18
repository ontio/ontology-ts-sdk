import { Account } from '../src/account';
import { TEST_ONT_URL } from '../src/consts';
import { Address, PrivateKey } from '../src/crypto';
import { Identity } from '../src/identity';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildGetDDOTx, buildRegisterOntidTx } from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';
import { addSign } from './../src/transaction/transactionBuilder';

describe('test websocket', () => {
    const client = new WebsocketClient(TEST_ONT_URL.SOCKET_URL, true, false);
    client.addNotifyListener((result) => {
        console.log('listener: ' + result);
    });

    // tslint:disable-next-line:one-variable-per-declaration
    const codeHash = '36bb5c053b6b839c8f6b923fe852f91239b9fccc';

    let txHash: string;
    let blockHash: string;
    let height: number = 10000;

    const privateKey = PrivateKey.random();
    const publicKey = privateKey.getPublicKey();
    const account = Account.create(privateKey, '123456', '');
    const identity = Identity.create(privateKey, '123456', '');
    const ontid =  identity.ontid;
    const address = account.address;

    const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const adminAddress = new Address('AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz');

    /**
     * Registers new ONT ID to create transaction with Events and new block
     */
    beforeAll(async () => {
        const tx = buildRegisterOntidTx(ontid, publicKey, '500', '30000');
        tx.payer = adminAddress;
        signTransaction(tx, privateKey);
        addSign(tx, adminPrivateKey);

        const result = await client.sendRawTransaction(tx.serialize(), false, true);
        txHash = result.Result.TxHash;
    }, 5000);

    afterAll(async () => {
        client.close();
    });

    /**
     * Gets current block height to be used by following tests.
     */
    test('test getBlockHeight', async () => {
        const result = await client.getBlockHeight();

        expect(result.Action).toBe('getblockheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
        height = result.Result;
    });

    test.skip('test getBestBlockHash', async () => {
        const result = await client.getBlockHash(20);

        expect(result.Action).toBe('getblockhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test.skip('test getBlockTxsByHeight', async () => {
        const result = await client.getBlockTxsByHeight(20);

        expect(result.Action).toBe('getblocktxsbyheight');
        expect(result.Desc).toBe('SUCCESS');
    });

    test.skip('test getGasPrice', async () => {
        const result = await client.getGasPrice();

        expect(result.Action).toBe('getgasprice');
        expect(result.Desc).toBe('SUCCESS');
    });

    test.skip('test getGrantOng', async () => {
        const result = await client.getGrantOng(address);

        expect(result.Action).toBe('getgrantong');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });

    test.skip('test getMempoolTxCount', async () => {
        const result = await client.getMempoolTxCount();

        expect(result.Action).toBe('getmempooltxcount');
        expect(result.Desc).toBe('SUCCESS');
    });

    test.skip('test_getMempoolTxState', async () => {
        // tslint:disable-next-line:max-line-length
        const result = await client.getMempoolTxState('6f3c0da62e83c126c7e3b2381d5fd6d2513026afcabea295f0a8dd8bcca2a7ad');

        expect(result.Action).toBe('getmempooltxstate');
        expect(result.Desc).toBe('SUCCESS');
    });

    test('test getVerson', async () => {
        const result = await client.getVersion();

        expect(result.Action).toBe('getversion');
        expect(result.Desc).toBe('SUCCESS');
    });

    test('test getNetworkId', async () => {
        const result = await client.getNetworkId();

        expect(result.Action).toBe('getnetworkid');
        expect(result.Desc).toBe('SUCCESS');
    });

    test('test getBlock by height', async () => {
        const result = await client.getBlock(height);

        expect(result.Action).toBe('getblockbyheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    /**
     * Gets block hash to be used by following tests.
     */
    test('test getBlockJson by height', async () => {
        const result = await client.getBlockJson(height);

        expect(result.Action).toBe('getblockbyheight');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.Hash).toBeDefined();
        blockHash = result.Result.Hash;
    });

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

    // test('test getGenerateBlockTime', async () => {
    //     const result = await client.getGenerateBlockTime();

    //     expect(result.Action).toBe('getgenerateblocktime');
    //     expect(result.Desc).toBe('SUCCESS');
    // });

    test('test getNodeCount', async () => {
        const result = await client.getNodeCount();

        expect(result.Action).toBe('getconnectioncount');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('number');
    });

    test('test getBlock by hash', async () => {
        const result = await client.getBlock(blockHash);

        expect(result.Action).toBe('getblockbyhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('string');
    });

    test('test getBlockJson by hash', async () => {
        const result = await client.getBlockJson(blockHash);

        expect(result.Action).toBe('getblockbyhash');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.Hash).toBeDefined();
    });

    test('test getBalance', async () => {
        const result = await client.getBalance(address);

        expect(result.Action).toBe('getbalance');
        expect(result.Desc).toBe('SUCCESS');
        expect(typeof result.Result).toBe('object');
        expect(result.Result.ont).toBeDefined();
        expect(result.Result.ong).toBeDefined();
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

    test('test getSmartCodeEvent by height', async () => {
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
});
