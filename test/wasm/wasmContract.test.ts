import { reverseHex } from './../../src/utils';
import { RestClient } from '../../src';
import { PrivateKey } from '../../src/crypto';
import {
    makeDeployCodeTransaction, makeWasmVmInvokeTransaction, signTransaction
} from '../../src/transaction/transactionBuilder';
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
        const rest = new RestClient('http://13.57.184.209:20334');
        const result = await rest.getContract('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
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

    test('balanceOf', async () => {
        const contractAddress = new Address(reverseHex('44d451cb5ef516eac96c5a1bd32b51f1385e4931'));
        const params = [
            // tslint:disable-next-line:max-line-length
            // wasm 合约Address类型的值不能传对应ByteArray的值
            new Parameter('param1', ParameterType.Address, new Address('AUr5QUfeBADq6BMY6Tp5yuMsUNGpsD7nLZ')
        ];
        const tx = makeWasmVmInvokeTransaction('balanceOf', params, contractAddress,
            '500', '20000', account.address);
        console.log(tx.payload.serialize());
        signTransaction(tx, privateKey);
        const wsClient = new WebsocketClient('ws://13.57.184.209:20335');
        const result = await wsClient.sendRawTransaction(tx.serialize(), true);
        console.log(result);
        console.log(hexstr2str(result.Result.Result));
        expect(result.Error).toEqual(0);
    }, 10000);

    test('transfer', async () => {
        const contractAddress = new Address(reverseHex('44d451cb5ef516eac96c5a1bd32b51f1385e4931'));
        const params = [
            new Parameter('param1', ParameterType.Address, new Address('AJkkLbouowk6teTaxz1F2DYKfJh24PVk3r')),
            new Parameter('param1', ParameterType.Address, new Address('AUr5QUfeBADq6BMY6Tp5yuMsUNGpsD7nLZ')),
            new Parameter('param1', ParameterType.Integer, 10)
        ];
        const tx = makeWasmVmInvokeTransaction('transfer', params, contractAddress,
            '500', '300000', account.address);
        console.log(tx.payload.serialize());
        signTransaction(tx, privateKey);
        const wsClient = new WebsocketClient('ws://13.57.184.209:20335');
        const result = await wsClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(result));
        if (result.Result && result.Result.Result) {
            console.log(hexstr2str(result.Result.Result));
        }
        expect(result.Error).toEqual(0);
    }, 10000);
    test('smartCodeEvent', async () => {
        const rest = new RestClient('http://13.57.184.209:20334');
        const res = await rest.getSmartCodeEvent('e798e6299059a6a7f362a0ea90b62f997befb8d1bc1e626ce5996095be4fc2bf');
        console.log(JSON.stringify(res));
        expect(res.Result).toBeTruthy();
    });
});
