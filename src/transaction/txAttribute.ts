import { num2hexstring, StringReader, num2VarInt, str2hexstr, ab2hexstring, hex2VarBytes } from '../utils';
import { Transaction } from '../transaction';
import { userInfo } from 'os';
import {generateRandomArray} from '../core'

export enum TransactionAttributeUsage {
    Nonce           = 0x00,
	Script          = 0x20,
	DescriptionUrl  = 0x81,
	Description     = 0x90
}

function isValidAttributeType(usage : TransactionAttributeUsage) : boolean {
    return usage === TransactionAttributeUsage.Nonce || usage === TransactionAttributeUsage.Script
        || usage === TransactionAttributeUsage.Description || usage === TransactionAttributeUsage.DescriptionUrl
}

/**
 *TransactionAttribute
 * @property {number} usage - Identifying byte
 * @property {string} data - Data
 */
export class TransactionAttribute {
    usage: TransactionAttributeUsage
    //hexstring 
    data: string

    //hexstring for uint32
    size: string

    constructor(){
        
    }

    serialize() : string {
        let result = ''
        result += num2hexstring(this.usage)
        // result += this.nonce
        if(!isValidAttributeType(this.usage)) {
            throw new Error('[TxAttribute] error, Unsupported attribute Description.')
        }
        result += hex2VarBytes(this.data)       
        return result
    }

    deserialize( ss : StringReader) : void {
        //usage
        const usage = parseInt(ss.read(1), 16)
        //nonce
        // const nonce = ss.read(8)
        //get hash with publicKey
        const dataLen = ss.readNextLen()
        const data = ss.read(dataLen)
        this.usage = usage
        // this.nonce = nonce
        this.data = data
    }
}
