import { describe, expect, test } from '@jest/globals';
import { Address, PrivateKey, Signature } from '../../src/crypto';
import { Transaction } from '../../src/transaction/transaction';
import InvokeCode from '../../src/transaction/payload/invokeCode';
import {
    addSign, setSignerAddresses, signAllToTransaction, signTransaction,
    signTransactionAsync, signTx
} from '../../src/transaction/transactionBuilder';

const payer = new PrivateKey('01'.repeat(32));
const first = new PrivateKey('02'.repeat(32));
const second = new PrivateKey('03'.repeat(32));
const address = (key: PrivateKey) => Address.fromPubKey(key.getPublicKey());
const transaction = () => {
    const tx = new Transaction();
    tx.nonce = '01020304';
    tx.payload = new InvokeCode();
    (tx.payload as InvokeCode).code = '00';
    return tx;
};
const verify = (tx: Transaction) => {
    for (const sig of tx.sigs) {
        // Every witness must sign the same finalized unsigned data.
        expect(sig.pubKeys.some((key) => key.verify(tx, Signature.deserializeHex(sig.sigData[0])))).toBe(true);
    }
};

describe('extraSigners', () => {
    test('deduplicates addresses and round trips the complete signer set', () => {
        const tx = transaction();
        setSignerAddresses(tx, address(payer), address(first), address(second), address(first));
        expect(tx.extraSigners.map((a) => a.serialize())).toEqual([address(first), address(second)].map((a) => a.serialize()));
        const parsed = Transaction.deserialize(tx.serialize());
        expect(parsed.serialize()).toBe(tx.serialize());
        expect(parsed.extraSigners.length).toBe(2);
    });

    test('finalizes all addresses before signing', () => {
        const tx = transaction();
        signAllToTransaction(tx, payer, first, payer);
        expect(tx.sigs.length).toBe(2);
        expect(tx.extraSigners[0].serialize()).toBe(address(first).serialize());
        verify(tx);
        verify(Transaction.deserialize(tx.serialize()));
        expect(() => setSignerAddresses(tx, address(second))).toThrow();
    });

    test('adds the first signer to an existing payer before hashing', () => {
        const tx = transaction();
        tx.payer = address(payer);
        signTransaction(tx, first);
        const hash = tx.getSignContent();
        addSign(tx, payer);
        expect(tx.getSignContent()).toBe(hash);
        verify(tx);
        expect(() => addSign(tx, second)).toThrow(/not declared/);
        expect(tx.getSignContent()).toBe(hash);
    });

    test('async signing declares the signer', async () => {
        const tx = transaction();
        tx.payer = address(payer);
        await signTransactionAsync(tx, first);
        expect(tx.extraSigners[0].serialize()).toBe(address(first).serialize());
        verify(tx);
    });

    test('uses the multisig address instead of individual key addresses', () => {
        const tx = transaction();
        const keys = [first.getPublicKey(), second.getPublicKey()];
        signTx(tx, 2, keys, first);
        const hash = tx.getSignContent();
        signTx(tx, 2, keys, second);
        expect(tx.payer.serialize()).toBe(Address.fromMultiPubKeys(2, keys).serialize());
        expect(tx.extraSigners).toEqual([]);
        expect(tx.getSignContent()).toBe(hash);
        expect(tx.sigs[0].sigData.length).toBe(2);
    });

    test('matches the Go unsigned wire layout and preserves empty-list encoding', () => {
        const tx = transaction();
        const prefix = '00d101020304' + '00'.repeat(16);
        const emptyPayer = '00'.repeat(20);
        expect(tx.serializeUnsignedData()).toBe(prefix + emptyPayer + '010000');
        setSignerAddresses(tx, address(payer), address(first));
        expect(tx.serializeUnsignedData()).toBe(prefix + address(payer).serialize()
            + '010001' + address(first).serialize());
    });

    test('rejects duplicate and oversized signer lists', () => {
        const tx = transaction();
        setSignerAddresses(tx, address(payer), address(first));
        const raw = tx.serialize();
        const offset = tx.serializeUnsignedData().length - 42;
        const prefix = raw.slice(0, offset);
        expect(() => Transaction.deserialize(prefix + '10')).toThrow(/Too many/);
        expect(() => Transaction.deserialize(prefix + '01' + address(payer).serialize() + '00'))
            .toThrow(/Duplicate/);
        expect(() => Transaction.deserialize(prefix + '01abcd')).toThrow();
        tx.extraSigners = [address(payer)];
        expect(() => tx.serialize()).toThrow(/Duplicate/);
    });

    test('enforces the signer count without changing payer on failure', () => {
        const tx = transaction();
        const original = tx.payer;
        expect(() => setSignerAddresses(tx)).toThrow();
        const addresses = Array.from({ length: 17 }, (_, i) => new Address(i.toString(16).padStart(40, '0')));
        expect(() => setSignerAddresses(tx, ...addresses)).toThrow();
        expect(tx.payer).toBe(original);
    });
});
