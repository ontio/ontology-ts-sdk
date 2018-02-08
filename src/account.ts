import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'

export class Account {
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

    privateKey: string;
    wifKey: string;

    constructor() {
    }

    createSecp256r1( privateKey: string, keyphrase: string, label: string ): string {
        this.privateKey = privateKey;
        //console.log( "privateKey:",this.privateKey );

        this.wifKey = core.getWIFFromPrivateKey( privateKey );
        //console.log( "wifKey:",this.wifKey );

        let contract = {
            script : '',
            parameters : [],
            deployed : false
        }

        this.address = "";
        this.label = label;
        this.isDefault = false;
        this.lock = false;
        this.algorithm = "ECDSA";
        this.parameters = {
            "curve":"secp256r1"
        };
        this.key = scrypt.encrypt( this.wifKey, keyphrase );

        let publicKeyEncoded = ab2hexstring( core.getPublicKey( privateKey, true ) );
        contract.script = core.createSignatureScript( publicKeyEncoded );
        this.contract = contract 

        let programHash = core.getHash( this.contract.script );
        this.address = core.toAddress( programHash );

        return this.toJson();
    }

    toJson() : string {
        let obj = {
            address: this.address,
            label: this.label,
            isDefault: this.isDefault,
            lock: this.lock,
            algorithm: this.algorithm,
            parameters: this.parameters,
            key: this.key,
            contract: this.contract,
            extra: this.extra
        }
        return JSON.stringify(obj)
    }

    static parseJson( json : string ) : Account {
        let obj = JSON.parse(json)
        let account = new Account()
        account.address = obj.address
        account.label = obj.label
        account.isDefault = obj.isDefault
        account.lock = obj.lock
        account.algorithm = obj.algorithm
        account.parameters = obj.parameters
        account.key = obj.key
        account.contract = obj.contract
        account.extra = obj.extra
        return account;
    }

    decrypt( keyphrase: string ): boolean {

        this.wifKey = scrypt.decrypt( this.key, keyphrase );
        if(!this.wifKey) {
            //keyphase is error
            return false
        }
        console.log( "decrypt Account wifKey:", this.wifKey );

        this.privateKey = core.getPrivateKeyFromWIF( this.wifKey );
        console.log( "decrypt Account privateKey:", this.privateKey );

        return true;
    }


}

