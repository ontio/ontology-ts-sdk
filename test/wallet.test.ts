import {Wallet} from '../src/wallet'
import {Account, accountData} from '../src/account'
import * as core from '../src/core'
import * as utils from '../src/utils'
import * as scrypt from '../src/scrypt'

describe('test wallet', ()=>{
    var wallet:Wallet,
        walletDataStr:string
    beforeAll(()=>{
        console.log(Wallet)
        wallet = new Wallet()
        let privateKey = core.generatePrivateKeyStr()
        walletDataStr = wallet.create('mickey', '123456')
    })

    it('test create wallet with name and password', ()=>{
        expect(walletDataStr).toBeDefined()
    })

    it('test load wallet', () => {
        let privateKey = core.generatePrivateKeyStr()
        let wifKey = core.getWIFFromPrivateKey(privateKey)
        let encryptedKey = scrypt.encrypt(wifKey, '123456')

        let wallet = new Wallet()
        let result = wallet.loadWallet(encryptedKey, '123456', 'ontid')
        expect(result).not.toEqual('')

        result = wallet.loadWallet(encryptedKey, '1234567','ontud')
        expect(result).toEqual('')
    })

    it('test load identity', () => {
        let wallet = new Wallet()
        wallet.decryptWallet(walletDataStr)

        let privateKey = core.generatePrivateKeyStr()
        let wifKey = core.getWIFFromPrivateKey(privateKey)
        let encryptedKey = scrypt.encrypt(wifKey, '123456')

        wallet.loadIdentity(encryptedKey, '1234567', 'ontid')
        expect(wallet.wallet.identities.length).not.toEqual(2)

        wallet.loadIdentity(encryptedKey, '123456','ontid')
        expect(wallet.wallet.identities.length).toEqual(2)
    })

})