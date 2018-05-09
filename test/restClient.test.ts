import RestClient from '../src/network/rest/restClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';

describe('test restClient', () => {
    var rest = new RestClient()
    var txHash = '131ce8746c384ba0d535308286b67ca54a0e458af43c1727c6124eabfb946a08',
        blockHash = '8f1677db846208433fa9d6236f6fbf96628f060a2a13ca33c8e311c7495c4cce',
        codeHash = '80b0cc71bda8653599c5666cae084bff587e2de1',
        height = 1000,
        ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW',
        address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE'
        

    test('test sendRawTransaction', async () => {
        let tx = buildGetDDOTx(ontid)
        let res = await rest.sendRawTransaction(tx.serialize(), true)
        console.log(res)
        expect(res.Result).toBeDefined()
    })

   

    test('test getRawTransaction', async () => {
        let res = await rest.getRawTransaction(txHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getRawTransactionJson', async () => {
        let res = await rest.getRawTransactionJson(txHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test GenerateBlockTime', async () => {
        let res = await rest.getGenerateBlockTime()
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getNodeCount', async () => {
        let res = await rest.getNodeCount()
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlockHeight', () => {
        return rest.getBlockHeight().then(data => {
            console.log(data)
            expect(data).toBeDefined()
        })
    }) 

    test('test getBlock by hash', async () => {
        let res = await rest.getBlock(blockHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlock by height', async () => {
        let res = await rest.getBlock(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlockJson by hash', async () => {
        let res = await rest.getBlockJson(blockHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlockJson by height', async () => {
        let res = await rest.getBlockJson(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBalance', async () => {
        let res = await rest.getBalance(address)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getContract', async () => {
        let res = await rest.getContract(codeHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getContractJson', async () => {
        let res = await rest.getContractJson(codeHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })
    
    test.skip('test smartCodeEvent by hash', async () => {
        let res = await rest.getSmartCodeEvent(txHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test.skip('test smartCodeEvent by height', async () => {
        let res = await rest.getSmartCodeEvent(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })


    test('test getBlockHeightByTxHash', async () => {
        let res = await rest.getBlockHeightByTxHash(txHash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test.skip('test getStorage', async () => {
        let key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702'
        let res = await rest.getStorage(codeHash, key)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test with error', async () => {
        let rest = new RestClient('http://192.168.1.1:20334')
        try{
            await rest.getBlockHeight()
        }catch(err) {
            console.log('err'+JSON.stringify(err))
            expect(err).toBeDefined()
        }
    })

    // wait for update this api in testnet
    test('test getMerkleProof', async () => {
        let res = await rest.getMerkleProof(txHash)
        console.log(res)
        expect(res).toBeDefined()
    })
})

