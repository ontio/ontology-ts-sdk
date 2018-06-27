export default {
    hash: '36bb5c053b6b839c8f6b923fe852f91239b9fccc',
    entrypoint: 'Main',
    functions: [{
        name: 'Main',
        parameters: [{
            name: 'operation',
            type: 'String'
        }, {
            name: 'args',
            type: 'Array'
        }],
        returntype: 'Any'
    }, {
        name: 'Commit',
        parameters: [{
            name: 'claimId',
            type: 'ByteArray'
        }, {
            name: 'commiterId',
            type: 'ByteArray'
        }, {
            name: 'ownerId',
            type: 'ByteArray'
        }],
        returntype: 'Boolean'
    }, {
        name: 'Revoke',
        parameters: [{
            name: 'claimId',
            type: 'ByteArray'
        }, {
            name: 'ontId',
            type: 'ByteArray'
        }],
        returntype: 'Boolean'
    }, {
        name: 'GetStatus',
        parameters: [{
            name: 'claimId',
            type: 'ByteArray'
        }],
        returntype: 'ByteArray'
    }],
    events: [{
        name: 'ErrorMsg',
        parameters: [{
            name: 'arg1',
            type: 'ByteArray'
        }, {
            name: 'arg2',
            type: 'String'
        }],
        returntype: 'Void'
    }, {
        name: 'Push',
        parameters: [{
            name: 'arg1',
            type: 'ByteArray'
        }, {
            name: 'arg2',
            type: 'String'
        }, {
            name: 'arg3',
            type: 'ByteArray'
        }],
        returntype: 'Void'
    }]
};
