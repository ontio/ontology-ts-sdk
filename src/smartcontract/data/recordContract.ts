export default {
    "hash": "0xb0a4c0ab7cc1f28c78cdf91fd92ac6e3cd5288a5",
        "entrypoint": "Main",
            "functions": [
                {
                    "name": "Main",
                    "parameters": [
                        {
                            "name": "operation",
                            "type": "String"
                        },
                        {
                            "name": "args",
                            "type": "Array"
                        }
                    ],
                    "returntype": "Any"
                },
                {
                    "name": "Commit",
                    "parameters": [
                        {
                            "name": "claimId",
                            "type": "ByteArray"
                        },
                        {
                            "name": "ontId",
                            "type": "ByteArray"
                        }
                    ],
                    "returntype": "Boolean"
                },
                {
                    "name": "Revoke",
                    "parameters": [
                        {
                            "name": "claimId",
                            "type": "ByteArray"
                        },
                        {
                            "name": "ontId",
                            "type": "ByteArray"
                        }
                    ],
                    "returntype": "Boolean"
                },
                {
                    "name": "GetStatus",
                    "parameters": [
                        {
                            "name": "claimId",
                            "type": "ByteArray"
                        }
                    ],
                    "returntype": "ByteArray"
                }
            ],
                "events": [
                    {
                        "name": "ErrorMsg",
                        "parameters": [
                            {
                                "name": "arg1",
                                "type": "ByteArray"
                            },
                            {
                                "name": "arg2",
                                "type": "String"
                            }
                        ],
                        "returntype": "Void"
                    },
                    {
                        "name": "putrecord",
                        "parameters": [
                            {
                                "name": "arg1",
                                "type": "String"
                            },
                            {
                                "name": "arg2",
                                "type": "ByteArray"
                            },
                            {
                                "name": "arg3",
                                "type": "ByteArray"
                            }
                        ],
                        "returntype": "Void"
                    },
                    {
                        "name": "getRecord",
                        "parameters": [
                            {
                                "name": "arg1",
                                "type": "String"
                            },
                            {
                                "name": "arg2",
                                "type": "ByteArray"
                            }
                        ],
                        "returntype": "Void"
                    }
                ]
}