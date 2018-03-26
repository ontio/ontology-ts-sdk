/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */

 
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