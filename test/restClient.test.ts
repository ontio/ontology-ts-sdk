import RestClient from '../src/network/rest/restClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';

describe('test restClient', () => {
    var rest = new RestClient()

    test('test sendRawTransaction', async () => {
        let ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW'
        let tx = buildGetDDOTx(ontid)
        let res = await rest.sendRawTransaction(tx.serialize(), true)
        console.log(res)
        expect(res.Result).toBeDefined()
    })

   

    test('test getRawTransaction', async () => {
        let txhash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rest.getRawTransaction(txhash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getRawTransactionJson', async () => {
        let txhash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rest.getRawTransactionJson(txhash)
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
        let hash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let res = await rest.getBlock(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlock by height', async () => {
        let height = 1000
        let res = await rest.getBlock(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlockJson by hash', async () => {
        let hash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let res = await rest.getBlockJson(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBlockJson by height', async () => {
        let height = 1000
        let res = await rest.getBlockJson(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getBalance', async () => {
        let address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE'
        let res = await rest.getBalance(address)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getContract', async () => {
        let hash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let res = await rest.getContract(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getContractJson', async () => {
        let hash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let res = await rest.getContractJson(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })
    
    test('test smartCodeEvent by hash', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rest.getSmartCodeEvent(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test smartCodeEvent by height', async () => {
        let height = 169909
        let res = await rest.getSmartCodeEvent(height)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })


    test('test getBlockHeightByTxHash', async () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let res = await rest.getBlockHeightByTxHash(hash)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    test('test getStorage', async () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702'
        let res = await rest.getStorage(codeHash, key)
        console.log(res)
        expect(res.Result).toBeTruthy()
    })

    // test('test with error', async () => {
    //     let rest = new RestClient('http://192.168.1.1:20334')
    //     try{
    //         await rest.getBlockHeight()
    //     }catch(err) {
    //         console.log('err'+JSON.stringify(err))
    //         expect(err).toBeDefined()
    //     }
    // })

    // wait for update this api in testnet
    // test('test getMerkleProof', async () => {
    //     let hash = '58263ab9f6c5fd80549f1868382ae86de67c9c943e727a13cb687e9d3139b6c0'
    //     let res = await rest.getMerkleProof(hash)
    //     console.log(res)
    //     expect(res).toBeDefined()
    // }
})

