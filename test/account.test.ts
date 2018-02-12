import {Account} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'

describe('test account', ()=>{
  
    var privateKey:string,
        accountDataStr:string,
        account:Account,
        encryptedPrivateKey : string

    beforeAll(()=>{
        privateKey = utils.ab2hexstring(core.generatePrivateKey());    
    })

    test('test create', ()=>{
        account = new Account()
        account.create(privateKey, '123456', 'mickey')
        encryptedPrivateKey = account.key
        accountDataStr = account.toJson()
        expect(accountDataStr).toBeDefined()
    })
    test('test import account with correct password', () => {
        let a
        try {
           a = Account.importAccount(accountDataStr, encryptedPrivateKey, '123456')
        } catch(err) {}

        expect(a.label).toBe('mickey')

    })


    test('test import  with incorrect password', () => {
        try {
            let a = Account.importAccount(accountDataStr,encryptedPrivateKey, '1234567')
        } catch(err) {
            expect(err).toEqual('Password error')
        }

    })
})