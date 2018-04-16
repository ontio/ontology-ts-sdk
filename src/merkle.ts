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
import { RestClient } from './index';


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
        leafIndex = Math.floor( leafIndex / 2 )
        lastNode = Math.floor( lastNode / 2)
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

export async function constructClaimProof(txHash : string, contractAddr : string) {
    let restClient = new RestClient()
    const res = await restClient.getMerkleProof(txHash)
    const merkleProof = res.Result
    const proof = merkleProof.TargetHashes
    let leafIndex = merkleProof.BlockHeight
    let lastNode = merkleProof.CurBlockHeight - 1
    let pos = 0
    let pathLen = proof.length
    let claimProof = {
        "Type": "MerkleProof",
        "TxnHash": txHash,
        "ContractAddr": contractAddr,
        "BlockHeight": merkleProof.BlockHeight,
        "MerkleRoot": merkleProof.CurBlockRoot,
        "Nodes": new Array<any>()
    }
    let nodes = new Array<any>()
    while(lastNode > 0) {
        if(pos > pathLen) {
            throw new Error('Proof too short');            
        }
        let node = {
            TargetHash: proof[pos],
            Direction : ''
        }
        if (leafIndex % 2 === 1) {
            node.Direction = 'Left'
            pos += 1
        } else if (leafIndex < lastNode) {
            node.Direction = 'Right'
            pos += 1
        }
        nodes.push(node)
        leafIndex = Math.floor(leafIndex / 2)
        lastNode = Math.floor(lastNode / 2)
    }
    claimProof.Nodes = nodes
    return claimProof
}


// "TxnHash": "c89e76ee58ae6ad99cfab829d3bf5bd7e5b9af3e5b38713c9d76ef2dcba2c8e0",
// "MerkleRoot": "bfc2ac895685fbb01e22c61462f15f2a6e3544835731a43ae0cba82255a9f904",
//     "Nodes": [{
//         "Direction": "Right",
//         "TargetHash": "2fa49b6440104c2de900699d31506845d244cc0c8c36a2fffb019ee7c0c6e2f6"
//     }, {
//         "Direction": "Left",
//         "TargetHash": "fc4990f9758a310e054d166da842dab1ecd15ad9f8f0122ec71946f20ae964a4"
//     }]
export function verifyClaimProof(txHash : string ,merkleRoot : string, nodes : Array<any>) {
    let p = txHash
    for(let n of nodes) {
        if(n.Direction === 'Right') {
            p = hashChildren(p, n.TargetHash)
        } else {
            p = hashChildren(n.TargetHash, p)
        }
    }
    if(p === merkleRoot) {
        return true
    } else {
        return false
    }
}