import { TEST_ONT_URL } from '../src/consts';
import { Address } from '../src/crypto';
import * as wsClient from '../src/network/websocket/websocketBuilder';
import { buildGetDDOTx } from '../src/smartcontract/ontidContractTxBuilder';
import TxSender from '../src/transaction/txSender';

// tslint:disable:no-console
describe('test websocket', () => {

    // var wsClient = new WebsocketClientApi()
    const txSender = new TxSender(TEST_ONT_URL.SOCKET_URL);
    // tslint:disable-next-line:one-variable-per-declaration
    const txHash = 'd5200d614994ea5242462f3a6601134ef235b9be03b6ce2f39e871fec2c36768',
        blockHash = '9d51e95d4cc0365b3ed06f66c5df4808491c09723810cc28ad37d5be152f230b',
        codeHash = 'ff00000000000000000000000000000000000003',
        height = 1000,
        ontid = 'did:ont:TA7j42nDdZSyUBdYhWoxnnE5nUdLyiPoK3',
        address = 'TA5k9pH3HopmscvgQYx8ptfCAPuj9u2HxG';

    test('send heartbeat', () => {
        const param =  wsClient.sendHeartBeat();
        // tslint:disable:only-arrow-functions
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('send heartbeat');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('send subscribe', () => {
        const param = wsClient.sendSubscribe();
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('send subscribe');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test sendRawTransaction', () => {
        const tx = buildGetDDOTx(ontid);
        const param = wsClient.sendRawTransaction(tx.serialize());
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('sendRawTransaction');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getRawTransaction', () => {
        const param = wsClient.getRawTransaction(txHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getRawTransaction');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getRawTransactionJson', () => {
        const param = wsClient.getRawTransactionJson(txHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('sendRawTransactionJson');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getGenerateBlockTime', () => {
        const param =  wsClient.getGenerateBlockTime();
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getGenerateBlockTime');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getNodeCount', () => {
        const param =  wsClient.getNodeCount();
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getNodeCount');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlockHeight', () => {
        const param = wsClient.getBlockHeight();
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlockHeight');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlock by height', () => {
        const param = wsClient.getBlock(height);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlock by height');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlock by hash', () => {
        const param = wsClient.getBlock(blockHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlock by hash');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlockJson by height', () => {
        const param = wsClient.getBlockJson(height);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlockJson by height');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlockJson by hash', () => {
        const param = wsClient.getBlockJson(blockHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlockJson by hash');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBalance', () => {
        const param = wsClient.getBalance(new Address(address));
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBalance');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getContract', () => {
        const param = wsClient.getContract(codeHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getContract');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getContractJson', () => {
        const param = wsClient.getContractJson(codeHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getContractJson');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getSmartCodeEvent by height', () => {
        const param = wsClient.getSmartCodeEvent(height);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getSmartCodeEvent');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getSmartCodeEvent by txHash', () => {
        const param = wsClient.getSmartCodeEvent(txHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getSmartCodeEvent');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getBlockHeightByTxHash', () => {

        const param = wsClient.getBlockHeightByTxHash(txHash);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getBlockHeightByTxHash');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    test('test getStorage', () => {
        const key = '2a6469643a6f6e743a5443375a6b556a62694e36794b61415433687735567a714c713138587538635a4a5702';
        const param = wsClient.getStorage(codeHash, key);
        const callback = function(err, res, socket) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('getStorage');
            console.log(res);
            socket.close();
        };
        txSender.sendTxWithSocket(param, callback);
    });

    // test('test getMerkleProof', () => {
    //     let hash = '8893c8648d8dfad8f99274e1bdd3abb3cd47ba87cb54543c0594ac9cf7110888'
    //     let param = wsClient.getMerkleProof(hash)
    //     txSender.sendTxWithSocket(param, callback)
    // })
});

// var callback = function (err, res, socket) {
//     if (err) {
//         console.log(err)
//         return;
//     }
//     console.log(res)
// }
// var wsSocket = new WebsocketClient(callback)

// wsSocket.sendHeartBeat()
