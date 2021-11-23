import {Address, PrivateKey} from "../../../src/crypto";
import {State} from "../../../src/smartcontract/nativevm/token";
import { makeTransferStateTxV2} from "../../../src/smartcontract/nativevm/ontAssetTxBuilder";
import {addSign, signTransaction} from "../../../src/transaction/transactionBuilder";
import {WebsocketClient} from "../../../src";

const gasLimit = '20000';
const gasPrice = '2500';

describe('test ont/ong v2', () => {
    const socketClient = new WebsocketClient('http://172.168.3.73:20335');

    test('transferStateTx', async () => {
        const pris = [
            new PrivateKey('861dd2bd18cc61483b3f9bab4a62de945279c8f9c9fdd6318e09031634bc2e1b'),
            new PrivateKey('ac4d571db1a58ff1a70d4b589512c41f68a9ebf619e77b99470b4c0314c6c64a'),
        ];
        const addrs = [
            new Address('ATrsfFRuAEcHNznnuLmJgC5A4Gm2Yit9XZ'), // from1
            new Address('AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r'), // from2
            new Address('ALkgCg5LFqFJFRmodYd2GMgnZJMzvwac8s'), // to1
            new Address('ANr9Eo7aVNumjggYMtK7BYHkNAZyG11h4j'), // to2
        ];
        const states = [
            new State(addrs[0], addrs[2], 1),
            new State(addrs[1], addrs[3], 1),
        ];
        const payer = addrs[0];
        const tx = makeTransferStateTxV2('ONT', states, gasPrice, gasLimit, payer);
        signTransaction(tx, pris[0]);
        addSign(tx, pris[1]);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });
})

