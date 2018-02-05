import * as core from './core'
import { identityData, controlData, Identity } from './identity'
import { accountData, Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { formatDate, ab2hexstring, hexstring2ab } from './utils'
import { access } from 'fs';
import { format } from 'url';

class walletData {
    name: string;
    ontid : string;
    createTime : string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<identityData>;
    accounts: Array<accountData>;
    extra: null;
};

export class Wallet {
    jsonWallet = {
        name: "",
        ontid : "",
        createTime : "",
        version: "",
        scrypt: {
            "n": 0,
            "r": 0,
            "p": 0
        },
        identities: [],
        accounts: [],
        extra: null,
    };

    wallet: walletData;
    identity: Array<Identity> = [];
    account: Array<Account> = [];

    constructor() {
    }

    create( name: string, keyphrase: string ): string {
        // wallet
        let wallet = (<walletData>this.jsonWallet);

        wallet.name = name;
        
        //createtime
        wallet.createTime = formatDate( new Date() )
        wallet.version = "1.0";
        wallet.scrypt = {
            "n": 16384,
            "r": 8,
            "p": 8
        };

        let privateKeyForIdentity = ab2hexstring( core.generatePrivateKey() );
        // let privateKeyForAccount = ab2hexstring( core.generatePrivateKey() );

        // identity
        let identity = new Identity();
        let jsonId = identity.createSecp256r1( privateKeyForIdentity, keyphrase, "Default Identity" );
        wallet.identities.push(identity.identity);
        
        //ontid
        wallet.ontid = identity.identity.ontid
        // no need to create default account

        this.wallet = wallet;

        return JSON.stringify(this.wallet);
    }

    addAccount(account: accountData) : void {
        for (let ac of this.wallet.accounts) {
            if(ac.key === accountData.key) {
                return;
            }
        }
        this.wallet.accounts.push(account)
    }

    addIdentity(identity : identityData) :void {
        for (let item of this.wallet.identities) {
            if (item.ontid === identity.ontid) {
                return;
            }
        }
        this.wallet.identities.push(identity)
    }

    decryptWallet( jsonData: string, keyphrase: string ): number {
        this.wallet = JSON.parse(jsonData);

        // identity
        for ( let i=0; i<this.wallet.identities.length; i++ ){
            this.identity[i] = new Identity();
            this.identity[i].decrypt( this.wallet.identities[i], keyphrase );
        }

        // account
        for ( let i=0; i<this.wallet.accounts.length; i++ ){
            this.account[i] = new Account();
            this.account[i].decrypt( this.wallet.accounts[i], keyphrase );
        }

        return 0;
    }

    //todo load wallet
    load
}

