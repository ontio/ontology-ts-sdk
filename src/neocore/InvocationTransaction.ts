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

import { hex2VarBytes } from '../utils';
import { TxType } from './../transaction/transaction';
import { num2hexstring } from './../utils';
import { TransactionNeo } from './TransactionNeo';

export class InvocationTransaction extends TransactionNeo {
    script: string;
    gas: number;
    constructor() {
        super();
        this.type = TxType.Invoke;
    }

    serializeExclusiveData() {
        let result = '';
        result += hex2VarBytes(this.script);
        result += num2hexstring(this.gas, 8, true);
        return result;
    }
}
