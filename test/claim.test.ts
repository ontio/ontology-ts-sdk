import {Claim , Metadata } from '../src/claim'
import {generatePrivateKeyStr, signatureData} from '../src/core'

describe('test claim', () => {

    var claimData = {
        name : 'zhangsan',
        age : 25
    }
    var context = 'claim:standard0001'
    var metaData = new Metadata()
    metaData.createTime = "2017-01-01T22:01:20Z";
    metaData.issuer = "did:ont:8uQhQMGzWxR8vw5P3UWH1j";
    metaData.subject = "did:ont:4XirzuHiNnTrwfjCMtBEJ6";
    metaData.expires = "2018-01-01";
    metaData.revocation = "RevocationList";
    metaData.crl = "http://192.168.1.1/rev.crl";

    var claim : Claim,
        privateKey : string

    beforeAll(() => {
        privateKey = generatePrivateKeyStr()
    })

    test('test sign claim', () => {
        claim = new Claim(context, claimData, metaData, privateKey)
        let unsigned = claim.unsignedData
        let signed = claim.signedData

        expect(signed).toBeDefined()
    })

    test('make a signature', ()=>{
        let signed = signatureData(claim.unsignedData, privateKey)
        let signatureValue = claim.signature.value
        expect(signed).toEqual(signatureValue)
    })
})