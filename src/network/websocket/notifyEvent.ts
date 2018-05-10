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

import { hexstr2str } from "../../utils";

/**
 * Represents Notify event.
 */
export class NotifyEvent {
    Action: string;
    Error: number;
    Result: Result[];

    /**
     * Deserializes Notify event.
     * 
     * States in events are hex encoded.
     * 
     * @param e encoded event
     */
    static deserialize(e: any): NotifyEvent {
        const event = new NotifyEvent();

        event.Action = e.Action;
        event.Error = e.Error;
        event.Result = e.Result.map((r: any) => Result.deserialize(r));

        return event;
    }
}

/**
 * One of the results of Notify event.
 */
export class Result {
    TxHash: string;
    ContractAddress: string;
    States: string[];

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
        result.ContractAddress = r.ContractAddress;
        result.States = r.States.map((s: any) => hexstr2str(s));
        return result;
    }
}
