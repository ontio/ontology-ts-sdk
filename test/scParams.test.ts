import { PrivateKey } from '../src/crypto/PrivateKey';
import { Struct } from '../src/index';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { makeInvokeTransaction } from '../src/transaction/transactionBuilder';
import { num2hexstring, reverseHex } from '../src/utils';
import { Address } from './../src/crypto/address';
import { Parameter, ParameterType } from './../src/smartcontract/abi/parameter';
import { signTransaction } from './../src/transaction/transactionBuilder';

describe('test smarct contract params', () => {
    test('test params Array', async () => {
        const socketClient = new WebsocketClient();
        const contract = reverseHex('f7bafc05ad1fc3822a1db1d195c7dc02959f073e');
        const contractAddr = new Address(contract);
        const method = 'TransferMulti';
        const from = new Address('AMxBvXdVasM1WApTS3ViCU9V8hiXYa4437');
        const to = new Address('AWyZRDzFp3c53VTLdyD1Z31gB4bUo8ojN4').serialize();
        const to2 = new Address('AQGkPm8KqQi4rRbhXX9N6FyjRSawtGwfUf').serialize();
        const amount = 100;

        const params = [
            new Parameter('args', ParameterType.Array,
                [
                    from.serialize(),
                    to,
                    100
                ]
            ),
            new Parameter('args', ParameterType.Array,
                [
                    from.serialize(),
                    to,
                    100
                ]
            )

        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', from);
        const pri = PrivateKey.deserializeWIF('KxRfVFzS6Wm3mAy8h1txuhRzkudN8j2kWAKdjs9FVptCx54HLL7r');
        signTransaction(tx, pri);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    }, 10000);
});
