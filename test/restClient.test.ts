import RestClient from '../src/network/rest/restClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContractTxBuilder';
import { Address } from '../src/crypto/address';

describe('test restClient', () => {
    var rest = new RestClient()
    var txHash = 'd5200d614994ea5242462f3a6601134ef235b9be03b6ce2f39e871fec2c36768',
        blockHash = '9d51e95d4cc0365b3ed06f66c5df4808491c09723810cc28ad37d5be152f230b',
        codeHash = 'ff00000000000000000000000000000000000003',
        height = 1000,
        ontid = 'did:ont:TA7j42nDdZSyUBdYhWoxnnE5nUdLyiPoK3',
        address = 'TA5k9pH3HopmscvgQYx8ptfCAPuj9u2HxG'
        

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
        let res = await rest.getBalance(new Address(address))
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

   
    // wait for update this api in testnet
    test('test getMerkleProof', async () => {
        let res = await rest.getMerkleProof(txHash)
        console.log(res)
        expect(res).toBeDefined()
    })
})

