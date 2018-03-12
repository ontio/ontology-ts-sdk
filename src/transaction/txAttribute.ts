import TransactionAttributeUsage from './txAttributeUsage'
import { num2hexstring, StringReader, num2VarInt, str2hexstr, ab2hexstring } from '../utils';
import { Transaction } from '../transaction';
import { userInfo } from 'os';
import {generateRandomArray} from '../core'
/**
 *TransactionAttribute
 * @property {number} usage - Identifying byte
 * @property {string} data - Data
 */
export default class TransactionAttribute {
    usage: TransactionAttributeUsage
    //data.length is 0x14
    data: string

    //8 bytes hex string
    // nonce : string

    constructor(){
        // this.nonce = ab2hexstring(generateRandomArray(8))
    }

    serialize() : string {
        let result = ''
        result += num2hexstring(this.usage)
        // result += this.nonce
        result += num2VarInt(this.data.length/2)
        result += this.data        
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
