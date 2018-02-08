import {EventEmitter} from '../src/utils'

describe('test EeventEmitter', () => {

    var eventEmitter : EventEmitter
    var result : string

    const ASYNC = 'ASYNC',
        ASYNC_HAPPENED = 'ASYNC_HAPPENED',
        SYNC = 'SYNC',
        SYNC_HAPPENED = 'SYNC_HAPPENED'

    beforeAll(()=>{
        result = ''
        eventEmitter = new EventEmitter()
    })

    test('test acync event', () => {
        eventEmitter.on(ASYNC, (event?:any) => {
            result = ASYNC_HAPPENED
        })

        setTimeout(()=>{
            eventEmitter.trigger(ASYNC)
            expect(result).toEqual(ASYNC_HAPPENED)
        },1000)
    })

    test('test sync event', () => {
        eventEmitter.on(SYNC, ()=>{
            result = SYNC_HAPPENED
        })
        eventEmitter.trigger(SYNC)
        expect(result).toEqual(SYNC_HAPPENED)
    })
})