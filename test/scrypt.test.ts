import * as scrypt from '../src/scrypt'
import * as core from '../src/core'

describe('test scrypt', () => {
    it('test encrypt and decrypt', () => {
        let privateKey = core.generatePrivateKeyStr()
        let encrypt = scrypt.encrypt(privateKey, '123456')
        expect(encrypt).toBeDefined()

        let result = scrypt.decrypt(encrypt, '123456')
        expect(result).toEqual(privateKey)

        result = scrypt.decrypt(encrypt, '1234567')
        expect(result).not.toEqual(privateKey)
    })
})