
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


import AbiFunction from './abiFunction'


export default class AbiInfo {
    hash : string
    entrypoint : string
    functions : Array<AbiFunction> = []

    constructor() {

    }

    getHash() : string {
        return this.hash
    }

    getEntryPoint() : string {
        return this.entrypoint
    }

    getFunction(name : string) : AbiFunction {
        let f = (<AbiFunction>{})
        for(let v of this.functions) {
            if(v.name === name) {
                return new AbiFunction(v.name,v.returntype,v.parameters)
            }
        }
        return f
    }

    static parseJson(json : string) : AbiInfo {
        let a = new AbiInfo()
        let obj = JSON.parse(json)
        a.hash = obj.hash
        a.entrypoint = obj.entrypoint
        a.functions = obj.functions
        return a
    }


}