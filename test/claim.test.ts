import {Claim , Metadata } from '../src/claim'
import {generatePrivateKeyStr, signatureData} from '../src/core'

describe('test claim', () => {

    var claimData = {
        name : 'zhangsan',
        age : 25
    }
    var context = 'claim:standard0001'
    var metaData = new Metadata()
    metaData.CreateTime = "2017-01-01T22:01:20Z";
    metaData.Issuer = "did:ont:8uQhQMGzWxR8vw5P3UWH1j";
    metaData.Subject = "did:ont:4XirzuHiNnTrwfjCMtBEJ6";
    metaData.Expires = "2018-01-01";
    metaData.Revocation = "RevocationList";
    metaData.Crl = "http://192.168.1.1/rev.crl";

    var claim : Claim,
        privateKey : string

    beforeAll(() => {
        privateKey = generatePrivateKeyStr()
    })

    test('test sign claim', () => {
        claim = new Claim(context, claimData, metaData)
        let signed = claim.sign(privateKey)
        expect(signed).toBeDefined()
    })

    test('make a signature', ()=>{
        let signed = signatureData(claim.unsignedData, privateKey)
        let signatureValue = claim.Signature.Value
        expect(signed).toEqual(signatureValue)
    })
})