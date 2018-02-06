import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'

export class controlData {
    algorithm: string;
    parameters: {
        curve: string;
    };
    id: string;
    key: string;
}

export class identityData {
    ontid: string;
    label: string;
    isDefault: boolean;
    lock: boolean;
    controls: Array<controlData>;
    extra: null;
}

export class Identity {

    jsonControl = {
        algorithm: "",
        parameters: {
            curve: "",
        },
        id: "",
        key: "",
    };

    jsonIdentity = {
        ontid: "",
        label: "",
        isDefault: false,
        lock: false,
        controls: [],
        extra: null,
    };

    identity: identityData;
    privateKey: Array<string> = [""];
    wifKey: Array<string> = [""];

    constructor() {
    }

    createSecp256r1( privateKey: string, keyphrase: string, label: string ): string {
        this.privateKey[0] = privateKey;
        //console.log( "privateKey:",this.privateKey[0] );

        this.wifKey[0] = core.getWIFFromPrivateKey( privateKey );
        //console.log( "wifKey:",this.wifKey[0] );

        // identity
        let identity = (<identityData>this.jsonIdentity);

        identity.ontid = "";
        identity.label = label;
        identity.isDefault = true;
        identity.lock = false;

        // control
        let control = (<controlData>this.jsonControl);

        control.algorithm = "ECDSA";
        control.parameters = {
            "curve":"secp256r1"
        };
        control.id = "1";
        control.key = scrypt.encrypt( this.wifKey[0], keyphrase );

        identity.controls.push( control );

        // ontid
        let publicKeyEncoded = ab2hexstring( core.getPublicKey( privateKey, true ) );
        let signatureScript = core.createSignatureScript( publicKeyEncoded );
        let programHash = core.getHash( signatureScript );
        identity.ontid = "did:ont:" + core.toAddress( programHash );

        this.identity = identity;

        return JSON.stringify(this.identity);
    }

    decrypt( id: identityData, keyphrase: string ): boolean {
        this.identity = id;
        // console.log( this.identity );
        console.log(this.identity.controls)
        for ( let i=0; i<this.identity.controls.length; i++ ) {
            this.wifKey[i] = scrypt.decrypt( this.identity.controls[i].key, keyphrase );
            if(!this.wifKey[i]) {
                //keyphrase is error
                return false
            }
            console.log( "decrypt Identity wifKey[" + i + "]:", this.wifKey[i] );

            this.privateKey[i] = core.getPrivateKeyFromWIF( this.wifKey[i] );
            console.log( "decrypt Identity privateKey[" + i + "]:", this.privateKey[i] );
        }

        return true;
    }
}

