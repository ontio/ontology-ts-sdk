
import {num2hexstring, StringReader, num2VarInt, ab2hexstring} from '../utils'
import InvokeCode from './InvokeCode'
import txAttributeUsage from './txAttributeUsage'
import TransactionAttribute from './txAttribute'
import Program from './Program'
import AbiFunction from '../Abi/AbiFunction'

class Transaction {
    hash : string

    type : number = 0x80

    version : number = 0x00

    payload : InvokeCode

    txAttributes : Array<TransactionAttribute> = []

    UTXOInput : number = 0x00

    TXOutput : number = 0x00

    gas: string = '0000000000000000'

    programs : Array<Program> = []

    constructor () {
       
    }

    serialize () : string {
        let unsigned = this.serializeUnsignedData()
        let signed = this.serializeSignedData()

        return unsigned + signed
    }

    serializeUnsignedData() {
        let result = ''
        result += num2hexstring(this.type)
        result += num2hexstring(this.version)
        result += this.payload.serialize()

        //serialize transaction attributes
        result += num2hexstring(this.txAttributes.length)
        for (let i = 0; i < this.txAttributes.length; i++) {
            result += this.txAttributes[i].serialize()
        }
        //input
        result += num2VarInt(this.UTXOInput)

        //output
        result += num2VarInt(this.TXOutput)

        //gas
        result += this.gas 

        return result
    }

    serializeSignedData() {
        let result = ''
        //programs
        result += num2hexstring(this.programs.length)
        for (let i = 0; i < this.programs.length; i++) {
            result += this.programs[i].serialize()
        }

        return result
    }



    static deserialize (hexstring : string) : Transaction {
        let tx = new Transaction()
    
        // console.log(' hexstring' + hexstring)
        let ss = new StringReader(hexstring)

        tx.type = parseInt(ss.read(1), 16)
        tx.version = parseInt(ss.read(1), 16)
        let payload = new InvokeCode()
        payload.deserialize(ss)
        tx.payload = payload
        tx.txAttributes = []
        tx.programs = []

        const attributeLength = ss.readNextLen()
        for (let i = 0; i < attributeLength; i++) {
            let txAttribute = new TransactionAttribute()
            txAttribute.deserialize(ss)
            tx.txAttributes.push(txAttribute)
        }

        //input
        tx.UTXOInput = ss.readNextLen()
        //output
        tx.TXOutput = ss.readNextLen()
        //gas '0000000000000000'
        tx.gas = ss.read(8)

        const programLength = ss.readNextLen()
        for (let i = 0; i < programLength; i++) {
            tx.programs.push(Program.deserialize(ss))
        }


        return tx

    }


}

export default Transaction