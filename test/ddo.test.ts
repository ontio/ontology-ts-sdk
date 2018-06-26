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

import { DDO } from '../src/transaction/ddo';

// tslint:disable:max-line-length
const hexstring =
    // "000000260100000021039392ba7df4a7badc4cc498be257202f9bbb89c887502e9bcb96a6636ee050ba80000001c010000001700000004436572740000000b06537472696e6761626364"
// '2801000000231202022f71daef10803ece19f96b2cdb348d22bf7871c178b41f35a4f3772a8359b7d20000';
'28010000002312020204120443e93e67083ab49a4e90e0cde41ac45835f1c8c3e13e4f5a689cd8aff10f01130568656c6c6f06737472696e6700';
// "5001000000231202022f71daef10803ece19f96b2cdb348d22bf7871c178b41f35a4f3772a8359b7d202000000231202035096277bd28ee25aad489a83ca91cfda1f59f2668f95869e3f7de0af0f07fc5cc446636c61696d3a62356138376265613932643532353235623665626133623637303539356366386239636262353165393732663563626666343939643438363737646465653861044a534f4e777b2254797065223a224a534f4e222c2256616c7565223a7b22436f6e74657874223a22636c61696d3a73746166665f61757468656e7469636174696f6e38222c22497373756572223a226469643a6f6e743a545675463646483150736b7a574a4146685741466731374e5369744d4445424e6f61227d7d1401052e34559b0def95c23f2d4fd86391bb37e27d"
describe('test ddo', () => {
    test('test ddo deserialize', () => {
        const ddo = DDO.deserialize(hexstring);
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(ddo));
    });
});
