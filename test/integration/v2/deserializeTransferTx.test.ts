import {Address, PrivateKey} from "../../../src/crypto";
import {deserializeTransferTxV2, makeTransferTxV2} from "../../../src/smartcontract/nativevm/ontAssetTxBuilder";
import {Account} from "../../../src";

const gasLimit = '20000';
const gasPrice = '2500';
const adminPrivateKey = new PrivateKey('861dd2bd18cc61483b3f9bab4a62de945279c8f9c9fdd6318e09031634bc2e1b');
const account = Account.create(adminPrivateKey, '123456', '');
const adminAddress = account.address;

describe('test deserializeTransferTxV2', () => {
    test('deserializeTransferTxV2', async () => {
        const from = adminAddress;
        const to = new Address('AV88PcsdFk2MTcPkuyPNEkpgLFiKHtCM1r');
        const tx = makeTransferTxV2('ONT', from, to, 200, gasPrice, gasLimit);
        const serializedTx = tx.serialize();
        const deserializedTx = deserializeTransferTxV2(serializedTx);
        expect(deserializedTx.method === 'transferV2' && deserializedTx.amount === 200);
    }, 10000);
})

