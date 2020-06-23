import { PrivateKey } from '../src/crypto/PrivateKey';
import { RestClient, RpcClient, Struct } from '../src/index';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { createCodeParamsScript, deserializeItem } from '../src/transaction/scriptBuilder';
import { num2hexstring, reverseHex, str2hexstr, StringReader } from '../src/utils';
import { Account } from './../src/account';
import { Address } from './../src/crypto/address';
import { Parameter, ParameterType } from './../src/smartcontract/abi/parameter';
import { makeInvokeTransaction, signTransaction } from './../src/transaction/transactionBuilder';

describe('test smarct contract params', () => {
    const socketClient = new WebsocketClient();
    const restClient = new RestClient();

    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    console.log(account.address.serialize());
    test('test_params_Array', async () => {
        const contract = reverseHex('ab01641c418af066402075c78dc8cb8279a7c074');
        const contractAddr = new Address(contract);
        const method = 'testHello';

        const params = [
            new Parameter('op', ParameterType.String, 'test'),
            new Parameter('args', ParameterType.Array,
                [
                    new Parameter('arg1', ParameterType.Boolean, false),
                    new Parameter('arg2', ParameterType.Integer, 3),
                    // new Parameter('arg3', ParameterType.ByteArray, account.address.serialize()),
                    new Parameter('arg3', ParameterType.Address, account.address),
                    new Parameter('arg4', ParameterType.String, 'arg4')
                ]
            )
        ];

        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));

    }, 10000);

    test('test_list', async () => {
        const contract = reverseHex('16edbe366d1337eb510c2ff61099424c94aeef02');
        const contractAddr = new Address(contract);
        const method = 'testHello';

        const params = [
            new Parameter('args', ParameterType.Array,
                [
                    new Parameter('arg1', ParameterType.String, 'test')
                ]
            )
        ];
        console.log(JSON.stringify(params));
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('test_map', async () => {
        const contract = reverseHex('16edbe366d1337eb510c2ff61099424c94aeef02');
        const contractAddr = new Address(contract);
        const method = 'testMap';

        const params = [
            new Parameter('args', ParameterType.Map,
                { key : new Parameter('', ParameterType.String, 'test'),
                    key2: new Parameter('', ParameterType.String, 'test')
                }
            )
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('testGetmap', async () => {
        const contract = reverseHex('16edbe366d1337eb510c2ff61099424c94aeef02');
        const contractAddr = new Address(contract);
        const method = 'testGetMap';

        const params = [
            new Parameter('args', ParameterType.Map,
                {
                    key: new Parameter('', ParameterType.String, 'test')
                }
            )
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('test_mapInMap', async () => {
        const contract = reverseHex('16edbe366d1337eb510c2ff61099424c94aeef02');
        const contractAddr = new Address(contract);
        const method = 'testMapInMap';

        const params = [
            new Parameter('args', ParameterType.Map,
                {
                    key: new Parameter('', ParameterType.String, 'hello2'),
                    key2: new Parameter('', ParameterType.ByteArray, 'aabb'),
                    key3: new Parameter('', ParameterType.Integer, 100),
                    key4: new Parameter('', ParameterType.Boolean, true),
                    key5: new Parameter('', ParameterType.Array, [
                        new Parameter('', ParameterType.String, 'hello'),
                        new Parameter('', ParameterType.Integer, 100)
                    ]),
                    key6: new Parameter('', ParameterType.Map, {
                        key: new Parameter('', ParameterType.String, 'hello2'),
                        key1: new Parameter('', ParameterType.Boolean, true),
                        key3: new Parameter('', ParameterType.Integer, 100)
                    })
                }

            )
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('test_mapInNestedMap', async () => {
        const contract = reverseHex('16edbe366d1337eb510c2ff61099424c94aeef02');
        const contractAddr = new Address(contract);
        const method = 'testMapInMap';

        const params = [
            new Parameter('dataParam', ParameterType.Map, {
                name: new Parameter('name', ParameterType.String, 'dataParamName'),
                type: new Parameter('type', ParameterType.String, 'Array'),
                value: new Parameter('value', ParameterType.Array, [
                    new Parameter('dataParam', ParameterType.Map, {
                        name: new Parameter('name', ParameterType.String, 'dataParamName'),
                        type: new Parameter('type', ParameterType.String, 'Integer'),
                        value: new Parameter('value', ParameterType.Integer, 100)
                    }),
                    new Parameter('dataParam', ParameterType.Map, {
                        name: new Parameter('name', ParameterType.String, 'dataParamName'),
                        type: new Parameter('type', ParameterType.String, 'Integer'),
                        value: new Parameter('value', ParameterType.Integer, 200)
                    }),
                    new Parameter('dataParam', ParameterType.Map, {
                        name: new Parameter('name', ParameterType.String, 'dataParamName'),
                        type: new Parameter('type', ParameterType.String, 'String'),
                        value: new Parameter('value', ParameterType.String, 'String51')
                    })
                    ,
                    new Parameter('dataParam', ParameterType.Map, {
                        name: new Parameter('name', ParameterType.String, 'dataParamName'),
                        type: new Parameter('type', ParameterType.String, 'Boolean'),
                        value: new Parameter('value', ParameterType.Boolean, true)
                    })
                ])
            })
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('deserialize_item', () => {
        const hex = '820600036b6579000668656c6c6f3200046b6579320002aabb00046b65793302016400046b657934010100046b6579358002000568656c6c6f02016400046b657936820300036b6579000668656c6c6f3200046b657931010100046b657933020164';
        const sr = new StringReader(hex);
        const val = deserializeItem(sr);
        expect(val.get('key5').length).toEqual;
        console.log(val);
    });

    test('exchange', async () => {
        const contract = '7dffd39e53be06f104f443857f9115ec55212b43';
        const contractAddr = new Address(reverseHex(contract));
        const method = 'Exchange';
        const parameters = [
            new Parameter('from', ParameterType.ByteArray, 'fb0948cc37048b785c2f1e5056632794ece84af4'),
            new Parameter('to', ParameterType.ByteArray, 'a6bfa95fae5a7c50b6ae63ffed44eb94106393fe'),
            new Parameter('fromSymbol', ParameterType.String, 'Token1'),
            new Parameter('toSymbol', ParameterType.String, 'Token2'),
            new Parameter('value', ParameterType.Integer, 10)
        ];
        const tx = makeInvokeTransaction(method, parameters, contractAddr, '500', '20000');
        const res = await socketClient.sendRawTransaction(tx.serialize(), true, false);
        console.log(JSON.stringify(res));
    });

    test('fomo3dBuy', async () => {
        console.log('hex: ' + str2hexstr(''));
        const contract = '9361fc1e3a628e1aa46b3d58dde051530f0f5aa0';
        const contractAddr = new Address(reverseHex(contract));
        const method = 'Buy';
        const parameters = [
            new Parameter('playerAddr', ParameterType.ByteArray, account.address.toHexString()),
            new Parameter('amountInCoin', ParameterType.Int, 150314570501736060),
            new Parameter('team', ParameterType.Int, 1),
            new Parameter('useVault', ParameterType.Boolean, false),
            new Parameter('referrer', ParameterType.String, '')
        ];
        const tx = makeInvokeTransaction(method, parameters, contractAddr, '500', '20000');
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    });

    test('getCurrentRound', async () => {
        const contract = 'dedc8c61d03dcc3387737fbddbe8096300be84de';
        const contractAddr = new Address(reverseHex(contract));
        const method = 'getCurrentRound';
        const tx = makeInvokeTransaction(method, [], contractAddr);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(res);
    });

    test('checkNumber', async () => {
        const contract = reverseHex('9e092590a023a0a7519a56a37c0c2a8deea27e73');
        const contractAddr = new Address(contract);

        const params = [
            new Parameter('args', ParameterType.Array,
                [
                    18, 33, 5139, 12849, 2368291, 3551794, 353637396, 1178681665, 94842983701,
                    353551602001, 43044802274854, 114771766698594,
                    new Parameter('', ParameterType.Long, '14978884054759223'),
                    new Parameter('', ParameterType.Long, '32778036993815411')
                ]
            )

        ];

        const tx = makeInvokeTransaction('checkNumberList', params, contractAddr, '500', '20000', null, false);
        const rest = new RestClient();
        const res = await rest.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('PutItem', async () => {
        const contract = reverseHex('033e526d9dd78b2e2b4199174fb95d2eb9222b0b');
        const contractAddr = new Address(contract);

        const params = [
            new Parameter('', ParameterType.String, 'hello'),
            new Parameter('', ParameterType.String, 'world')

        ];

        const tx = makeInvokeTransaction('PutItem', params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const socket = new WebsocketClient('ws://13.57.184.209:20335');
        const res = await socket.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('balanceOf', async () => {
        const contract = reverseHex('b1e8b6485ac1a5426b4dbe4c9b3c7b1988a00e3f');
        const contractAddr = new Address(contract);

        const params = [
            new Parameter('', ParameterType.Address, new Address('AUr5QUfeBADq6BMY6Tp5yuMsUNGpsD7nLZ'))

        ];

        const tx = makeInvokeTransaction('getActivityTime', [], contractAddr, '500', '20000', account.address);
        // console.log(tx.payload.code);
        // signTransaction(tx, privateKey);
        const socket = new WebsocketClient('ws://13.57.184.209:20335');
        const rpcClient = new RpcClient('http://dappnode1.ont.io:20336');
        // const res = await socket.sendRawTransaction(tx.serialize(), true);
        const res = await rpcClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('getAdmin', async () => {
        const contract = reverseHex('c0df752ca786a99755b2e8950060ade9fa3d4e1b');
        const contractAddr = new Address(contract);

        const params = [
            new Parameter('', ParameterType.Address, new Address('AUr5QUfeBADq6BMY6Tp5yuMsUNGpsD7nLZ'))

        ];

        const tx = makeInvokeTransaction('listAdmins', [], contractAddr, '500', '20000', account.address);
        // console.log(tx.payload.code);
        // signTransaction(tx, privateKey);
        const socket = new WebsocketClient('ws://13.57.184.209:20335');
        const rpcClient = new RpcClient('http://dappnode1.ont.io:20336');
        // const res = await socket.sendRawTransaction(tx.serialize(), true);
        const res = await rpcClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));

    }, 10000);
    test('createVote1', async () => {
        // tslint:disable:max-line-length
        const voters = [{name: 'Bison Trails (phecda)', address: 'AJEAVCJpa7JmpDZsJ9vPA1r9fPZAvjec8D', weight: 24607500}, {name: 'Megrez', address: 'AUy6TaM9wxTqo9T7FiaYMnDeVExhjsR1Pq', weight: 22121500}, {name: 'Mixar', address: 'AWWChRewNcQ5nZuh8LzF8ksqPaCW8EXPBU', weight: 16212000}, {name: 'Bison Trails (Dubhe)', address: 'AGqzuKoEeDfMHPEBPJVs2h2fapxDGoGtK1', weight: 16208500}, {name: 'Alioth', address: 'APSFBEbQzMUjuCtSVwHcRjiqCrDe56jAHJ', weight: 13977000}, {name: 'Alkaid', address: 'AXNxyP2HEKW7GoSqYfeqcYfCSE7XaaVVu4', weight: 12740500}, {name: 'Bison Trails (Merak)', address: 'AGEdeZu965DFFFwsAWcThgL6uduJf4U7ci', weight: 12574000}, {name: 'OKEx Pool', address: 'AJiEBNzr4NeAyaQx6qn1jgNkLFCgxtTt5U', weight: 6500000}, {name: 'huobipool-pro', address: 'AevYU9HK7B4iryyx6Av5iEVczBkfmM3cXy', weight: 6448376}, {name: 'Jumple Foundation', address: 'AYgiXzs4b7XmaQjNoo6ANuFJ5zHDebgPdq', weight: 5003500}, {name: 'Huobi Wallet', address: 'ATTzSUQm5MgXQCLfrbWBv9hSBLcZX75giR', weight: 4488000}, {name: 'Longlink Fund', address: 'Aa1MF3pTq4CaE3HK4umgZL3WxLh3A1CiBH', weight: 1500000}, {name: 'Krypto Knight', address: 'AWGrHN1DUAo6Ao3yTHu4tUHZonPNAy9ZmU', weight: 1010000}, {name: 'CMmadrid', address: 'APQgjS1WM6St7FDPe3MPhgbAby2uZGDoXD', weight: 1000000}, {name: 'charbo', address: 'ALfbQ4yv4Pho31DA1EoeacMj6VJhyxDHqu', weight: 1000000}, {name: 'MovieBloc', address: 'AXwfq4jnhvByDmvuFhFzHSSdKJ3GQTwZ8Z', weight: 913500}, {name: 'Midwest Blockchain Club', address: 'ASPPqj8yCcCV2sWHQZwsYfWZS2FMfd3PF7', weight: 800000}, {name: 'Hashed', address: 'AVaQJM27YxLkD5JAd1n4wGnxMx2Ey1h9cQ', weight: 800000}, {name: 'Infinity Stones', address: 'AbZuVX9M2F4cw6myDFVP9shAFKPm8xBY9J', weight: 754248}, {name: 'Martview', address: 'AUEAGG1pWTg2nAMsoR4x6EvSN2wb2wdZHx', weight: 682755}, {name: 'Sesameseed', address: 'ANRRE8xKwKzuaCeAjP6eZYDnVi7n2x6byE', weight: 593500}, {name: 'Dragon', address: 'Ac8P8376ozoQ5H2Srcm32n5yb8kLoixRaP', weight: 549796}, {name: 'Abine', address: 'AV59sm9kRGB4EYRKCMYXXsiCPKzbAFMcpA', weight: 503298}, {name: 'Accomplice Blockchain Two - International', address: 'ANumnYcRtbT1XxCw1hs9WGjJaDURMxiuQ9', weight: 503297}, {name: 'Nebuchadnezzar Limited', address: 'AModfYVLuvvaacsexSBAvegnykog5yH2Ji', weight: 490000}, {name: 'Cobo', address: 'AcdH5iCT5DSxUio29YMykT8eakgbjYeWBW', weight: 485563}, {name: 'Timestamp Capital', address: 'AbGDhXXyjHLBc53BDR8jrRZLAL1BteL7VA', weight: 485562}, {name: 'Marvelous Peach Capital', address: 'AFsfeivZ1iTbL1sqY8UkTZ8kqygwGerDNj', weight: 485558}, {name: 'gf.network', address: 'AGUekTnhucrQShdATUFhZqFqiPdC65nRxv', weight: 469999}, {name: 'Karathen', address: 'AW4ytrVJX2h6W2jxKCf5Ws2bh1DUXAK2qq', weight: 406520}, {name: 'CertiK Ltd', address: 'AGns9etVHUknEgZ6yUhnHSZm6G6AxKXkPx', weight: 405252}, {name: 'G&Q TECH LIMITED', address: 'AX9MxQSbQPKKA4cP9VzTwE8o6MXC3pC9Nw', weight: 401000}, {name: 'KuCoin', address: 'AZ3TqZAEhUELfNHrjrmXShbVzKJv64x12w', weight: 400100}, {name: 'CloudDesk ', address: 'AXtswyDXUgkpUobpyc9cj8cTTAtAdMbTTy', weight: 400000}, {name: 'Lightbringer', address: 'AJ6exTNyr8joCkBEbz6DpHbe357EoBX1Tf', weight: 360000}, {name: '本体微积分', address: 'ATGDCxCUEzGdX2mpLriT3hBUK7VW3dX1FT', weight: 359493}, {name: 'BlockBoost', address: 'AKshHCFGWHMftXELBmogxrjrDMW61xgph9', weight: 350500}, {name: 'PNP', address: 'AGgCp8dKedjJXaWDoU4qfnSAU6pgLKhxVx', weight: 350000}, {name: 'J&D TECH LIMITED', address: 'ARXKEj5r61cWm1X7DLZttDJo3D5Zhwdexc', weight: 350000}, {name: 'ont-huobipool', address: 'AY65tbb1bzDJ4fbcqPCExMyMEq2BRNb9fu', weight: 349000}, {name: 'SNZPool', address: 'AXMKzXMc9nKpZJYecPe5NBLJraZwJ37zbg', weight: 342000}, {name: 'PreAngel', address: 'ALaDrS5ZwMKZgTS3a8okgDDz84k3ttfP4x', weight: 330000}, {name: 'Accomplice Blockchain Capital ', address: 'AGgP7kWDSxzbRHdeDwULwYUV7qVuKWBoTr', weight: 321000}, {name: 'Matrix Partners China', address: 'AKkcxjHGXnF68FYNP5UQ5Hkv4j3HBsdmP5', weight: 320999}, {name: 'Lichang', address: 'ASNRUBi1X56kW55zRv7jFPQsE6SngBJfrs', weight: 177500}, {name: 'Animals.NET', address: 'APP42849YXfRtDp5Y4bTVbt1g5vhajAAya', weight: 100551}, {name: 'Moonstake', address: 'ALMCC2PCT9YjzMyftvt9ifvK8jKteQfXoY', weight: 100000}, {name: 'Bison Trails', address: 'AczZ2AmTeAPgpsZZKzT6USBPJ93Er9ThBW', weight: 10000}];
        const contractHash = {
            MAIN_NET: 'c0df752ca786a99755b2e8950060ade9fa3d4e1b',
            TEST_NET: 'a088ae3b508794e666ab649d890213e66e0c3a2e'
        };
        const contract = reverseHex(contractHash.MAIN_NET);
        const contractAddr = new Address(contract);
        const method = 'createTopic';
        const addr = new Address('AWWChRewNcQ5nZuh8LzF8ksqPaCW8EXPBU');
        const vote1 = {
            title: 'Improve the Ontology Governance and Economic Model, Vote 1',
            content: `Action: Lower the minimum requirements for staking to from 500 ONT to 1 ONT. Effective time: July 7, 2020. Details: This change will lower the requirements for users to stake from 500 ONT to 1 ONT thus allowing more stakers to participate in the staking and earn ONG rewards. Over 118k addresses that hold between 1 ONT and 500 ONT will now be able to participate in the staking.`,
            startTime: Math.floor((new Date('2020-06-09 00:0:00').getTime()) / 1000),
            endTime: Math.floor((new Date('2020-06-12 00:0:00').getTime()) / 1000)
        };
        const params = [
            new Parameter('', ParameterType.ByteArray, addr.serialize()),
            new Parameter('', ParameterType.String, vote1.title),
            new Parameter('', ParameterType.String, vote1.content),
            new Parameter('', ParameterType.Integer, vote1.startTime),
            new Parameter('', ParameterType.Integer, vote1.endTime),
            new Parameter('', ParameterType.Array, voters.map((voter) =>
                new Parameter('', ParameterType.Array, [
                    new Parameter('', ParameterType.Address, new Address(voter.address)),
                    new Parameter('', ParameterType.Integer, voter.weight)
                ]
            )))
        ];

        const tx1 = makeInvokeTransaction(method, params, contractAddr, '500', '200000', addr);
        // tslint:disable:no-console
        console.log('vote1 tx: ');
        console.log(tx1.serialize());

        const vote2 = {
            title: 'Improve the Ontology Governance and Economic Model, Vote 2',
            content: `Action: Increase the gas fee per transaction to 0.05 ONG. Effective time: July 7, 2020. Details: By design, the gas fees shall cover the costs of operating a node and bring profits to the Triones nodes. There needs to be a certain balance between TPS and the gas fee per transaction. In order to generate more fees from transactions, we will raise the transaction fee from 0.01 ONG to 0.05 ONG, which will generate around 15,768,000 ONG in transaction fees per year when the average TPS is 10.
            `,
            startTime: Math.floor((new Date('2020-06-09 00:0:00').getTime()) / 1000),
            endTime: Math.floor((new Date('2020-06-12 00:0:00').getTime()) / 1000)
        };
        const params2 = [
            new Parameter('', ParameterType.ByteArray, addr.serialize()),
            new Parameter('', ParameterType.String, vote2.title),
            new Parameter('', ParameterType.String, vote2.content),
            new Parameter('', ParameterType.Integer, vote2.startTime),
            new Parameter('', ParameterType.Integer, vote2.endTime),
            new Parameter('', ParameterType.Array, voters.map((voter) =>
                new Parameter('', ParameterType.Array, [
                    new Parameter('', ParameterType.Address, new Address(voter.address)),
                    new Parameter('', ParameterType.Integer, voter.weight)
                ]
            )))
        ];

        const tx2 = makeInvokeTransaction(method, params2, contractAddr, '500', '200000', addr);
        // tslint:disable:no-console
        console.log('vote2 tx: ');
        console.log(tx2.serialize());

        const vote3 = {
            title: 'Improve the Ontology Governance and Economic Model, Vote 3',
            content: `Action: Cancel the current ONG unbinding model and combine it with staking with a new releasing curve. Effective time: July 7, 2020. Details: The current ONG unbinding model will be canceled, and users can earn ONG rewards via staking. The annual ONG releasing speed per block will follow a new releasing curve and witness a significant decline from Year 3 onwards. Currently, 4 ONG is released per block. After the change, the amount of ONG released per block will be reduced to 1 ONG per block.
            `,
            startTime: Math.floor((new Date('2020-06-09 00:0:00').getTime()) / 1000),
            endTime: Math.floor((new Date('2020-06-12 00:0:00').getTime()) / 1000)
        };
        const params3 = [
            new Parameter('', ParameterType.ByteArray, addr.serialize()),
            new Parameter('', ParameterType.String, vote3.title),
            new Parameter('', ParameterType.String, vote3.content),
            new Parameter('', ParameterType.Integer, vote3.startTime),
            new Parameter('', ParameterType.Integer, vote3.endTime),
            new Parameter('', ParameterType.Array, voters.map((voter) =>
                new Parameter('', ParameterType.Array, [
                    new Parameter('', ParameterType.Address, new Address(voter.address)),
                    new Parameter('', ParameterType.Integer, voter.weight)
                ]
            )))
        ];

        const tx3 = makeInvokeTransaction(method, params3, contractAddr, '500', '200000', addr);
        // tslint:disable:no-console
        console.log('vote3 tx: ');
        console.log(tx3.serialize());

        const vote4 = {
            title: 'Improve the Ontology Governance and Economic Model, Vote 4',
            content: `Action: Lower the minimum entry requirements for candidate nodes from 100,000 ONT to 10,000 ONT, with no KYC required. Effective time: July 7, 2020.
            `,
            startTime: Math.floor((new Date('2020-06-09 00:0:00').getTime()) / 1000),
            endTime: Math.floor((new Date('2020-06-12 00:0:00').getTime()) / 1000)
        };
        const params4 = [
            new Parameter('', ParameterType.ByteArray, addr.serialize()),
            new Parameter('', ParameterType.String, vote4.title),
            new Parameter('', ParameterType.String, vote4.content),
            new Parameter('', ParameterType.Integer, vote4.startTime),
            new Parameter('', ParameterType.Integer, vote4.endTime),
            new Parameter('', ParameterType.Array, voters.map((voter) =>
                new Parameter('', ParameterType.Array, [
                    new Parameter('', ParameterType.Address, new Address(voter.address)),
                    new Parameter('', ParameterType.Integer, voter.weight)
                ]
            )))
        ];

        const tx4 = makeInvokeTransaction(method, params4, contractAddr, '500', '200000', addr);
        // tslint:disable:no-console
        console.log('vote4 tx: ');
        console.log(tx4.serialize());

        const vote5 = {
            title: 'Title: Improve the Ontology Governance and Economic Model, Vote 5',
            content: `Action: Allow nodes that have staked 1.5 million ONT or more to become a Consensus node. Effective time: July 7, 2020.`,
            startTime: Math.floor((new Date('2020-06-09 00:0:00').getTime()) / 1000),
            endTime: Math.floor((new Date('2020-06-12 00:0:00').getTime()) / 1000)
        };
        const params5 = [
            new Parameter('', ParameterType.ByteArray, addr.serialize()),
            new Parameter('', ParameterType.String, vote5.title),
            new Parameter('', ParameterType.String, vote5.content),
            new Parameter('', ParameterType.Integer, vote5.startTime),
            new Parameter('', ParameterType.Integer, vote5.endTime),
            new Parameter('', ParameterType.Array, voters.map((voter) =>
                new Parameter('', ParameterType.Array, [
                    new Parameter('', ParameterType.Address, new Address(voter.address)),
                    new Parameter('', ParameterType.Integer, voter.weight)
                ]
            )))
        ];

        const tx5 = makeInvokeTransaction(method, params5, contractAddr, '500', '200000', addr);
        // tslint:disable:no-console
        console.log('vote5 tx: ');
        console.log(tx5.serialize());

    }, 10000);

    test('getVoteTx', async () => {
        const contractHash = {
            MAIN_NET: 'c0df752ca786a99755b2e8950060ade9fa3d4e1b',
            TEST_NET: 'a088ae3b508794e666ab649d890213e66e0c3a2e'
        };
        const VOTE_HASH = [
            '121847d3522ed25ab34e4feafe323b58482a71689aae37521dfdcf7c1502e9d5',
            'dfadc388711923301618c02cd6d7ff66193f78935b23450fc804db38d0811b39',
            '0ddfe94bf0fe96ca3e30eae32c95e36795ac989deade0ab46f8a1f2ac903ef96',
            '7b56acaf09ffde0439782694c3acd5da87fc26901c978115e825e4eb9313e329',
            '916d360b04fd52bf7d564f6167f29d25e4e6fe8df4bcd213e0db69b4f3fdd964'
        ];
        const contract = new Address(reverseHex(contractHash.MAIN_NET));

        const addrs = [
            new Address('AJEAVCJpa7JmpDZsJ9vPA1r9fPZAvjec8D'),
            new Address('AUy6TaM9wxTqo9T7FiaYMnDeVExhjsR1Pq'),
            new Address('AGqzuKoEeDfMHPEBPJVs2h2fapxDGoGtK1'),
            new Address('AWWChRewNcQ5nZuh8LzF8ksqPaCW8EXPBU'),
            new Address('APSFBEbQzMUjuCtSVwHcRjiqCrDe56jAHJ'),
            new Address('AXNxyP2HEKW7GoSqYfeqcYfCSE7XaaVVu4'),
            new Address('AGEdeZu965DFFFwsAWcThgL6uduJf4U7ci')
        ];

        for (const addr of addrs) {
            console.log('Tx for node: ' + addr.toBase58());
            for (const hash of VOTE_HASH) {
                const params = [
                    new Parameter('', ParameterType.ByteArray, hash),
                    new Parameter('', ParameterType.ByteArray, addr.serialize()),
                    new Parameter('', ParameterType.Boolean, true)
                ];
                const tx = makeInvokeTransaction('voteTopic', params, contract, '500', '200000', addr);
                console.log(tx.serialize());
            }
        }
    }, 10000);

});
