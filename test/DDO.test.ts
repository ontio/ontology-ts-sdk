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

"00000026010000002103fb3793c14e2233f01db2145307d179f0aa21ad239de61452cda4cc9278cbad2b000000d702000000a400000020b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a0000007c044a534f4e7b2254797065223a224a534f4e222c2256616c7565223a7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e38222c22497373756572223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f61227d7d0000002a0000000d436c61696d3a747769747465720000001506537472696e6777616e6731374074776974746572"
describe('test ddo', () => {
    test('test ddo deserialize', () => {
        let ddo = DDO.deserialize(hexstring)
        console.log(JSON.stringify(ddo))
    })
})