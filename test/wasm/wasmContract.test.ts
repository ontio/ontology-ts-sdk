import { RestClient } from '../../src';
import BigInt from '../../src/common/bigInt';
import { PrivateKey } from '../../src/crypto';
import {
    makeDeployCodeTransaction, makeWasmVmInvokeTransaction, signTransaction
} from '../../src/transaction/transactionBuilder';
import { hexstr2str } from '../../src/utils';
import { Account } from './../../src/account';
import { Result } from './../../src/claim/attestNotifyEvent';
import { Status } from './../../src/claim/claim';
import { I128, I128FromBigInt, I128FromInt, maxBigU128, maxI128, minI128 } from './../../src/common/int128';
import { Address } from './../../src/crypto/address';
import { WebsocketClient } from './../../src/network/websocket/websocketClient';
import { Parameter, ParameterType } from './../../src/smartcontract/abi/parameter';
import { VmType } from './../../src/transaction/payload/deployCode';
import { reverseHex, StringReader } from './../../src/utils';
// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('test deploy contract', () => {
    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    // tslint:disable:no-console
    console.log(account.address.toBase58());

    const contractCode = fs.readFileSync(__dirname + '/helloworld.wasm').toString('hex');
    const restClient = new RestClient();
    const wsClient = new WebsocketClient();

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
        const result = await restClient.getContractJson('d26bd5624d5fd809fdccd865cffaac766c61b6a0');
        console.log(result);
        expect(result.Result).toBeTruthy();
    }, 10000);

    test('invokeAdd', async () => {
        const contractAddress = new Address('5daf0ec53b21abfab6459c7ba7f760c376e18ebf');
        const params = [
            // new Parameter('param1', ParameterType.Long, '-1'),
            // new Parameter('param2', ParameterType.Long, '2')
            new Parameter('param1', ParameterType.Integer, -1),
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
        // 没有decimal 方法？
        const tx = makeWasmVmInvokeTransaction('decimal', params, contractAddress,
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
            new Parameter('param1', ParameterType.Long, '10')
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
        const res = await rest.getSmartCodeEvent('377617131b99c4472e174e53b939234df278a23e705cfafacce5702dcd0f2c4e');
        console.log(JSON.stringify(res));
        expect(res.Result).toBeTruthy();
    });
    test('i128', async () => {
        const i128 = I128FromBigInt('9007199254740993');
        console.log(i128.serialize());
        expect(i128.serialize()).toEqual('01000000000020000000000000000000');
    });

    test('max128', () => {
        console.log(maxI128.toString(16));
    });

    test('transformNumber', () => {
        const data = {
            'minI128': '00000000000000000000000000000080',
            'maxI128': 'ffffffffffffffffffffffffffffff7f',
            '-2': 'feffffffffffffffffffffffffffffff',
            '-1': 'ffffffffffffffffffffffffffffffff',
            '0': '00000000000000000000000000000000',
            '1': '01000000000000000000000000000000',
            '2': '02000000000000000000000000000000'
        };
        const bmin = minI128.toString();
        const bminI128 = I128FromBigInt(bmin).serialize();
        expect(bminI128).toEqual(data.minI128);
        const bmax = maxI128.toString();
        const bmaxI128 = I128FromBigInt(bmax).serialize();
        expect(bmaxI128).toEqual(data.maxI128);
        expect(I128FromInt(-2).serialize()).toEqual(data['-2']);
        expect(I128FromInt(-1).serialize()).toEqual(data['-1']);
        expect(I128FromInt(0).serialize()).toEqual(data['0']);
        expect(I128FromInt(1).serialize()).toEqual(data['1']);
        expect(I128FromInt(2).serialize()).toEqual(data['2']);
        console.log(I128FromInt(-2).serialize());
        console.log(I128FromInt(-1).serialize());
        console.log(I128FromInt(0).serialize());
        console.log(I128FromInt(1).serialize());
        console.log(I128FromInt(2).serialize());

    });

    test('vote', async () => {
        const gasPrice = '500';
        const gasLimit = '20000';
        const contract = new Address(reverseHex('6c977ca7036c991fa430ba3b34643e146501218c'));
        const rest = new RestClient('http://172.168.3.165:20334');
        // 没有decimal 方法？
        const tx = makeWasmVmInvokeTransaction('listTopics', [], contract, '500', '20000');
        // const wsClient = new WebsocketClient('ws://13.57.184.209:20335');
        const result = await rest.sendRawTransaction(tx.serialize(), true);
        console.log(result);
        const sr = new StringReader(result.Result.Result);
        console.log(sr.readVarUint());
        const hash = sr.read(32);
        console.log(hash);
        const tx2 = makeWasmVmInvokeTransaction('getTopicInfo', [
            new Parameter('', ParameterType.H256, hash)], contract, gasPrice, gasLimit);
        const result2 = await rest.sendRawTransaction(tx2.serialize(), true);
        console.log(result2);
        console.log(formatVoteInfo(result2.Result.Result));
        expect(result.Error).toEqual(0);

        function formatVoteInfo(data) {
            const sr = new StringReader(data);
            const hasValue = sr.readVarUint() > 0;
            if (hasValue) {
                const admin = new Address(sr.read(20)).toBase58();
                // tslint:disable:variable-name
                const topic_title_length = sr.readVarUint();
                const topic_title = hexstr2str(sr.read(topic_title_length));
                const topic_detail_length = sr.readVarUint();
                const topic_detail = hexstr2str(sr.read(topic_detail_length));
                const voters_length = sr.readVarUint();
                const voters = [];
                for (let i = 0; i < voters_length; i++) {
                    const voter_addr = new Address(sr.read(20)).toBase58();
                    const weight = sr.readUint128();
                    voters.push({
                        voter: voter_addr,
                        weight
                    });
                }
                const start_time = sr.readUint64();
                const end_time = sr.readUint64();
                const approve = sr.readUint64();
                const reject = sr.readUint64();
                const status = sr.readUint8();
                const hash = sr.readH256();
                return {
                    admin,
                    topic_title,
                    topic_detail,
                    voters,
                    start_time,
                    end_time,
                    approve,
                    reject,
                    status,
                    hash
                };
            }
            return null;
        }
    }, 10000);
});
