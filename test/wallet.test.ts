import {Wallet} from '../src/wallet'
import {Account} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'
import * as scrypt from '../src/scrypt'
import { Identity } from '../src/identity';

describe('test wallet', ()=>{
    var wallet:Wallet,
        walletDataStr:string
    beforeAll(()=>{
        console.log(Wallet)
        wallet = new Wallet()
        let privateKey = core.generatePrivateKeyStr()
        wallet.create('mickey')
        walletDataStr = wallet.toJson()
    })

    it('test create wallet with name and password', ()=>{
        expect(walletDataStr).toBeDefined()
    })

    it('test add identity', () => {
        let privateKey = core.generatePrivateKeyStr()

        let identity = new Identity()
        identity.create(privateKey, '123456', 'mickey')
        wallet.addIdentity(identity)
        expect(wallet.identities.length).toEqual(1)
    })

    it('test add account', () => {
        let privateKey = core.generatePrivateKeyStr()
        let ac = new Account()
        ac.create(privateKey, '123456', 'mickey')
        wallet.addAccount(ac)
        expect(wallet.accounts.length).toEqual(1)
    })

})