import { Identity, identityData } from '../src/identity'
import * as core from '../src/core'
import * as utils from '../src/utils'

describe('test identity', () => {

    var privateKey: string,
        identityDataStr: string,
        identity: Identity

    beforeAll(() => {
        privateKey = utils.ab2hexstring(core.generatePrivateKey());
    })

    test('test createSecp256r1', () => {
        identity = new Identity()
        identityDataStr = identity.createSecp256r1(privateKey, '123456', 'mickey')
        expect(identityDataStr).toBeDefined()
    })
    test('test decrypt with correct password', () => {
        let a = new Identity()
        let result = a.decrypt(JSON.parse(identityDataStr), "123456");
        expect(result).toBe(true)
        expect(privateKey).toEqual(a.privateKey[0])
    })

    test('test decrypt with incorrect password', () => {
        let a = new Identity()
        let result = a.decrypt(JSON.parse(identityDataStr), "1234567");
        expect(result).toBe(false)
        expect(privateKey).not.toEqual(a.privateKey[0])
    })

})