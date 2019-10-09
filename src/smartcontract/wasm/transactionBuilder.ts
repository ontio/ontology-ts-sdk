import { Transaction, TxType } from './../../transaction/transaction';

import Fixed64 from '../../common/fixed64';
import { Address } from '../../crypto';
import InvokeCode from '../../transaction/payload/invokeCode';
import { writeVarBytes } from '../../utils';
import { buildWasmContractParam } from './../../transaction/scriptBuilder';
import { Parameter } from './../abi/parameter';

export function buildWasmVmInvokeCode(contractaddress: Address, params: Parameter[]): string {
    let result = '';
    result += contractaddress.serialize();
    const args = buildWasmContractParam(params);
    result += writeVarBytes(args);
    return result;
}

export function makeWasmVmInvokeTransaction(
    contractAddress: Address,
    params: Parameter[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const tx = new Transaction();
    tx.type = TxType.InvokeWasm;

    const code = buildWasmVmInvokeCode(contractAddress, params);
    const payload = new InvokeCode();
    payload.code = code;
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
