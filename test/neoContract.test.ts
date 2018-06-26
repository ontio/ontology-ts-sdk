/*
* Copyright (C) 2018 The ontology Authors
* This file is part of The ontology library.
*
* The ontology is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* The ontology is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { ParameterType, RestClient } from '../src/index';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import Struct from '../src/smartcontract/abi/struct';
import { getMapBytes, getStructBytes } from '../src/transaction/scriptBuilder';
import { makeDeployCodeTransaction } from '../src/transaction/transactionBuilder';
import { hexstr2str, str2hexstr } from '../src/utils';
import { Address } from './../src/crypto/address';
import { Parameter } from './../src/smartcontract/abi/parameter';
import { makeInvokeTransaction, signTransaction } from './../src/transaction/transactionBuilder';

// tslint:disable:max-line-length
const avmCode = '57c56b6c766b00527ac46c766b51527ac4616c766b00c307546573744d6170876c766b52527ac46c766b52c3641200616165c7006c766b53527ac462b4006c766b00c30e446573657269616c697a654d6170876c766b54527ac46c766b54c3641900616c766b51c300c3616511026c766b53527ac4627a006c766b00c30a54657374537472756374876c766b55527ac46c766b55c3641200616165e9026c766b53527ac4624b006c766b00c311446573657269616c697a65537472756374876c766b56527ac46c766b56c3641900616c766b51c300c36165cc036c766b53527ac4620e00006c766b53527ac46203006c766b53c3616c756658c56b6161681953797374656d2e53746f726167652e476574436f6e746578746c766b00527ac4c76c766b51527ac401646c766b52527ac46c766b51c3036b65796c766b52c3c4616c766b51c361681853797374656d2e52756e74696d652e53657269616c697a656c766b53527ac46c766b00c30274786c766b53c3615272681253797374656d2e53746f726167652e507574616c766b00c3027478617c681253797374656d2e53746f726167652e4765746c766b54527ac46c766b54c361681a53797374656d2e52756e74696d652e446573657269616c697a656c766b55527ac46c766b55c36416006c766b55c3036b6579c36c766b52c39c620400006c766b56527ac46c766b56c3643c00616c766b00c306726573756c740474727565615272681253797374656d2e53746f726167652e507574616c766b53c36c766b57527ac46238006c766b00c306726573756c740566616c7365615272681253797374656d2e53746f726167652e50757461006c766b57527ac46203006c766b57c3616c756656c56b6c766b00527ac4616c766b00c361681a53797374656d2e52756e74696d652e446573657269616c697a656c766b51527ac461681953797374656d2e53746f726167652e476574436f6e746578746c766b52527ac401646c766b53527ac46c766b51c36416006c766b51c3036b6579c36c766b53c39c620400006c766b54527ac46c766b54c3643800616c766b52c306726573756c740474727565615272681253797374656d2e53746f726167652e50757461516c766b55527ac46241006c766b52c306726573756c740566616c7365615272681253797374656d2e53746f726167652e507574616c766b51c3036b6579c36c766b55527ac46203006c766b55c3616c756656c56b6161681953797374656d2e53746f726167652e476574436f6e746578746c766b00527ac46152c56c766b51527ac46c766b51c307636c61696d6964517cc46c766b51c30164007cc46c766b51c361681853797374656d2e52756e74696d652e53657269616c697a656c766b52527ac46c766b00c30274786c766b52c3615272681253797374656d2e53746f726167652e507574616c766b00c3027478617c681253797374656d2e53746f726167652e4765746c766b53527ac46c766b52c300a06c766b54527ac46c766b54c3641300616c766b52c36c766b55527ac46238006c766b00c306726573756c740566616c7365615272681253797374656d2e53746f726167652e50757461006c766b55527ac46203006c766b55c3616c756656c56b6c766b00527ac4616c766b00c361681a53797374656d2e52756e74696d652e446573657269616c697a656c766b51527ac461681953797374656d2e53746f726167652e476574436f6e746578746c766b52527ac401646c766b53527ac46c766b51c36413006c766b51c300c36c766b53c39c620400006c766b54527ac46c766b54c3643800616c766b52c306726573756c740474727565615272681253797374656d2e53746f726167652e50757461516c766b55527ac4623e006c766b52c306726573756c740566616c7365615272681253797374656d2e53746f726167652e507574616c766b51c300c36c766b55527ac46203006c766b55c3616c7566';
const abi = '{"hash":"0xd97f2d441f82f132d1904d521f93f8e51d354d7c","entrypoint":"Main","functions":[{"name":"Main","parameters":[{"name":"operation","type":"String"},{"name":"args","type":"Array"}],"returntype":"Any"},{"name":"TestMap","parameters":[],"returntype":"Any"},{"name":"DeserializeMap","parameters":[{"name":"param","type":"ByteArray"}],"returntype":"Any"},{"name":"TestStruct","parameters":[],"returntype":"Any"},{"name":"DeserializeStruct","parameters":[{"name":"param","type":"ByteArray"}],"returntype":"Any"}],"events":[]}';
const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
const account = Account.create(privateKey, '123456', 'test');
const contractAddr = Address.fromVmCode(avmCode);
const restClient = new RestClient('http://127.0.0.1:20334');
const abiInfo = AbiInfo.parseJson(abi);
const gasPrice = '0';
const gasLimit = '30000';

// tslint:disable:no-console
describe('test smartcontract param struct and map', () => {

    const delay = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    };
    test('deploy_contract', async () => {
        const tx = makeDeployCodeTransaction(avmCode, 'name', '1.0', 'alice', 'testmail', 'desc', true, '0', '30000000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);
        await restClient.sendRawTransaction(tx.serialize());
        await delay();
        const res = await restClient.getContract(contractAddr.toHexString());
        console.log(res);
    });

    test('test_TestMap', () => {
        const abiFunc = abiInfo.getFunction('TestMap');
        const tx = makeInvokeTransaction(abiFunc.name, abiFunc.parameters, contractAddr, gasPrice, gasLimit);
        restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
            console.log(res);
        });
    });

    test('test_DeserializeMap', () => {
        const abiFunc = abiInfo.getFunction('DeserializeMap');
        const map = new Map<string, Parameter>();
        map.set('key', new Parameter('key', ParameterType.Integer, 100));
        const mapBytes = getMapBytes(map);
        console.log('map: ' + mapBytes);
        const p = new Parameter(abiFunc.parameters[0].name, ParameterType.ByteArray, mapBytes);
        const tx = makeInvokeTransaction(abiFunc.name, [p], contractAddr);
        restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
            console.log(res);
        });
    });

    test('test_TestStruct', () => {
        const abiFunc = abiInfo.getFunction('TestStruct');
        const tx = makeInvokeTransaction(abiFunc.name, abiFunc.parameters, contractAddr);
        restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
            if (res.Result && res.Result.Result) {
                // console.log(hexstr2str(res.Result.Result));
                console.log(res);
            }
        });
    });

    test('test_DeserializeStruct', () => {
        const abiFunc = abiInfo.getFunction('DeserializeStruct');
        const struct = new Struct();
        struct.add(100, str2hexstr('claimid'));
        const structBytes = getStructBytes(struct);
        console.log('struct: ' + structBytes );
        const p = new Parameter(abiFunc.parameters[0].name, ParameterType.ByteArray, structBytes);
        const tx = makeInvokeTransaction(abiFunc.name, [p], contractAddr);
        restClient.sendRawTransaction(tx.serialize(), true).then((res) => {
            console.log(res);
        });
    });
});
