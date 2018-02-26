import { Identity } from '../src/identity'
import * as core from '../src/core'
import * as utils from '../src/utils'
import {ERROR_CODE} from '../src/error'

describe('test identity', () => {

    var privateKey: string,
        identityDataStr: string,
        identity: Identity,
        encryptedPrivateKey

    beforeAll(() => {
        privateKey = utils.ab2hexstring(core.generatePrivateKey());
    })

    test('test create', () => {
        identity = new Identity()
        identity.create(privateKey, '123456', 'mickey')
        encryptedPrivateKey = identity.controls[0].key
        identityDataStr = identity.toJson()
        expect(identityDataStr).toBeDefined()
    })

    test('test import with correct password', () => {
        console.log('encryptedkey: ' + encryptedPrivateKey)
        let a 
        try {
         a = Identity.importIdentity(identityDataStr, encryptedPrivateKey, '123456', '')
        } catch(err) {
            console.log(err)
        }
        expect(a.label).toBe('mickey')
    })

    test('test import with incorrect password', () => {
        try {
            let a = Identity.importIdentity(identityDataStr, encryptedPrivateKey, '123457', '')
        } catch (err) {
            console.log(err)
            expect(err).toEqual(ERROR_CODE.Decrypto_ERROR)
        }
    })

})