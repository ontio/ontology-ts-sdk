import {makeInvokeTransaction} from '../src/transaction/makeTransactions'
import Transaction from '../src/transaction/transaction'
import Program from '../src/transaction/Program'
import { Identity } from '../src/identity'
import * as core from '../src/core'
import AbiInfo from '../src/Abi/AbiInfo'
import AbiFunction from '../src/Abi/AbiFunction'
import Parameter from '../src/Abi/parameter'
import json from './data/NeoContract1.abi'
import json2 from './data/NeoContract2.abi'
import {ab2hexstring, str2hexstr} from '../src/utils'

describe('test make invokecode tx', ()=> {

    var privateKey : string
    var publicKey : string
    var ontid : string

    beforeAll(()=>{
        privateKey = core.generatePrivateKeyStr()
        publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
    })

    test('test send register ontid tx', ()=>{
        //read contract

        let a = AbiInfo.parseJson(JSON.stringify(json))
        let f = a.getFunction('RegIdWithPublicKey')

        let id = new Identity()
        id.create(privateKey, '123456', 'mickey')

        ontid = str2hexstr(id.ontid)

        let p1 = new Parameter('id', 'ByteArray', ontid)
        let p2 = new Parameter('pk', 'ByteArray', publicKey)

        f.setParamsValue(p1, p2)
        let tx = makeInvokeTransaction(a.hash, f)
        let unsignedData = tx.serializeUnsignedData()
        let program = new Program()
        let signed = core.signatureData(unsignedData, privateKey)
        program.code = signed
        program.parameter = publicKey
        tx.programs = [program]

        let signedData = tx.serializeSignedData()
        let serialized = unsignedData + signedData
        console.log(serialized)

    })

    test('test get result of getDDO tx', ()=> {
        //getDDO
        let a = AbiInfo.parseJson(JSON.stringify(json2))
        let f = a.getFunction('GetDDO')

        let p1 = new Parameter('id', 'ByteArray', ontid)
        f.setParamsValue(p1)

        let tx = makeInvokeTransaction(a.hash, f)
        let unsignedData = tx.serializeUnsignedData()
        let program = new Program()
        let signed = core.signatureData(unsignedData, privateKey)
        program.code = signed
        program.parameter = publicKey
        tx.programs = [program]

        let signedData = tx.serializeSignedData()
        let serialized = unsignedData + signedData
        console.log(serialized)

        
        //websocket
        let socket = new WebSocket('ws://54.222.182.88:20336')
        socket.onopen = () => {
            console.log('Connected')
        }

        socket.onmessage = (event) => {
            console.log(event.data)
            //handle data
        }
    })
})