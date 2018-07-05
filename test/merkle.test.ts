import { Account } from '../src/account';
import { PrivateKey } from '../src/crypto';
import { Identity } from '../src/identity';
import { constructClaimProof, getProofNodes, verifyClaimProof, verifyLeafHashInclusion } from '../src/merkle';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { buildRegisterOntidTx } from '../src/smartcontract/nativevm/ontidContractTxBuilder';
import { signTransaction } from '../src/transaction/transactionBuilder';

// tslint:disable:no-console

describe('test merkle proofs', () => {
    let txHash: string;

    const privateKey = PrivateKey.random();
    const publicKey = privateKey.getPublicKey();
    const account = Account.create(privateKey, '123456', '');
    const identity = Identity.create(privateKey, '123456', '');
    const ontId =  identity.ontid;
    const address = account.address;

    /**
     * Registers new ONT ID to create transaction
     */
    beforeAll(async () => {
        const tx = buildRegisterOntidTx(ontId, publicKey, '0', '30000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);

        const client = new WebsocketClient();
        const result = await client.sendRawTransaction(tx.serialize(), false, true);
        txHash = result.Result.TxHash;
    }, 10000);

    test('test verify leaf in tree', () => {
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
        };
        const leafHash = merkle.TransactionsRoot;
        const leafIndex = merkle.BlockHeight;
        const proof = merkle.TargetHashes;
        const rootHash = merkle.CurBlockRoot;
        const treeSize = merkle.CurBlockHeight;
        const result = verifyLeafHashInclusion(leafHash, leafIndex, proof, rootHash, treeSize);
        console.log(result);
        expect(result).toBeTruthy();
    });

    test('test verifyMerkleProof with wrong contractAddr', async () => {
        const contractAddr = '1234567890';
        const claimProof = await constructClaimProof(txHash, contractAddr);
        console.log(claimProof);
        const result = verifyClaimProof(claimProof.TxnHash, claimProof.MerkleRoot, claimProof.Nodes);
        console.log(result);
        expect(result).toBeFalsy();
    });

    test('test getProofNodes', () => {
        const merkle = { TransactionsRoot: '9376dc41a98a52cdaeac04e43033102ba5167ef914c929093bf316d4c23cc89d',
            Type: 'MerkleProof', CurBlockRoot: 'b70494ad2d446004cd2cb4a5746829192402dfcbbc0300c0f6ee67c40ad94971',
            CurBlockHeight: 3975, BlockHeight: 3807,
            TargetHashes: ['f1c52b64834de776dd75899b7a737586649262ef2f6b7a2e2403ad2f6806a563',
                '763cf365f5d54763eddf7d790a8f238f42c84efe6083fc3d0dcdbda1bba42e1d',
                'a4d84c9eae6877f0f8dbd4e7dd16cac5662def94ec5a1560b635c06277c1157e',
                'f53a8ef0da3764781d2e1fb910ee24e060b49bb48c49d264624149c802a9c051',
                'c17bffb1d0d6cc6156835250fdb6560a0c55085c1c252ace0ebad99b49dc8904',
                'c72bad737b03a3f1474439415670fef914d51329364846b5c0de9430bda2fdce',
                '286700b35b38d66aedd53f4f0f6ecfd9647825160cb11d1159695977a827413b',
                'bac6b66302d3ce0ba7921d09b498b8fdbed97c92c8cec01b6bc7d4e1093664f9',
                'e279ddafd7c0e24f5e11fad048863f2464c53185ee28aec2aa7625b1351bc3c0',
                '2efe9edb28594bf2c40d23b256db86a9b47617e738f6f1989a1a88c86417342c',
                '8498af2fc96c62427b2992ece3842cabe69ccc8d2b7df1b634ea6263c3b9b35b',
                '73fc0e4d1163018bf721ce2d31bb42004d7f4604d6896443c2d38ece602e3909'] };
        const leafIndex = merkle.BlockHeight;
        const treeSize = merkle.CurBlockHeight;
        const proof = merkle.TargetHashes;
        const proofNodes = getProofNodes(leafIndex, treeSize, proof);
        console.log(proofNodes);
        expect(proofNodes.length).toBeGreaterThan(0);
    });
});
