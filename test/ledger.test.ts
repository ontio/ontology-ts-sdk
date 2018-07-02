import * as CONST from '../src/consts';
import { Address, CurveLabel, KeyType, SignatureScheme } from '../src/crypto';
import { LedgerKey } from '../src/crypto/ledger';
import * as OntAssetTxBuilder from '../src/smartcontract/nativevm/ontAssetTxBuilder';
import * as utils from '../src/utils';

// tslint:disable : no-console
describe('test Ledger', () => {

    test('create Ledger key', async () => {
        const key = await LedgerKey.create(0);
        const pKey = key.getPublicKey();

        expect(pKey).toBeDefined();
        expect(pKey.key).toBeDefined();
        expect(pKey.algorithm).toBe(KeyType.ECDSA);
        expect(pKey.parameters.curve).toBe(CurveLabel.SECP256R1);
    });

    test('create multiple Ledger keys', async () => {
        const key1 = await LedgerKey.create(0);
        const pKey1 = key1.getPublicKey();

        const key2 = await LedgerKey.create(1);
        const pKey2 = key2.getPublicKey();

        expect(pKey1.key === pKey2.key).toBeFalsy();
    });

    test('sign with Ledger and verify', async () => {
        const tx = OntAssetTxBuilder.makeTransferTx(
            'ONT',
            new Address('AZ7iBezpZByGvUmXXdhfvLXM6cnQgXMiR7'),
            new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP'),
            '10',
            '0',
            `${CONST.DEFAULT_GAS_LIMIT}`
        );

        const data = tx.serialize();

        const key = await LedgerKey.create(0);
        const pKey = key.getPublicKey();

        const signature = await key.sign(data);

        expect(signature.algorithm).toBe(SignatureScheme.ECDSAwithSHA256);
        expect(signature.value).toBeDefined();

        const verifyResult = await pKey.verify(data, signature);
        expect(verifyResult).toBeTruthy();
    }, 20000);

});
