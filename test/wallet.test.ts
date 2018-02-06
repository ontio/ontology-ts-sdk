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

    it('test import wallet', () => {
        let privateKey = core.generatePrivateKeyStr()
        let wifKey = core.getWIFFromPrivateKey(privateKey)
        let encryptedKey = scrypt.encrypt(wifKey, '123456')

        let wallet = new Wallet()
        let result = wallet.importWallet(encryptedKey, '123456', 'ontid')
        expect(result).not.toEqual('')

        result = wallet.importWallet(encryptedKey, '1234567','ontud')
        expect(result).toEqual('')
    })

    it('test import identity', () => {
        let wallet = new Wallet()

        let privateKey = core.generatePrivateKeyStr()
        let wifKey = core.getWIFFromPrivateKey(privateKey)
        let encryptedKey = scrypt.encrypt(wifKey, '123456')

        wallet.importIdentity(walletDataStr ,encryptedKey, '1234567', 'ontid')
        expect(wallet.wallet.identities.length).not.toEqual(2)

        wallet.importIdentity(walletDataStr, encryptedKey, '123456','ontid')
        expect(wallet.wallet.identities.length).toEqual(2)
    })

})