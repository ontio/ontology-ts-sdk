import {Wallet} from '../src/wallet'
import {Account, accountData} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'


describe('test wallet', ()=>{
    var wallet:Wallet,
        walletDataStr:string
    beforeAll(()=>{
        console.log(Wallet)
        wallet = new Wallet()
        walletDataStr = wallet.create('mickey', '123456')
    })

    it('test create wallet with name and password', ()=>{
        expect(walletDataStr).toBeDefined()
    })

    it('test wallet decrypt', ()=>{
        let result = wallet.decrypt(walletDataStr, '123456')
        expect(result).toBe(0)
    })

    it('test add account', () => {
        let privateKey = utils.ab2hexstring(core.generatePrivateKey());    
        let account = new Account()
        account.createSecp256r1(privateKey, '123456', 'mickey')
        wallet.addAccount(account.account)
        expect(wallet.wallet.accounts.length).toEqual(2)
        expect(wallet.wallet.accounts[1].label).toEqual('mickey')

        //test repeat add
        wallet.addAccount(account.account)
        expect(wallet.wallet.accounts.length).not.toEqual(2)
    })

})