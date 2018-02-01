import {Packet} from '../src/packet'

describe('test packet', ()=>{
    var packet:Packet,
        packetDataStr:string
    beforeAll(()=>{
        packet = new Packet()
        packetDataStr = packet.create('mickey', '123456')
    })

    it('test create packet with name and password', ()=>{
        expect(packetDataStr).toBeDefined()
    })

    it('test packet decrypt', ()=>{
        let result = packet.decrypt(packetDataStr, '123456')
        expect(result).toBe(0)
    })
})