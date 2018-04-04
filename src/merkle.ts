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

import * as cryptoJS from 'crypto-js'


/* 
    verify a Merkle Audit Path

   leaf_hash: The hash of the leaf for which the proof was provided.
   leaf_index: Index of the leaf in the tree.
   proof: A list of SHA-256 hashes representing the  Merkle audit path.
   tree_size: The size of the tree
   root_hash: The root hash of the tree

   Returns:
       true when the proof is valid
*/
export function verifyLeafHashInclusion(leafHash : string, leafIndex : number, proof : Array<string>,
rootHash : string, treeSize : number)  {
    if(treeSize <= leafIndex) {
        throw new Error('Wrong params, the tree size is smaller than the leaf index')
    }

    let calculatedRootHash = calculateRootHashFromAuditPath(leafHash, leafIndex, proof, treeSize)
    if(calculatedRootHash !== rootHash) {
        return false
    }
    return true
}

export function calculateRootHashFromAuditPath(leafHash : string, leafIndex : number, proof : Array<string>, treeSize : number) {
    let calculatedHash = leafHash
    let lastNode = treeSize - 1
    let pos = 0
    let pathLen = proof.length
    while(lastNode > 0) {
        if(pos > pathLen) {
            throw new Error('Proof too short');
        }
        if(leafIndex % 2 ===1) {
            calculatedHash = hashChildren(proof[pos], calculatedHash)
            pos += 1
        } else if (leafIndex < lastNode ){
            calculatedHash = hashChildren(calculatedHash, proof[pos])
            pos += 1
        }
        leafIndex /= 2
        lastNode /= 2
    }
    if(pos < pathLen) {
        throw new Error('Proof too long')
    }
    return calculatedHash
}

export function hashChildren(left : string, right : string) {
    let data = '01' + left
    data += right
    let hex = cryptoJS.enc.Hex.parse(data);
    return cryptoJS.SHA256(hex).toString(); 
}