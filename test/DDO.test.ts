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

"0000004b0200000021035096277bd28ee25aad489a83ca91cfda1f59f2668f95869e3f7de0af0f07fc5100000021039392ba7df4a7badc4cc498be257202f9bbb89c887502e9bcb96a6636ee050ba80000001c010000001700000004436572740000000b06537472696e6761626364"
describe('test ddo', () => {
    test('test ddo deserialize', () => {
        let ddo = DDO.deserialize(hexstring)
        console.log(JSON.stringify(ddo))
    })
})