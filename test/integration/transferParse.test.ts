import { Signature } from '../../src/crypto';
import { Address } from '../../src/crypto/address';
import { deserializeTransferTx,
    makeTransferTx, makeWithdrawOngTx } from '../../src/smartcontract/nativevm/ontAssetTxBuilder';
import { addSign, signTransaction } from '../../src/transaction/transactionBuilder';
import { PrivateKey } from '../../src/crypto/PrivateKey';
import { PublicKey } from '../../src/crypto/PublicKey';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';
import { Transaction } from '../../src/transaction/transaction';

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
        expect(transfer.amount).toEqual('10000');
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

    test('oep11', async () => {
        const private1 = new PrivateKey('5f2fe68215476abb9852cfa7da31ef00aa1468782d5ca809da5c4e1390b8ee45');
        const private2 = new PrivateKey('49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221');

        const address1 = new Address('AQf4Mzu1YJrhz9f3aRkkwSm9n3qhXGSh4p');
        const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');

        // make tx
        const tx = makeTransferTx('ONT', address1, address2, 1, '500', '20000', address1);
        signTransaction(tx, private2);
        const txStr = tx.serialize();
        // deserialize tx
        const txObj = Transaction.deserialize(txStr);
        console.log(txObj.sigs);
        for (const sig of txObj.sigs) {
            if (sig.pubKeys.length !== sig.sigData.length) {
                // alert('Invalid signatures')
                return;
            }
            for (let i = 0 ; i < sig.pubKeys.length; i++) {
                if (sig.pubKeys[i].verify(tx, Signature.deserializeHex(sig.sigData[i]))) {
                    // alert('Verify signature failed');
                    return;
                }
            }
        }
        // add sig
        addSign(tx, private1);

        // send tx
        const socketClient = new WebsocketClient();
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
    }, 5000);

    test('hex', () => {
        const res = Buffer.from('AZ+qwfuOR6zlBfXbYr4N/TKzjUMKExB0bZsSN1MaDGR+aMpmwpDOYiMefCdDMVQzKkvy05+cW4EJmBycFuB/FdI=', 'base64').toString('hex');
        console.log(res);
    });

    test('sig', () => {
        const sigData = '01c6985632e146fc51d08773101830fe0e2d006f7377589e2a4d00fd986901d91628b3494401046e9f47c440a6b503b65b8a7e2b4d4bbc48aad54954bafe5cc1d3';
        const pk = new PublicKey('02f64df7d4cf8c604f2662ed1b9614986b803070c68bcfe09418f06776114d7ced');
        const pri = new PrivateKey('09dc431f249e9f0bacbfb525f631518bee8629167f62b5c79e55fa6fd39aea0c');
        const pk2 = pri.getPublicKey();
        console.log('pk2: ' + pk2.key);
        console.log('address: ' + Address.fromPubKey(pk2).toBase58());

        const sig = Signature.deserializeHex(sigData);
        const res = pk.verify('505c316ac990aaab268ce5f402a02198a686531d2af5d1eace055ed2d21a9962', sig);
        console.log('veeify: ' + res);
    });

    test('parseTx', () => {
        const tx = '00d102b56210f401000000000000400d0300000000004f4b954b7057611c02384f5756f6a34f56fc0a597500c66b144f4b954b7057611c02384f5756f6a34f56fc0a596a7cc8145ff0e5382aed9982f2137e1293256a6e9ab1e00c6a7cc80480c3c9016a7cc86c51c1087472616e736665721400000000000000000000000000000000000000020068164f6e746f6c6f67792e4e61746976652e496e766f6b6500014241018ab6942903d54ec88c42d0230b3ce405cd45cca1b9a1faf528b62ecc3f5b3041f2461d37b66e26cfae31ffa688c86206aed725ca7e84c1609890a0f2caebde2f232102981da02fcd82a1647f76935c377f00d5c6d541f346d3abdbb172cf6b9300adc7ac';
        console.log(JSON.stringify(deserializeTransferTx(tx)));
    })

});
