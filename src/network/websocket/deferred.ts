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

// tslint:disable:variable-name
export class Deferred<T> {
    private _promise: Promise<T>;
    private _resolve: (value?: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;

    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    get promise(): Promise<T> {
        return this._promise;
    }

    public resolve = (value?: T | PromiseLike<T>): void => {
        this._resolve(value);
    }

    public reject = (reason?: any): void => {
        this._reject(reason);
    }
}
