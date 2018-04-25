import RpcClient from '../src/network/rpc/rpcClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';

describe('test rpc client', () => {
    var rpcClient = new RpcClient()
    var txHash = '131ce8746c384ba0d535308286b67ca54a0e458af43c1727c6124eabfb946a08',
        blockHash = '8f1677db846208433fa9d6236f6fbf96628f060a2a13ca33c8e311c7495c4cce',
        codeHash = '80b0cc71bda8653599c5666cae084bff587e2de1',
        height = 1000,
        ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW',
        address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE'

    test('test getBlockHeight', async () => {
        let res = await rpcClient.getBlockHeight()
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test sendRawTransaction', async () => {
        let tx = buildGetDDOTx(ontid)
        let res = await rpcClient.sendRawTransaction(tx.serialize(), true)
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getRawTransaction', async () => {
        let res = await rpcClient.getRawTransaction(txHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getGenerateBlockTime', async () => {
        let res = await rpcClient.getGenerateBlockTime()
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getNodeCount', async () => {
        let res = await rpcClient.getNodeCount()
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlockJson', async () => {
        let res = await rpcClient.getBlockJson(blockHash)
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getContract', async () => {
        let res = await rpcClient.getContract(codeHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getContractJson', async () => {
        let res = await rpcClient.getContractJson(codeHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlock by hash', async () => {
        let res = await rpcClient.getBlock(blockHash)
        console.log(res)        
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlock by height', async () => {
        let res = await rpcClient.getBlock(height)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlockCount', async () => {
        let res = await rpcClient.getBlockCount()
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getSmartCodeEvent by height', async () => {
        let res = await rpcClient.getSmartCodeEvent(height)
        expect(res.desc).toEqual('SUCCESS')
    })
    
    test('test getSmartCodeEvent by hash', async () => {
        let res = await rpcClient.getSmartCodeEvent(txHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlockHeightByTxHash', async () => {
        let res = await rpcClient.getBlockHeightByTxHash(txHash)
        expect(res.desc).toEqual('SUCCESS')
    })  

    test('test getStorage', async () => {
        let key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702'
        let res = await rpcClient.getStorage(codeHash, key)
        console.log('getStorage')
        console.log(res)
        expect(res.result).toBeDefined()
    })

    //wait for update this api in testnet
    /* test('test getMerkleProof', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rpcClient.getMerkleProof(hash)
        expect(res.desc).toEqual('SUCCESS')
    }) */
})