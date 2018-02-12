export default {
    "hash": "0x2bf4739a5abb60e084a7c99d790de026d4ac61c9",
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
            "returntype": "Array"
        },
        {
            "name": "RegIdWithPublicKey",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "pk",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "RegId",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "pk",
                        "type": "ByteArray"
                    },
                    {
                        "name": "tuples",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "AddKey",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "newpubkey",
                        "type": "ByteArray"
                    },
                    {
                        "name": "sender",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "RemoveKey",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "oldpubkey",
                        "type": "ByteArray"
                    },
                    {
                        "name": "sender",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "AddRecovery",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "recovery",
                        "type": "ByteArray"
                    },
                    {
                        "name": "pk",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "ChangeRecovery",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "newrecovery",
                        "type": "ByteArray"
                    },
                    {
                        "name": "recovery",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "AddAttribute",
            "parameters":
                [
                    {
                        "name": "id",
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
                        "name": "pk",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "RemoveAttribute",
            "parameters":
                [
                    {
                        "name": "id",
                        "type": "ByteArray"
                    },
                    {
                        "name": "path",
                        "type": "ByteArray"
                    },
                    {
                        "name": "pk",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Any"
        },
        {
            "name": "GetPublicKeys",
            "parameters":
                [
                    {
                        "name": "id",
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
                        "name": "id",
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
                        "name": "ontid",
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
                        "name": "ontid",
                        "type": "ByteArray"
                    },
                    {
                        "name": "publickey",
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
                        "name": "ontid",
                        "type": "ByteArray"
                    },
                    {
                        "name": "attrname",
                        "type": "ByteArray"
                    }
                ],
            "returntype": "Void"
        }
    ]
}