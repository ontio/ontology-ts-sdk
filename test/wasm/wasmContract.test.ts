import { RestClient } from '../../src';
import { PrivateKey } from '../../src/crypto';
import { makeWasmVmInvokeTransaction } from '../../src/smartcontract/wasm/transactionBuilder';
import { makeDeployCodeTransaction, signTransaction } from '../../src/transaction/transactionBuilder';
import { hexstr2str } from '../../src/utils';
import { Account } from './../../src/account';
import { Address } from './../../src/crypto/address';
import { WebsocketClient } from './../../src/network/websocket/websocketClient';
import { Parameter, ParameterType } from './../../src/smartcontract/abi/parameter';
import { VmType } from './../../src/transaction/payload/deployCode';
// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('test deploy contract', () => {
    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    // tslint:disable:no-console
    console.log(account.address.toBase58());

    const contractCode = fs.readFileSync(__dirname + '/helloworld.wasm').toString('hex');
    const restClient = new RestClient('http://127.0.0.1:20334');
    const wsClient = new WebsocketClient('http://127.0.0.1:20335');

    test('deployWasmContract', async () => {

        // console.log(code);
        // tslint:disable-next-line:max-line-length
        const tx = makeDeployCodeTransaction(contractCode, 'wasmContract', '1.0', 'alice', 'testmail', 'desc', VmType.WASMVM_TYPE, '500', '30000000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);
        const result = await restClient.sendRawTransaction(tx.serialize());
        console.log(result);
        expect(result.Error).toEqual(0);
    });

    test('get_contract', async () => {
        const contract = Address.fromVmCode(contractCode);
        const codeHash = contract.toHexString();
        // tslint:disable:no-console
        console.log('contract address: ' + contract.serialize());
        console.log('codeHash: ' + codeHash);
        const result = await restClient.getContract(codeHash);
        console.log(result);
        expect(result.Result).toBeTruthy();
    }, 10000);

    test('invokeAdd', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const params = [
            new Parameter('param1', ParameterType.Integer, 1),
            new Parameter('param2', ParameterType.Integer, 2)
        ];
        const tx = makeWasmVmInvokeTransaction('add', params, contractAddress, '500', '20000', account.address);
        console.log(tx.payload.serialize());
        signTransaction(tx, privateKey);
        const result = await wsClient.sendRawTransaction(tx.serialize(), true);
        console.log(result);
        expect(result.Error).toEqual(0);
    }, 10000);

    test('invokeNotify', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const tx = makeWasmVmInvokeTransaction('notify', [], contractAddress, '500', '20000', account.address);
        console.log(tx.payload.serialize());
        signTransaction(tx, privateKey);
        const result = await wsClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(result));
        console.log(hexstr2str(result.Result));
        expect(result.Error).toEqual(0);
    }, 10000);

    test('invokePre', async () => {
        const methods = ['timestamp', 'block_height', 'self_address', 'caller_address', 'entry_address',
            'current_txhash', 'current_blockhash'];
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        for (const method of methods) {
            const params = [];
            const tx = makeWasmVmInvokeTransaction(method, params, contractAddress, '500', '20000', account.address);
            signTransaction(tx, privateKey);
            const result = await restClient.sendRawTransaction(tx.serialize(), true);
            console.log(result);
            expect(result.Error).toEqual(0);
        }

    }, 10000);

    test('invokeStorageWrite', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const params = [
            new Parameter('param1', ParameterType.String, 'abc'),
            new Parameter('param2', ParameterType.String, '123')
        ];
        const tx = makeWasmVmInvokeTransaction('storage_write', params, contractAddress,
            '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const result = await wsClient.sendRawTransaction(tx.serialize(), false);
        console.log(result);
        expect(result.Error).toEqual(0);
    }, 10000);

    test('invokeStorageRead', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const params = [
            new Parameter('param1', ParameterType.String, 'abc')
        ];
        const tx = makeWasmVmInvokeTransaction('storage_read', params, contractAddress,
            '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const result = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(result);
        console.log(hexstr2str(result.Result.Result));
        expect(result.Error).toEqual(0);
    }, 10000);

    test('invokeStorageDelete', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const params = [
            new Parameter('param1', ParameterType.String, 'abc')
        ];
        const tx = makeWasmVmInvokeTransaction('storage_delete', params, contractAddress,
            '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const result = await wsClient.sendRawTransaction(tx.serialize(), false);
        console.log(result);
        expect(result.Error).toEqual(0);
    }, 10000);
});
