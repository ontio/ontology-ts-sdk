export default {
    "hash": "8055b362904715fd84536e754868f4c8d27ca3f6",
        "entrypoint": "Main",
            "functions":
    [
        {
            "name": "Main",
            "parameters":
                [
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
            "name": "RegIdWithPublicKey",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "RegIdWithAttributes",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    },
                    {
                        "name": "tuples",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "AddKey",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "newPublicKey",
                        "type": "ByteArray"
                    },
                    {
                        "name": "sender",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "RemoveKey",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "oldPublicKey",
                        "type": "ByteArray"
                    },
                    {
                        "name": "sender",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "AddRecovery",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "recovery",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "ChangeRecovery",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "newRecovery",
                        "type": "ByteArray"
                    },
                    {
                        "name": "recovery",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "AddAttribute",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "path",
                        "type": "ByteArray"
                    },
                    {
                        "name": "type",
                        "type": "ByteArray"
                    },
                    {
                        "name": "value",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "RemoveAttribute",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "path",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Boolean"
        },
        {
            "name": "GetPublicKeys",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        },
        {
            "name": "GetAttributes",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        },
        {
            "name": "GetPublicKeyId",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        },
        {
            "name": "GetPublicKeyStatus",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "pkId",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        },
        {
            "name": "GetRecovery",
            "parameters":
                [
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        },
        {
            "name": "GetDDO",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "nonce",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "ByteArray"
        }
    ],
        "events":
    [
        {
            "name": "Register",
            "parameters":
                [
                    {
                        "name": "op",
                        "type": "String"
                    },
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Void"
        },
        {
            "name": "PublicKey",
            "parameters":
                [
                    {
                        "name": "op",
                        "type": "String"
                    },
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publicKey",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Void"
        },
        {
            "name": "Attribute",
            "parameters":
                [
                    {
                        "name": "op",
                        "type": "String"
                    },
                    {
                        "name": "ontId",
                        "type": "ByteArray"
                    },
                    {
                        "name": "attrName",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Void"
        },
        {
            "name": "Debug",
            "parameters":
                [
                    {
                        "name": "func",
                        "type": "String"
                    },
                    {
                        "name": "info",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Void"
        },
        {
            "name": "Debug",
            "parameters":
                [
                    {
                        "name": "func",
                        "type": "String"
                    },
                    {
                        "name": "trace",
                        "type": "Integer"
                    }
                ],
            "returntype": "Void"
        }
    ]
}