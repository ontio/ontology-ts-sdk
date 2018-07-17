import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { PublicKey } from '../src/crypto/PublicKey';
import { Parameter } from '../src/index';
import { NeoRpc } from '../src/neocore/NeoRpc';
import { Program } from '../src/neocore/Program';
import { SmartContract } from '../src/neocore/SmartContract';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { reverseHex } from '../src/utils';
import { Address } from './../src/crypto/address';
import { SignatureScheme } from './../src/crypto/SignatureScheme';
import { ParameterType } from './../src/smartcontract/abi/parameter';

// tslint:disable:no-console
describe('test neo tx', () => {
    const private1 = new PrivateKey('1094e90dd7c4fdfd849c14798d725ac351ae0d924b29a279a9ffa77d5737bd96');
    const private2 = new PrivateKey('bc254cf8d3910bc615ba6bf09d4553846533ce4403bc24f58660ae150a6d64cf');
    const contractHash = '5bb169f915c916a5e30a3c13a5e0cd228ea26826';
    // const contractHash = 'ceab719b8baa2310f232ee0d277c061704541cfb';
    const contractAddr = new Address(reverseHex(contractHash));
    const node = 'http://seed2.neo.org:20332';
    // const node = 'http://52.224.162.48:10332';
    const account1 = Account.create(private1, '123456');
    console.log(account1.toJsonObj());
    const account2 = Account.create(private2, '123456');
    // tslint:disable-next-line:max-line-length
    const nep5abi = '{"hash":"0x5bb169f915c916a5e30a3c13a5e0cd228ea26826","entrypoint":"Main","functions":[{"name":"Name","parameters":[],"returntype":"String"},{"name":"Symbol","parameters":[],"returntype":"String"},{"name":"Decimals","parameters":[],"returntype":"Integer"},{"name":"Main","parameters":[{"name":"operation","type":"String"},{"name":"args","type":"Array"}],"returntype":"Any"},{"name":"Init","parameters":[],"returntype":"Boolean"},{"name":"TotalSupply","parameters":[],"returntype":"Integer"},{"name":"Transfer","parameters":[{"name":"from","type":"ByteArray"},{"name":"to","type":"ByteArray"},{"name":"value","type":"Integer"}],"returntype":"Boolean"},{"name":"BalanceOf","parameters":[{"name":"address","type":"ByteArray"}],"returntype":"Integer"}],"events":[{"name":"transfer","parameters":[{"name":"arg1","type":"ByteArray"},{"name":"arg2","type":"ByteArray"},{"name":"arg3","type":"Integer"}],"returntype":"Void"}]}';
    const abiInfo = AbiInfo.parseJson(nep5abi);
    test('test_getBalance', async () => {
        const res = await NeoRpc.getBalance(node, contractAddr, new Address('AQ3UFeUJbCvTBpAat2Yq7wWRKk8PPS7chw'));
        console.log(res);
        if (res.result) {
            const balance = parseInt(reverseHex(res.result), 16) / 100000000;
            console.log(balance);
        }

        expect(res).toBeTruthy();
    }, 10000);

    test('test_transfer', async () => {
        console.log('address1: ' + account1.address.toBase58() + ' ' + account1.address.serialize());
        // console.log('address2: ' + account2.address.toBase58() + ' ' + account2.address.serialize());

        const abiFunction = abiInfo.getFunction('Transfer');
        abiFunction.name = abiFunction.name.toLowerCase();
        const p1 = new Parameter('from', ParameterType.ByteArray, account1.address.serialize());
        const p2 = new Parameter('to', ParameterType.ByteArray, account2.address.serialize());
        const p3 = new Parameter('value', ParameterType.Integer, 2 * 100000000);
        abiFunction.setParamsValue(p1, p2, p3);
        const tx = SmartContract.makeInvokeTransaction(contractAddr, account1.address, abiFunction);
        const p = new Program();
        p.parameter = Program.programFromParams([tx.sign(private1, SignatureScheme.ECDSAwithSHA256)]);
        p.code = Program.programFromPubKey(new PublicKey(account1.publicKey));
        tx.scripts = [p];
        console.log('script: ' +  tx.script);
        console.log('gas: ' + tx.gas);
        console.log('tx: ' + tx.serialize());
        console.log('program: ' + p.code);
        const res = await NeoRpc.sendRawTransaction(node, tx.serialize());
        console.log(res);
    }, 10000);
});
