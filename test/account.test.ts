import {Account, accountData} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'

describe('test account', ()=>{
  
    var privateKey:string,
        accountDataStr:string,
        account:Account

    beforeAll(()=>{
        privateKey = utils.ab2hexstring(core.generatePrivateKey());    
    })

    test('test createSecp256r1', ()=>{
        account = new Account()
        accountDataStr = account.createSecp256r1(privateKey, '123456', 'mickey')
        expect(accountDataStr).toBeDefined()
    })
    test('test decrypt with correct password', () => {
        let a = new Account()
        let result = a.decrypt(JSON.parse(accountDataStr), "123456");

        expect(result).toBe(true)
        expect(privateKey).toEqual(a.privateKey)

    })


    test('test decrypt with incorrect password', () => {
        let a = new Account()
        let result = a.decrypt(JSON.parse(accountDataStr), "1234567");

        expect(result).toBe(false)
        expect(privateKey).not.toEqual(a.privateKey)
    })
})