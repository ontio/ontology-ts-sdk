import { Address } from './../src/crypto/address';
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

import { EventEmitter, ab2hexstring, hexstring2ab, getUnencodedPublicKey, getEncodedPublicKey } from '../src/utils';
import { State } from '../src/smartcontract/token';
import * as base58 from 'bs58';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { PublicKey } from '../src/crypto/PublicKey';


describe('test EeventEmitter', () => {

    let eventEmitter: EventEmitter;
    let result: string;

    // tslint:disable-next-line:one-variable-per-declaration
    const ASYNC = 'ASYNC',
        ASYNC_HAPPENED = 'ASYNC_HAPPENED',
        SYNC = 'SYNC',
        SYNC_HAPPENED = 'SYNC_HAPPENED';

    beforeAll(() => {
        result = '';
        eventEmitter = new EventEmitter();
    });

    test('test acync event', () => {
        eventEmitter.on(ASYNC, (event?: any) => {
            result = ASYNC_HAPPENED;
        });

        setTimeout(() => {
            eventEmitter.trigger(ASYNC);
            expect(result).toEqual(ASYNC_HAPPENED);
        }, 1000);
    });

    test('test sync event', () => {
        eventEmitter.on(SYNC, () => {
            result = SYNC_HAPPENED;
        });
        eventEmitter.trigger(SYNC);
        expect(result).toEqual(SYNC_HAPPENED);
    });

    test('test_state', () => {
        const addr = new Address('TA9MXtwAcXkUMuujJh2iNRaWoXrvzfrmZb');

        const state = new State(addr, addr, '10000000000000');
        console.log(state.serialize());
    });

    test('test_neoPk', () => {
        // tslint:disable-next-line:max-line-length
        const pkUnencoded = '0495799b976fb31e4620732592c542446d95a3f0c632bebf2506acff99f4c73f641cfb4c6e415da69f07afd529e14f6b90a274e66172b5b53069b8cc5aaacbd61d';
        const pk1 = getUnencodedPublicKey(pkUnencoded);
        const addr1 = Address.fromPubKey(new PublicKey(pk1)).toBase58();
        console.log('addr1 ' + addr1);

        console.log('pk1: ' + pk1);
        const pk2 = getEncodedPublicKey(pkUnencoded);
        console.log('pk2: ' + pk2);
    })
});
