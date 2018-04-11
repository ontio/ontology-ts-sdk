import RpcClient from '../src/network/rpc/rpcClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';

describe('test rpc client', () => {
    var rpcClient = new RpcClient()
    test('test getBlockHeight', async () => {
        let hash = '58263ab9f6c5fd80549f1868382ae86de67c9c943e727a13cb687e9d3139b6c0'
        let res = await rpcClient.getBlockHeight()
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test sendRawTransaction', async () => {
        let ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW'
        let tx = buildGetDDOTx(ontid)
        let res = await rpcClient.sendRawTransaction(tx.serialize(), true)
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getRawTransaction', async () => {
        let txHash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
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
        let blockHash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let res = await rpcClient.getBlockJson(blockHash)
        console.log(res)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getContract', async () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let res = await rpcClient.getContract(codeHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getContractJson', async () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let res = await rpcClient.getContractJson(codeHash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlock by hash', async () => {
        let blockHash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let res = await rpcClient.getBlock(blockHash)
        console.log(res)        
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlock by height', async () => {
        let height = 1000
        let res = await rpcClient.getBlock(height)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlockCount', async () => {
        let res = await rpcClient.getBlockCount()
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getSmartCodeEvent by height', async () => {
        let height = 170803
        let res = await rpcClient.getSmartCodeEvent(height)
        expect(res.desc).toEqual('SUCCESS')
    })
    
    test('test getSmartCodeEvent by hash', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rpcClient.getSmartCodeEvent(hash)
        expect(res.desc).toEqual('SUCCESS')
    })

    test('test getBlockHeightByHash', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rpcClient.getBlockHeightByTxHash(hash)
        expect(res.desc).toEqual('SUCCESS')
    })  

    test('test getStorage', async () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
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