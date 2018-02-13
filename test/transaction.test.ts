import {makeInvokeTransaction} from '../src/transaction/makeTransactions'
import Transaction from '../src/transaction/transaction'
import Program from '../src/transaction/Program'
import { Identity } from '../src/identity'
import * as core from '../src/core'
import AbiInfo from '../src/Abi/AbiInfo'
import AbiFunction from '../src/Abi/AbiFunction'
import Parameter from '../src/Abi/parameter'
import json from '../src/smartcontract/data/NeoContract1.abi'
import json2 from '../src/smartcontract/data/NeoContract2.abi'
import {ab2hexstring, str2hexstr} from '../src/utils'
import {axiosPost} from '../src/utils'
import { DEFAULT_ALGORITHM } from '../src/consts';

const tx_url = 'http://192.168.3.128:20335/api/v1/transaction'
const socket_url = 'ws://192.168.3.128:20335'
const Default_params = {
    "Action": "sendrawtransaction",
    "Version": "1.0.0",
    "Type": "",
    "Op" : "test"
}

describe('test make invokecode tx', ()=> {

    var privateKey : string
    var publicKey : string
    var ontid : string

    var abiInfo : AbiInfo
    var identity : Identity

    beforeAll(()=>{
        abiInfo = AbiInfo.parseJson(JSON.stringify(json2))
        // privateKey = core.generatePrivateKeyStr()
        // publicKey = ab2hexstring(core.getPublicKey(privateKey, true))
        // console.log('privatekey: ' + privateKey)
        // console.log('publick key: ' + publicKey)
        
        privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
        publicKey = '039392ba7df4a7badc4cc498be257202f9bbb89c887502e9bcb96a6636ee050ba8'   
        ontid =  '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b'    
        // identity = new Identity()
        // identity.create(privateKey, '123456', 'mickey')
        // ontid = str2hexstr(identity.ontid)
        console.log('ontid: ' + ontid)
    })

    test('test send register ontid tx', (done) =>{
        //read contract
        let f = abiInfo.getFunction('RegIdByPublicKey')

        let p1 = new Parameter('id', 'ByteArray', ontid)
        let p2 = new Parameter('pk', 'ByteArray', publicKey)

        f.setParamsValue(p1, p2)
        let tx = makeInvokeTransaction(abiInfo.hash, f)
        let unsignedData = tx.serializeUnsignedData()
        let program = new Program()
        let signed = core.signatureData(unsignedData, privateKey)
        program.code = signed
        program.parameter = publicKey
        tx.programs = [program]

        let signedData = tx.serializeSignedData()
        let serialized = unsignedData + signedData
        console.log('register tx: ' + serialized)
        // return axiosPost(tx_url, Object.assign({},Default_params, {Data : serialized})).then((res)=>{
        //     console.log('response: '+ JSON.stringify(res.data))
        // })
        let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))

        const socket = new WebSocket(socket_url)
        socket.onopen = ()=>{
            console.log('connected')
            socket.send(param)
        }
        socket.onmessage = (event) => {
            console.log('response for registerOntid: ' + JSON.stringify(event.data))
            socket.close()
            done()
        }
        socket.onerror = (event) => {
            //no server or server is stopped
            console.log(event)
            done()
        }
    })

    test('test addAttribute', (done) => {
         let f = abiInfo.getFunction('AddAttribute')
         let p1 = new Parameter('id', 'ByteArray', ontid)
         let p2 = new Parameter('path', 'ByteArray', str2hexstr('Cert'))
         let p3 = new Parameter('type', 'ByteArray', str2hexstr('String'))
         let p4 = new Parameter('value', 'ByteArray', str2hexstr('abcd'))
         let p5 = new Parameter('pk', 'ByteArray', publicKey)

         f.setParamsValue(p1, p2, p3, p4, p5)
         let tx = makeInvokeTransaction(abiInfo.hash, f)
         let unsignedData = tx.serializeUnsignedData()
         let program = new Program()
         let signed = core.signatureData(unsignedData, privateKey)
         program.code = signed
         program.parameter = publicKey
         tx.programs = [program]

         let signedData = tx.serializeSignedData()
         let serialized = unsignedData + signedData
         console.log('addAddribute tx: ' + serialized)
         // return axiosPost(tx_url, Object.assign({},Default_params, {Data : serialized})).then((res)=>{
         //     console.log('response: '+ JSON.stringify(res.data))
         // })
         let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized }))

         const socket = new WebSocket(socket_url)
         socket.onopen = () => {
             console.log('connected')
             socket.send(param)
         }
         socket.onmessage = (event) => {
             console.log('response for addAttribute: ' + JSON.stringify(event.data))
             socket.close()
             done()
         }
        socket.onerror = (event) => {
            console.log(event)
            done()
        }
    })

     test('test get result of getDDO tx', (done)=> {
        //getDDO
        let f = abiInfo.getFunction('GetDDO')

        let p1 = new Parameter('id', 'ByteArray', ontid)
        f.setParamsValue(p1)

        let tx = makeInvokeTransaction(abiInfo.hash, f)
        let unsignedData = tx.serializeUnsignedData()
        let program = new Program()
        let signed = core.signatureData(unsignedData, privateKey)
        program.code = signed
        program.parameter = publicKey
        tx.programs = [program]

        let signedData = tx.serializeSignedData()
        let serialized = unsignedData + signedData
        console.log('DDO : ' + serialized)
        let param = JSON.stringify(Object.assign({}, Default_params, { Data: serialized, Op : "PreExec" }))

        const socket = new WebSocket(socket_url)
        socket.onopen = () => {
            console.log('connected')
            socket.send(param)
        }
        socket.onmessage = (event) => {
            console.log('response for getDDO: ' + JSON.stringify(event.data))
            socket.close()
            done()
        }
         socket.onerror = (event) => {
             console.log(event)
             done()
         }
    }) 


})