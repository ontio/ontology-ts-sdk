import * as Ecurve from 'ecurve'
import * as Core from './core'

//Deprecated. Wiil be removed.
export class Transaction {
    constructor() {
    }

    makeInvokeCodeTransaction( InvokeProgramHash:string, did:string, publicKeyEncoded: string ): string {
        
        ////////////////////////////////////////////////////////////////////////
        // type
        let data = "d1";

        // version
        data = data + "00";

        ///////////////////////
        // InvokeCode payload
        
        // InvokeProgramHash
        data = data + InvokeProgramHash;

        // param Len
        data = data + "69";

        // publicKey Len
        data = data + "21";

        // publicKey
        data = data + publicKeyEncoded;

        // did Len
        data = data + "2a";

        // did
        data = data + did;

        // param Len
        data = data + "52";

        // param end 
        data = data + "c1";

        // method string Len
        data = data + "19";

        // CreateIdentityByPublicKey string
        data = data + "4372656174654964656e7469747942795075626c69634b6579";

        ///////////////////////

        // attribute
        data = data + "01";

        // AttributeUsage_Script
        data = data + "20";

        // scripthash len
        data = data + "14";

        // scripthash
        let signatureScript = Core.createSignatureScript(publicKeyEncoded);
        console.log( signatureScript );
        data = data + Core.getHash(signatureScript);
        console.log( Core.getHash(signatureScript) );

        // Inputs
        data = data + "00";

        // Outputs
        data = data + "00";

        return data;
    }

}