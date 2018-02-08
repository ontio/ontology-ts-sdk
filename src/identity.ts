import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'
import {DEFAULT_ALGORITHM} from './consts'

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

    ontid: string;
    label: string;
    isDefault: boolean;
    lock: boolean;
    controls: Array<controlData>;
    extra: null;

    //why not put in controlData
    privateKey: Array<string> = [""];
    wifKey: Array<string> = [""];

    constructor() {
    }

    create( privateKey: string, keyphrase: string, label: string, algorithmObj ?: {} ): Identity {
        this.privateKey[0] = privateKey;
        //console.log( "privateKey:",this.privateKey[0] );

        this.wifKey[0] = core.getWIFFromPrivateKey( privateKey );
        //console.log( "wifKey:",this.wifKey[0] );

        this.ontid = "";
        this.label = label;
        this.isDefault = false;
        this.lock = false;

        // control
        let control = (<controlData> {})

        //algorithm
        if (algorithmObj) {
            control.algorithm = algorithmObj.algorithm
            control.parameters = algorithmObj.parameters
        } else {
            control.algorithm = DEFAULT_ALGORITHM.algorithm
            control.parameters = DEFAULT_ALGORITHM.parameters
        }

        //generate id to simple?
        control.id = "1";
        control.key = scrypt.encrypt( this.wifKey[0], keyphrase );

        this.controls.push( control );

        // ontid
        let publicKeyEncoded = ab2hexstring( core.getPublicKey( privateKey, true ) );
        let signatureScript = core.createSignatureScript( publicKeyEncoded );
        let programHash = core.getHash( signatureScript );
        this.ontid = "did:ont:" + core.toAddress( programHash );

        return this
    }

    static importIdentity(encryptedPrivateKey : string, password : string, ontid : string, algorithmObj ?: {}) : Identity {
        let identity = new Identity()
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password);
        if (!wifKey) {
            //password is error
            throw "Password error";
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        identity.privateKey[0] = privateKey
        identity.wifKey[0] = wifKey
        identity.ontid = ontid
        identity.label = ""
        identity.lock = false
        identity.isDefault = false

        // control
        let control = (<controlData>{})

        //algorithm
        if (algorithmObj) {
            control.algorithm = algorithmObj.algorithm
            control.parameters = algorithmObj.parameters
        } else {
            control.algorithm = DEFAULT_ALGORITHM.algorithm
            control.parameters = DEFAULT_ALGORITHM.parameters
        }

        //generate id to simple?
        control.id = "1";
        control.key = encryptedPrivateKey

        identity.controls.push(control);

        return identity
    }

    toJson(): string {
        let obj = {
            ontid: this.ontid,
            label: this.label,
            isDefault: this.isDefault,
            lock: this.lock,
            controls: this.controls,
            extra: this.extra,

            //why not put in controlData
            privateKey: this.privateKey,
            wifKey: this.wifKey
        }
        return JSON.stringify(obj)
    }

    static parseJson(json: string): Identity {
        let obj = JSON.parse(json)
        let id = new Identity()
        id.ontid = obj.ontid
        id.label = obj.label
        id.isDefault = obj.isDefault
        id.lock = obj.lock
        id.controls = obj.controls
        id.extra = obj.extra
        id.privateKey = obj.privateKey
        id.wifKey = obj.wifKey
        return id;
    }
}

