import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'

export class accountData {
    address: string;
    label: string;
    isDefault: boolean;
    lock: boolean;
    algorithm: string;
    parameters: {
        curve: string;
    };
    key: string;
    contract: {
        script: string;
        parameters: Array<string>;
        deployed: boolean;
    };
    extra: null;
};

export class Account {
    jsonAccount = {
        address: "",
        label: "",
        isDefault: false,
        lock: false,
        algorithm: "",
        parameters: {
            curve: "",
        },
        key: "",
        contract: {
            script: "",
            parameters: [],
            deployed: false,
        },
        extra: null,
    };

    account: accountData;
    privateKey: string;
    wifKey: string;

    constructor() {
    }

    createSecp256r1( privateKey: string, keyphrase: string, label: string ): string {
        this.privateKey = privateKey;
        //console.log( "privateKey:",this.privateKey );

        this.wifKey = core.getWIFFromPrivateKey( privateKey );
        //console.log( "wifKey:",this.wifKey );

        // account
        let account = (<accountData>this.jsonAccount);

        account.address = "";
        account.label = label;
        account.isDefault = true;
        account.lock = false;
        account.algorithm = "ECDSA";
        account.parameters = {
            "curve":"secp256r1"
        };
        account.key = scrypt.encrypt( this.wifKey, keyphrase );

        let publicKeyEncoded = ab2hexstring( core.getPublicKey( privateKey, true ) );
        account.contract.script = core.createSignatureScript( publicKeyEncoded );

        let programHash = core.getHash( account.contract.script );
        account.address = core.toAddress( programHash );

        this.account = account;

        return JSON.stringify(this.account);
    }

    decrypt( ac: accountData, keyphrase: string ): number {
        this.account = ac;

        this.wifKey = scrypt.decrypt( this.account.key, keyphrase );
        console.log( "decrypt Account wifKey:", this.wifKey );

        this.privateKey = core.getPrivateKeyFromWIF( this.wifKey );
        console.log( "decrypt Account privateKey:", this.privateKey );

        return 0;
    }
}

