import WebsocketClientApi from '../src/network/websocket/websocketClient'
import { buildGetDDOTx } from '../src/smartcontract/ontidContract';
import TxSender from '../src/transaction/txSender'
import { TEST_ONT_URL } from '../src/consts';

describe('test websocket', () => {
    
    var wsClient = new WebsocketClientApi()
    var txSender = new TxSender(TEST_ONT_URL.SOCKET_URL)
    // test('send heartbeat', () => {
    //     wsClient.sendHeartBeat()
    // })

    test('test sendRawTransaction', ()=> {
        let ontid = 'did:ont:TC7ZkUjbiN6yKaAT3hw5VzqLq18Xu8cZJW'

        let tx = buildGetDDOTx(ontid)
        let param = wsClient.sendRawTransaction(tx.serialize())
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('sendRawTransaction')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

     test('test getRawTransaction', () => {
        let txhash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let param = wsClient.getRawTransaction(txhash)
         let callback = function (err, res, socket) {
             if (err) {
                 console.log(err)
                 return;
             }
             console.log('getRawTransaction')
             console.log(res)
             socket.close()
         }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getRawTransactionJson', () => {
        let txhash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let param = wsClient.getRawTransactionJson(txhash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('sendRawTransactionJson')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)       
    })

    test('test getGenerateBlockTime', () => {
        let param =  wsClient.getGenerateBlockTime()
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getGenerateBlockTime')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)        
    })

    test('test getNodeCount', () => {
        let param =  wsClient.getNodeCount()
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getNodeCount')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)       
    })

    test('test getBlockHeight', () => {
        let param = wsClient.getBlockHeight()
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlockHeight')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)        
    })

    test('test getBlock by height', () => {
        let height = 171230
        let param = wsClient.getBlock(height)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlock by height')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getBlock by hash', () => {
        let hash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let param = wsClient.getBlock(hash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlock by hash')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getBlockJson by height', () => {
        let height = 1000
        let param = wsClient.getBlockJson(height)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlockJson by height')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)        
    })
    
    test('test getBlockJson by hash', () => {
        let hash = '54dbc90e2476c7444774814e1ba65c606586fff4cac742d6de7d1e5899993e5c'
        let param = wsClient.getBlockJson(hash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlockJson by hash')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getBalance', () => {
        let address = 'TA7T3p6ikRG5s2pAaehUH2XvRCCzvsFmwE'
        let param = wsClient.getBalance(address)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBalance')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getContract', () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let param = wsClient.getContract(codeHash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getContract')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getContractJson', () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let param = wsClient.getContractJson(codeHash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getContractJson')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getSmartCodeEvent by height', () => {
        let height = 169909
        let param = wsClient.getSmartCodeEvent(height)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getSmartCodeEvent')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getSmartCodeEvent by txHash', () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let param = wsClient.getSmartCodeEvent(hash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getSmartCodeEvent')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getBlockHeightByTxHash', () => {
        let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
        let param = wsClient.getBlockHeightByTxHash(hash)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getBlockHeightByTxHash')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    test('test getStorage', () => {
        let codeHash = '8055b362904715fd84536e754868f4c8d27ca3f6'
        let key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702'
        let param = wsClient.getStorage(codeHash, key)
        let callback = function (err, res, socket) {
            if (err) {
                console.log(err)
                return;
            }
            console.log('getStorage')
            console.log(res)
            socket.close()
        }
        txSender.sendTxWithSocket(param, callback)
    })

    // test('test getMerkleProof', () => {
    //     let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
    //     let param = wsClient.getMerkleProof(hash)
    //     txSender.sendTxWithSocket(param, callback)
    // })
})



// var callback = function (err, res, socket) {
//     if (err) {
//         console.log(err)
//         return;
//     }
//     console.log(res)
// }
// var wsSocket = new WebsocketClient(callback)

// wsSocket.sendHeartBeat()
