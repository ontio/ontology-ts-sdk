
import Fixed64 from '../common/fixed64';
import { NATIVE_INVOKE_NAME } from '../consts';
import { Address } from '../crypto';
import { num2hexstring, str2hexstr } from '../utils';
import OPCODE from './opcode';
import InvokeCode from './payload/invokeCode';
import { pushHexString } from './program';
import { pushInt } from './scriptBuilder';
import { Transaction, TxType } from './transaction';
import { Transfer } from './transfer';

/**
 * Creates transaction to invoke native contract
 * @param funcName Function name of contract to call
 * @param params Parameters serialized in hex string
 * @param contractAddr Adderss of contract
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for transaction gas
 */
export function makeNativeContractTx(
    funcName: string,
    params: string,
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
) {
    let code = '';
    code += params;
    code += pushHexString(str2hexstr(funcName));
    code += pushHexString(contractAddr.serialize());
    code += pushInt(0);
    code += num2hexstring(OPCODE.SYSCALL);
    code += pushHexString(str2hexstr(NATIVE_INVOKE_NAME));
    const payload = new InvokeCode();
    payload.code = code;

    let tx: Transaction;
    if (funcName === 'transfer' || funcName === 'transferFrom') {
        tx = new Transfer();
    } else {
        tx = new Transaction();
    }

    tx.type = TxType.Invoke;
    tx.payload = payload;
    if (gasLimit) {
        tx.gasLimit = new Fixed64(gasLimit);
    }
    if (gasPrice) {
        tx.gasPrice = new Fixed64(gasPrice);
    }
    if (payer) {
        tx.payer = payer;
    }
    return tx;
}
