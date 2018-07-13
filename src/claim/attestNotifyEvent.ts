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

import { hexstr2str } from '../utils';

/**
 * Represents Notify event of attest creation of revocation.
 */
export class AttestNotifyEvent {
    /**
     * Deserializes Notify event.
     *
     * States in events are hex encoded.
     *
     * @param e encoded event
     */
    static deserialize(e: any): AttestNotifyEvent {
        const event = new AttestNotifyEvent();

        event.Action = e.Action;
        event.Error = e.Error;
        event.Desc = e.Desc;
        event.Result = Result.deserialize(e.Result);

        return event;
    }

    Action: string = 'Notify';
    Desc: string;
    Error: number;
    Result: Result;
}

/**
 * Result of Notify event.
 */
export class Result {
    /**
     * Deserializes result from event.
     *
     * States are hex encoded.
     *
     * @param r encoded result
     */
    static deserialize(r: any): Result {
        const result = new Result();

        result.TxHash = r.TxHash;
        result.State = r.State;
        result.GasConsumed = r.GasConsumed;
        result.Notify = r.Notify.map((n: any) => {
            return {
                ContractAddress: n.ContractAddress,
                States: n.States.map( (s: any) => typeof s === 'string' ? hexstr2str(s) : s)
            };
        });
        result.Version = r.Version;
        return result;
    }

    TxHash: string;
    /**
     * State = 1 : smartcontract executation success
     * State = 0 : smartcontract executation failure
     */
    State: number;
    GasConsumed: number;
    Notify: [{
        ContractAddress: string;
        /**
         * The value of States are usually hex string
         */
        States: any[];
    }];
    Version: string;
}
