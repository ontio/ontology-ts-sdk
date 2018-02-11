import AbiFunction from './AbiFunction'
import Transaction  from '../transaction/transaction';
import InvokeCode from '../transaction/InvokeCode'
import TransactionAttribute from '../transaction/txAttribute'
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';

export default class AbiInfo {
    hash : string
    entrypoint : string
    functions : Array<AbiFunction> = []

    constructor() {

    }

    getHash() : string {
        return this.hash
    }

    getEntryPoint() : string {
        return this.entrypoint
    }

    getFunction(name : string) : AbiFunction {
        let f = (<AbiFunction>{})
        for(let v of this.functions) {
            if(v.name === name) {
                return new AbiFunction(v.name,v.returntype,v.parameters)
            }
        }
        return f
    }

    static parseJson(json : string) : AbiInfo {
        let a = new AbiInfo()
        let obj = JSON.parse(json)
        a.hash = obj.hash
        a.entrypoint = obj.entrypoint
        a.functions = obj.functions
        return a
    }


}