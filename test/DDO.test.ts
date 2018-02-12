import {DDO} from '../src/transaction/DDO'

const hexstring =
    "000000260100000021039392ba7df4a7badc4cc498be257202f9bbb89c887502e9bcb96a6636ee050ba80000001c010000001700000004436572740000000b06537472696e6761626364"

describe('test ddo', () => {
    test('test ddo deserialize', () => {
        let ddo = DDO.deserialize(hexstring)
        console.log(JSON.stringify(ddo))
    })
})