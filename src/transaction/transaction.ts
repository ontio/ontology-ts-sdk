
import {num2hexstring, StringStream, num2VarInt, ab2hexstring} from '../utils'
import InvokeCode from './InvokeCode'
import txAttributeUsage from './txAttributeUsage'
import TransactionAttribute from './txAttribute'
import Program from './Program'
import AbiFunction from '../Abi/AbiFunction'

class Transaction {
    hash : string
    type : number
    version : number
    payload : InvokeCode
    txAttributes : [TransactionAttribute]
    UTXOInput : number
    TXOutput : number
    gas : string
    programs : [Program]

    constructor (tx={}) {
        //type
        this.type = tx.type || 128

        //version
        this.version = tx.version || 0

        //payload
        this.payload = tx.payload
        
        this.txAttributes = tx.txAttributes || []

        this.UTXOInput = tx.UTXOInput || 0x00
        this.TXOutput = tx.TXOutput || 0x00
        this.gas = '0000000000000000'

        // this.balanceInputs = tx.balanceInputs || []

        // this.outputs = tx.outputs || []

        this.programs = tx.programs || []

        //Inputs/Outputs map base on Asset (needn't serialize)
        // this.assetOutputs = tx.assetOutputs
        // this.assetInputAmount = tx.assetInputAmount
        // this.assetOutputAmount = tx.assetOutputAmount
    }

    serialize (privateKey : string) : string {
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
        let tx = {}
        console.log(' hexstring' + hexstring)
        let ss = new StringStream(hexstring)

        console.log(ss.str)
        tx.type = parseInt(ss.read(1), 16)
        tx.version = parseInt(ss.read(1), 16)
        let payload = new InvokeCode()
        payload.deserialize(ss)
        tx.payload = payload
        tx.txAttributes = []
        tx.programs = []

        const attributeLength = ss.readVarInt()
        for (let i = 0; i < attributeLength; i++) {
            let txAttribute = new TransactionAttribute()
            txAttribute.deserialize(ss)
            tx.txAttributes.push(txAttribute)
        }

        //input
        tx.UTXOInput = ss.readVarInt()
        //output
        tx.TXOutput = ss.readVarInt()
        //gas '0000000000000000'
        tx.gas = ss.read(8)

        const programLength = ss.readVarInt()
        for (let i = 0; i < programLength; i++) {
            tx.programs.push(Program.deserialize(ss))
        }


        return new Transaction(tx)

    }


}

export default Transaction