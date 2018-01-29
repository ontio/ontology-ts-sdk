import * as core from './core'
import { identityData, controlData, Identity } from './identity'
import { accountData, Account } from './account'
import { DEFAULT_SCRYPT } from './consts'
import { ab2hexstring, hexstring2ab } from './utils'

class packetData {
    name: string;
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

export class Packet {
    jsonPacket = {
        name: "",
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

    packet: packetData;
    identity: Array<Identity> = [];
    account: Array<Account> = [];

    constructor() {
    }

    create( name: string, keyphrase: string ): string {
        // packet
        let packet = (<packetData>this.jsonPacket);

        packet.name = name;
        packet.version = "1.0";
        packet.scrypt = {
            "n": 16384,
            "r": 8,
            "p": 8
        };

        let privateKeyForIdentity = ab2hexstring( core.generatePrivateKey() );
        let privateKeyForAccount = ab2hexstring( core.generatePrivateKey() );

        // identity
        let identity = new Identity();
        let jsonId = identity.createSecp256r1( privateKeyForIdentity, keyphrase, "Default Identity" );
        packet.identities.push(identity.identity);

        // account
        let account = new Account();
        let jsonAc = account.createSecp256r1( privateKeyForAccount, keyphrase, "Default Account" );
        packet.accounts.push(account.account);

        this.packet = packet;

        return JSON.stringify(this.packet);
    }

    decrypt( jsonData: string, keyphrase: string ): number {
        this.packet = JSON.parse(jsonData);

        // identity
        for ( let i=0; i<this.packet.identities.length; i++ ){
            this.identity[i] = new Identity();
            this.identity[i].decrypt( this.packet.identities[i], keyphrase );
        }

        // account
        for ( let i=0; i<this.packet.accounts.length; i++ ){
            this.account[i] = new Account();
            this.account[i].decrypt( this.packet.accounts[i], keyphrase );
        }

        return 0;
    }
}

