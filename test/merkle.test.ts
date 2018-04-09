import {verifyLeafHashInclusion} from '../src/merkle'

test('test verify leaf in tree', () => {
    const merkle = {
            "Type": "MerkleProof",
            "TransactionsRoot": "cc61e9484b603f6a29ccca0847977147cf5d1f36c749b74361de04f79554c7c4",
            "BlockHeight": 0,
            "CurBlockRoot": "815e20bda34d3a26450cc45726b34b143e9c5391642c340e25aceb76d28d2c88",
            "CurBlockHeight": 4172,
            "TargetHashes": [
                "8efa212233346badd344d0cb926f0b9d62b0eac077c9299c97c1cd4c5fec1450",
                "3daa4b24d4762c8ab20cccc9fe1ad4ec2926545194d12cd0b13b58dcddf47afd",
                "8cb9c7a58049f809485fbf2cc4bed21966195603748643383349a63c2b04bd07",
                "1178ee5780a0d3c795d46f145033302664418b15aa016aee1e6a9bef958801fd",
                "6f9a4bf07ba2f05b707b497a00d376d9158b8e7d852395ff4a5e82e23e611cc7",
                "78f88b81b660f67e901fbe3e5c274be0e77e28712f334965d9f3af7ed6f4f31a",
                "6d18e1c63641485ef692edbe69b516bdb5b46b7123e68e4f27dda161860b8748",
                "49efca7304446c69bc7de684f76bac6d9b7ed77279166c4438da99f65a8460d2",
                "d0ee3b8f10e0354ba6b6c2ef0d831e75bd4246b23a9c79451061eef749196167",
                "80b2ca8c07b4a701cb5ae14a5c171bc8be9a6a88b6417953908cafd1ec99d83a",
                "4e3d005c338414583a0154263b5a62a7be4e2d071430eb8ead7ca0cf543d32b9",
                "b411acb7ac430dca5758b19bce9063cba0ec3d58096a48544f2745df043ef7f7",
                "2e4b0a10b6478bdeea059eb19c1425ab226b0a41b35aad9bcf911e24b4da4906"
            ]
        }

    const leafHash = merkle.TransactionsRoot
    const leafIndex = merkle.BlockHeight
    const proof = merkle.TargetHashes
    const rootHash = merkle.CurBlockRoot
    const treeSize = merkle.CurBlockHeight
    let result = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize)
    console.log(result)
    expect(result).toBeTruthy()
})