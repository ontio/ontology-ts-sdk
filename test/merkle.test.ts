import {verifyLeafHashInclusion, verifyClaimProof, constructClaimProof} from '../src/merkle'

const merkle = {
    Type: 'MerkleProof',
    TransactionsRoot: 'dafd3426157505e944b79341692fc671a08ff6a49df8bae0316589f8aeb662e8',
    BlockHeight: 987,
    CurBlockRoot: '013f7e94417caddd5d4cb2b188986950095fc1156337280a0202eb60f97a7202',
    CurBlockHeight: 1334,
    TargetHashes:
        ['fc58cd3c287a212d6ff4dbb4b7ac6a3758bb7c5aba90de7e7c25e73ecfc2e314',
            '8f6b07cb220cff1b7675a572df40355156593afc942e8025383fd299b020efae',
            '8f855e903d197c6b950fb1d06af5b62ad77e833ae6cacdd2d26461bb4db5dd84',
            '21a9fb67d89ec41ec1f72a2219bea14a5e0598bafa0ee034560831c3591ac791',
            '812af7a5a48d503da1d8a567955d28e81e667a229048b1384b00af6091ca2f28',
            '9710423e9b37ec7533db32d96e4ce915ba3070067f0d07b761b98882b727b42d',
            'e693cb5ccd21c3a4e3109444dba90d48e50d998817f5ea30bd8b5e80f5b51908',
            'f80b3101f4ba67f8a122d196c292b1fdd12fa376576eb2ec9a39558bc0d050a5',
            'e16f24631135b44b22540392b3d326cedbc2b0009b65251fa9bfc4bf3afe9c99',
            '3067fe25fa3af8c7e8b4b68714ccf38498a987d1e4dd51f8e87c00c204d5d26d',
            'e7bc56e79d77391f9a4c1065b1c769087b403fa707d7d924536bdad88f6c162e']
}
test('test verify leaf in tree', () => {
    

    const leafHash = merkle.TransactionsRoot
    const leafIndex = merkle.BlockHeight
    const proof = merkle.TargetHashes
    const rootHash = merkle.CurBlockRoot
    const treeSize = merkle.CurBlockHeight
    let result = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize)
    console.log(result)
    expect(result).toBeTruthy()
})

test('test verifyMerkleProof', async () => {
    let txHash = '768af645b5fe30a3480bb104cf9150e4573b120f7da9660cbe3609437f43e84d'
    let contractAddr = '1234567890'
    let claimProof = await constructClaimProof(txHash, contractAddr)
    console.log(claimProof)
    const result = verifyClaimProof(claimProof.TxnHash, claimProof.MerkleRoot, claimProof.Nodes)
    console.log(result)
    expect(result).toBeTruthy()
})