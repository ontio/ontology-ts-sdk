
import {num2hexstring, StringReader, num2VarInt, ab2hexstring, hex2VarBytes} from '../utils'
import Payload from './payload/payload'
import {TransactionAttribute} from './txAttribute'
import Program from './Program'
import AbiFunction from '../Abi/AbiFunction'
import InvokeCode from './payload/InvokeCode';
import DeployCode from './payload/DeployCode';
import UTXOInput from './UTXOInput'
import TXOutput from './txOutput'
import Fixed64 from '../common/Fixed64'
import Uint160 from '../common/Uint160';
import Uint256 from '../common/uint256';

export enum TxType  {
    BookKeeping     = 0x00,
	IssueAsset      = 0x01,
	BookKeeper      = 0x02,
	Claim           = 0x03,
	PrivacyPayload  = 0x20,
	RegisterAsset   = 0x40,
	TransferAsset   = 0x80,
	Record          = 0x81,
	Deploy          = 0xd0,
	Invoke          = 0xd1,
	DataFile        = 0x12,
	Enrollment      = 0x04,
	Vote            = 0x05
}

export const TxName = {
    BookKeeping: "BookKeeping",
    IssueAsset: "IssueAsset",
    BookKeeper: "BookKeeper",
    Claim: "Claim",
    PrivacyPayload: "PrivacyPayload",
    RegisterAsset: "RegisterAsset",
    TransferAsset: "TransferAsset",
    Record: "Record",
    Deploy: "Deploy",
    Invoke: "Invoke",
    DataFile: "DataFile",
    Enrollment: "Enrollment",
    Vote: "Vote"
}

export class Fee {
    amount : Fixed64
    payer : Uint160
}

export class PubKey {
    x : string
    y : string

    constructor(x: string, y: string) {
        this.x = x
        this.y = y
    }

    serialize() {
        let result = ''
        result += hex2VarBytes(this.x)
        result += hex2VarBytes(this.y)
        return result
    }
    static deserialize(sr : StringReader) {
        let x = sr.readNextBytes()
        let y = sr.readNextBytes()
        return new PubKey(x, y)
    }
}

export class Sig {
    pubKeys : Array<PubKey>
    //M uint8
    M       : number
    //sigData hexstrings array
    sigData : Array<string>

    serialize() {
        let result = ''
        result += num2hexstring(this.pubKeys.length)
        for (let i=0; i< this.pubKeys.length; i++) {
            result += this.pubKeys[i].serialize()
        }
        result += num2hexstring(this.M)

        result += num2hexstring(this.sigData.length)
        for(let i=0; i< this.sigData.length; i++) {
            result += hex2VarBytes(this.sigData[i])
        }
        return result
    }

    static deserialize(sr : StringReader) {
        let sig = new Sig()
        sig.pubKeys = []
        let pubKeyLength = sr.readNextLen()
        for(let i=0; i < pubKeyLength; i++) {
            let pk = PubKey.deserialize(sr)
            sig.pubKeys.push(pk)
        }
        sig.M = sr.readNextLen()
        sig.sigData = []
        let dataLength = sr.readNextLen()
        for(let i=0; i<dataLength; i++) {
            let data = sr.readNextBytes()
            sig.sigData.push(data)
        }
        return sig
    }
}

export class Transaction {

    type : TxType = 0xd1

    version : number = 0x00

    payload : Payload

    //hexstring for uint32 = 4bytes 
    nonce : string

    txAttributes : Array<TransactionAttribute> = []

    fee : Array<Fee> = []

    networkFee : Fixed64

    sigs : Array<Sig> = []

    hash : Uint256

    constructor () {
        this.networkFee = new Fixed64()
    }

    serialize () : string {
        let unsigned = this.serializeUnsignedData()
        let signed = this.serializeSignedData()

        return unsigned + signed
    }

    serializeUnsignedData() {
        let result = ''
        result += num2hexstring(this.version)
        result += num2hexstring(this.type)
        //nonce 4bytes
        result += this.nonce
        result += this.payload.serialize()

        //serialize transaction attributes
        result += num2hexstring(this.txAttributes.length)
        for (let i = 0; i < this.txAttributes.length; i++) {
            result += this.txAttributes[i].serialize()
        }
        result += num2hexstring(this.fee.length)
        for (let i=0 ; i< this.fee.length; i++) {
            result += this.fee[i].amount.serialize()
            result += this.fee[i].payer.serialize()
        }

        if(this.networkFee) {
            result += this.networkFee.serialize()
        }
        //gas
        // result += this.systemFee.serialize()

        return result
    }

    serializeSignedData() {
        let result = ''
        //programs
        result += num2hexstring(this.sigs.length)
        for (let i = 0; i < this.sigs.length; i++) {
            result += this.sigs[i].serialize()
        }

        return result
    }



    static deserialize (hexstring : string) : Transaction {
        let tx = new Transaction()
    
        // console.log(' hexstring' + hexstring)
        let ss = new StringReader(hexstring)

        tx.version = parseInt(ss.read(1), 16)
        tx.type = parseInt(ss.read(1), 16)
        tx.nonce = ss.read(4)
        let payload
        switch (tx.type) {
            case TxType.Invoke :
                payload = new InvokeCode()
                break;

            case TxType.Deploy:
                payload = new DeployCode()
                break;
            default :
                payload = new InvokeCode()
        }
        payload.deserialize(ss)
        tx.payload = payload
        tx.txAttributes = []
        tx.sigs = []

        const attributeLength = ss.readNextLen()
        for (let i = 0; i < attributeLength; i++) {
            let txAttribute = new TransactionAttribute()
            txAttribute.deserialize(ss)
            tx.txAttributes.push(txAttribute)
        }

        const feeLength = ss.readNextLen()
        for(let i=0; i< feeLength; i++) {
            let fee = new Fee()
            fee.amount = Fixed64.deserialize(ss)
            fee.payer = Uint160.deserialize(ss)
            tx.fee.push(fee)
        }

        const networkFee = Fixed64.deserialize(ss)
        tx.networkFee = networkFee

        const sigLength = ss.readNextLen()
        for (let i = 0; i < sigLength; i++) {
            tx.sigs.push(Sig.deserialize(ss))
        }

        return tx

    }


}

