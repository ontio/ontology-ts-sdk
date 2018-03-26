import * as core from '../src/core'
import * as utils from '../src/utils'
import * as scrypt from '../src/scrypt'
import { ab2hexstring } from '../src/utils';
import { verifySignature } from '../src/core';

describe('test core', ()=>{

    var privateKey:string,
        wifKey:string

    beforeAll(() => {
        privateKey = utils.ab2hexstring( core.generatePrivateKey() )
    })

    test('test getWIFFromPrivateKey', () => {
        wifKey = core.getWIFFromPrivateKey(privateKey)
        expect(wifKey).toBeDefined()
    })

    test('test getPrivateKeyFromWIF', () => {
        let key = core.getPrivateKeyFromWIF(wifKey)
        expect(key).toEqual(privateKey)
    })

    test('get public key', () => {
        let pkBuffer = core.getPublicKey(privateKey, true)
        let pk = utils.ab2hexstring(pkBuffer)
        console.log('get pk: ' + pk)
        expect(pk).toBeDefined()
    })

    test('encrypt private key', () => {
        let privateKey = 'b02304dcb35bc9a055147f07b2a3291db4ac52f664ec38b436470c98db4200d9'
        let wif = core.getWIFFromPrivateKey(privateKey)
        let encrypt = scrypt.encrypt(wif, '123456')
        console.log('encrypt: '+ encrypt)
    })

    test('sign and verify', () => {
        let privateKey = core.generatePrivateKeyStr()
        let data = 'hello world'
        let signed = core.signatureData(data, privateKey)
        console.log('signed: '+ signed)

        let pk = ab2hexstring(core.getPublicKey(privateKey, false))
        let verifyResult = core.verifySignature(data, signed, pk)
        expect(verifySignature).toBeTruthy()
    })

})