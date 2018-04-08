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

import {DDO} from '../src/transaction/ddo'

const hexstring =
    // "000000260100000021039392ba7df4a7badc4cc498be257202f9bbb89c887502e9bcb96a6636ee050ba80000001c010000001700000004436572740000000b06537472696e6761626364"

"0000002b0000000100000023120203fb3793c14e2233f01db2145307d179f0aa21ad239de61452cda4cc9278cbad2b000000d200000001000000ca00000046636c61696d3a623561383762656139326435323532356236656261336236373035393563663862396362623531653937326635636266663439396434383637376464656538610000007c044a534f4e7b2254797065223a224a534f4e222c2256616c7565223a7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e38222c22497373756572223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f61227d7d00000000"
describe('test ddo', () => {
    test('test ddo deserialize', () => {
        let ddo = DDO.deserialize(hexstring)
        console.log(JSON.stringify(ddo))
    })
})