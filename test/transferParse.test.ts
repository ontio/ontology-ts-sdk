import { NATIVE_INVOKE_NAME } from '../src/consts';
import { Address } from '../src/crypto/address';
import { deserializeTransferTx,
    makeTransferTx, makeWithdrawOngTx } from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import opcode from '../src/transaction/opcode';
import { pushHexString, pushInt } from '../src/transaction/scriptBuilder';
import { num2hexstring, str2hexstr, StringReader } from '../src/utils';

describe('parse transfer tx', () => {
    const from = new Address('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
    const to = new Address('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
    test('transfer 15 ONT', () => {
        const tx = makeTransferTx('ONT', from, to, 15, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(15);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('ONT');
        // console.log(tx);
    });

    test('transfer 10000 ONT', () => {
        const tx = makeTransferTx('ONT', from, to, 10000, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(10000);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('ONT');
        // console.log(tx);
    });

    test('transfer 0.33 ONG', () => {
        const tx = makeTransferTx('ONG', from, to, 0.33 * 1e9, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(0.33 * 1e9);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('ONG');
        // console.log(tx);
    });

    test('transfer 123 ONG', () => {
        const tx = makeTransferTx('ONG', from, to, 123 * 1e9, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(123 * 1e9);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('ONG');
        // console.log(tx);
    });

    test('transferFrom 1.533 ONG', () => {
        const tx = makeWithdrawOngTx(from, from, 1.533 * 1e9, from, '500', '20000');
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(1.533 * 1e9);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.tokenType).toEqual('ONG');
    });

});
