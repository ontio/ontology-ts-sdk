
import {num2hexstring, StringReader, num2VarInt, ab2hexstring} from '../utils'
import Payload from './payload/payload'
import txAttributeUsage from './txAttributeUsage'
import TransactionAttribute from './txAttribute'
import Program from './Program'
import AbiFunction from '../Abi/AbiFunction'
import InvokeCode from './payload/InvokeCode';
import DeployCode from './payload/DeployCode';
import UTXOInput from './UTXOInput'
import TXOutput from './txOutput'
import Fixed64 from '../common/Fixed64'

export enum TxType  {
    BookKeeping     = 0x00 ,
	IssueAsset      = 0x01 ,
	BookKeeper      = 0x02 ,
	PrivacyPayload  = 0x20 ,
	RegisterAsset   = 0x40 ,
	TransferAsset   = 0x80 ,
	Record          = 0x81 ,
	DeployCode      = 0xd0 ,
	InvokeCode      = 0xd1 ,
	DataFile        = 0x12 
}

class Transaction {

    type : number = 0xd1

    version : number = 0x00

    payload : Payload

    txAttributes : Array<TransactionAttribute> = []

    UTXOInputs : Array<UTXOInput> = []

    outputs : Array<TXOutput> = []

    systemFee: Fixed64 

    programs : Array<Program> = []

    //cache only, needn't serialize
    referTx : Array<TXOutput>
    hash: string
    networkFee : Fixed64

    constructor () {
       this.hash = ''
       this.systemFee = new Fixed64()
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

        console.log('last3:' + result.substring(result.length-12))
        //serialize transaction attributes
        result += num2hexstring(this.txAttributes.length)
        for (let i = 0; i < this.txAttributes.length; i++) {
            result += this.txAttributes[i].serialize()
        }
        console.log('position: '+ result.length)
        //input
        result += num2hexstring(this.UTXOInputs.length)
        for (let i=0 ; i< this.UTXOInputs.length; i++) {
            result += this.UTXOInputs[i].serialize()
        }

        //output
        result += num2hexstring(this.outputs.length)
        for (let i = 0; i < this.outputs.length; i++) {
            result += this.outputs[i].serialize()
        }
        //gas
        result += this.systemFee.serialize()

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
        let payload
        switch (tx.type) {
            case TxType.InvokeCode :
                payload = new InvokeCode()
                break;

            case TxType.DeployCode:
                payload = new DeployCode()
                break;
            default :
                payload = new InvokeCode()
        }
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
        const inputLen = ss.readNextLen()
        for (let i = 0; i< inputLen; i++) {
            let input = UTXOInput.deserialize(ss)
            tx.UTXOInputs.push(input)
        }
        //output
        const outLen = ss.readNextLen()
        for (let i = 0; i < inputLen; i++) {
            let output = TXOutput.deserialize(ss)
            tx.outputs.push(output)
        }
        //gas '0000000000000000'
        tx.systemFee = Fixed64.deserialize(ss)

        const programLength = ss.readNextLen()
        for (let i = 0; i < programLength; i++) {
            tx.programs.push(Program.deserialize(ss))
        }


        return tx

    }


}

export default Transaction