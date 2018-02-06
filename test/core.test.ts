import * as core from '../src/core'
import * as utils from '../src/utils'

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

})