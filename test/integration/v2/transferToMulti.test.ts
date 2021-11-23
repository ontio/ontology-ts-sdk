import {Address, PrivateKey} from "../../../src/crypto";
import {
    makeTransferToManyV2
} from "../../../src/smartcontract/nativevm/ontAssetTxBuilder";
import {signTransaction} from "../../../src/transaction/transactionBuilder";
import {Account, WebsocketClient} from "../../../src";

const gasLimit = '20000';
const gasPrice = '2500';

// from ATrsfFRuAEcHNznnuLmJgC5A4Gm2Yit9XZ
// to1 AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r
// to2 ALkgCg5LFqFJFRmodYd2GMgnZJMzvwac8s
describe('test transferToMulti', () => {
    const socketClient = new WebsocketClient('http://172.168.3.73:20335');
    const adminPrivateKey = new PrivateKey('861dd2bd18cc61483b3f9bab4a62de945279c8f9c9fdd6318e09031634bc2e1b');
    const account = Account.create(adminPrivateKey, '123456', '');
    const adminAddress = account.address

    test('transferToMulti', async () => {
        const address1 = new Address('AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r');
        const address2 = new Address('ALkgCg5LFqFJFRmodYd2GMgnZJMzvwac8s'); // ont: '1', ong: '0'
        const tx = makeTransferToManyV2('ONG', adminAddress, [address1, address2], [3, 10], gasPrice, gasLimit);
        signTransaction(tx, adminPrivateKey);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    });
})

