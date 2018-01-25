import * as CryptoJS from 'crypto-js'
import * as Ecurve from 'ecurve'
import * as BigInteger from 'bigi'
import * as Base58 from 'bs58'

import * as Utils from './utils'

export class Account {
    passwordHash: string;
    iv: string;
    masterKey: string;
    publicKeyHash: string;
    privateKeyEncrypted: string;

    privateKey: string;
    publicKeyEncoded: string;
    scriptHash: string;
    address: string;

    bDecrypt: boolean;

    constructor() {
        this.bDecrypt = false;
    }

    load( passwordHash:string, iv:string, masterKey:string, publicKeyHash:string, privateKeyEncrypted:string ) {
        this.passwordHash = passwordHash;
        this.iv = iv;
        this.masterKey = masterKey;
        this.publicKeyHash = publicKeyHash;
        this.privateKeyEncrypted = privateKeyEncrypted;
    }

    getOntID(): string {
        if ( this.bDecrypt ) {
            return "did:ont:" + this.address;
        } else {
            return "";
        }
    }

    toAddress( programhash: string ): string  {
        var data = "17" + programhash;
        console.log(data);
    
        var ProgramHexString = CryptoJS.enc.Hex.parse(data);
        var ProgramSha256 = CryptoJS.SHA256( ProgramHexString ).toString();
        var ProgramSha256_2 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
        var ProgramSha256Buffer = Utils.hexstring2ab(ProgramSha256_2);
        console.log(ProgramSha256_2);
    
        var datas = data + ProgramSha256_2.slice(0,8);
        console.log(datas);
    
        return Base58.encode(Utils.hexstring2ab(datas));
    };

    generateRandomArray(len: number): ArrayBuffer {
        var randomAB = new ArrayBuffer(len);
        var randomArray = new Uint8Array(randomAB);
        for (var i = 0; i < len; i++) {
            randomArray[i] = Math.floor(Math.random() * 256);
        }
    
        return randomAB;
    }

    generatePrivateKey(): ArrayBuffer {
        return this.generateRandomArray(32);
    }

    getPublicKey( privateKey: string, encode: boolean ): any {
        var ecparams = Ecurve.getCurveByName('secp256r1');
        var curvePt = ecparams.G.multiply(BigInteger.fromBuffer(Utils.hexstring2ab(privateKey)));

        return curvePt.getEncoded(encode);
    };

    createSignatureScript( publicKeyEncoded : string ): string {
        return "21" + publicKeyEncoded + "ac";
    };

    getHash( SignatureScript: string ): string {
        var ProgramHexString = CryptoJS.enc.Hex.parse(SignatureScript);
        var ProgramSha256 = CryptoJS.SHA256(ProgramHexString).toString();

        return CryptoJS.RIPEMD160( CryptoJS.enc.Hex.parse(ProgramSha256) ).toString();
    };

    create( privateKey: string, password: string ): string {

        var accountData = { "PasswordHash":"", "IV":"", "MasterKey":"", "PublicKeyHash":"", "PrivateKeyEncrypted":"", "ScriptHash":"", "Address":"" };

        // var a={"name":"tom","sex":"男","age":"24"};
        // var b='{"name":"Mike","sex":"女","age":"29"}';
        
        // var aToStr=JSON.stringify(a);
        // var bToObj=JSON.parse(b);
        
        var passwordhash1 = CryptoJS.SHA256( password ).toString();
        var passwordhash2 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(passwordhash1) ).toString();
        var passwordHash3 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(passwordhash2) ).toString();
        accountData.PasswordHash = passwordHash3;
        console.log( "passwordHash: ", passwordHash3 );

        var iv = this.generateRandomArray(16);
        accountData.IV = Utils.ab2hexstring(iv);
        console.log( "iv: ", Utils.ab2hexstring(iv) );
    
        var masterKey = this.generateRandomArray(32);
        console.log( "masterKey: ", Utils.ab2hexstring(masterKey) );

        // Encrypt MasterKey
        var masterKeyPlain = CryptoJS.enc.Hex.parse(Utils.ab2hexstring(masterKey));
        var key = CryptoJS.enc.Hex.parse(passwordhash2);
        var ivData = CryptoJS.enc.Hex.parse(Utils.ab2hexstring(iv));
        var masterKeyEncrypt = CryptoJS.AES.encrypt(masterKeyPlain, key, {
            iv: ivData,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding
        });
        accountData.MasterKey = masterKeyEncrypt.ciphertext.toString();
        console.log( "masterKeyEncrypt: ", masterKeyEncrypt.ciphertext.toString() );

        var publicKey = this.getPublicKey(privateKey, false);
        console.log( "publicKey: ", publicKey.toString('hex') );
    
        var publicKeyEncoded = this.getPublicKey(privateKey, true);
        console.log( "publicKeyEncoded: ", publicKeyEncoded.toString('hex') );
    
        var scriptCode = this.createSignatureScript(publicKeyEncoded.toString('hex'));
        console.log( "scriptCode: ", scriptCode );
    
        var scriptHash = this.getHash(scriptCode);
        accountData.ScriptHash = scriptHash.toString();
        console.log( "scriptHash: ", scriptHash.toString() );

        var address = this.toAddress( scriptHash.toString() );
        accountData.Address = address;
        console.log( "address: ", address );
    
        var publicKeyHash = this.getHash(publicKeyEncoded.toString('hex'));
        accountData.PublicKeyHash = publicKeyHash.toString();
        console.log( "publicKeyHash: ", publicKeyHash.toString() );

        // PrivateKey Data
        var privateKeyData = publicKey.slice(1, 65).toString('hex') + privateKey;
        console.log( "privateKeyData: ", privateKeyData );

        // Encrypt PrivateKey Data
        var privateKeyDataPlain = CryptoJS.enc.Hex.parse(privateKeyData);
        var privateKeyDataEncrypted = CryptoJS.AES.encrypt(privateKeyDataPlain, masterKeyPlain, {
            iv: ivData,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding
        });
        accountData.PrivateKeyEncrypted = privateKeyDataEncrypted.ciphertext.toString();
        console.log( "privateKeyDataEncrypted: ", privateKeyDataEncrypted.ciphertext.toString() );

        return JSON.stringify(accountData);
    }

    decrypt( password: string ): number {
       
        var passwordhash1 = CryptoJS.SHA256( password ).toString();
        var passwordhash2 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(passwordhash1) ).toString();
        var passwordhash3 = CryptoJS.SHA256( CryptoJS.enc.Hex.parse(passwordhash2) ).toString();

        console.log( "passwordhash3:", passwordhash3 );

        if (passwordhash3 != this.passwordHash) {
             //PASSWORD WRONG
             return -1;
         }

        // Decrypt MasterKey
        var data = CryptoJS.enc.Hex.parse(this.masterKey);
        var dataBase64 = CryptoJS.enc.Base64.stringify(data);
        var key = CryptoJS.enc.Hex.parse(passwordhash2.toString());
        var iv = CryptoJS.enc.Hex.parse(this.iv);

        var plainMasterKey = CryptoJS.AES.decrypt(dataBase64, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding
        });

        console.log( "plainMasterKey:", plainMasterKey.toString() );

        // Decrypt PrivateKey
		var privateKeyEncrypted = CryptoJS.enc.Hex.parse(this.privateKeyEncrypted);
        var privateKeyBase64 = CryptoJS.enc.Base64.stringify(privateKeyEncrypted);
        
		var plainprivateKey = CryptoJS.AES.decrypt(privateKeyBase64, CryptoJS.enc.Hex.parse(plainMasterKey.toString()), {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.NoPadding
		});

        console.log( "plainprivateKey:", plainprivateKey.toString() );
        
        var privateKeyHexString = plainprivateKey.toString().slice(128, 192);
        this.privateKey = privateKeyHexString;
		console.log( "privateKeyHexString:", privateKeyHexString);

		// Verify PublicKeyHash
		var ecparams = Ecurve.getCurveByName('secp256r1');
        var curvePt = ecparams.G.multiply(BigInteger.fromBuffer(Utils.hexstring2ab(privateKeyHexString)));
        
        // Get PublicKeyEncoded
		var publicKeyEncoded = curvePt.getEncoded(true);
        this.publicKeyEncoded = publicKeyEncoded.toString('hex');
        console.log( "publicKeyEncoded:", publicKeyEncoded.toString('hex') );

        // Get PublicKeyHash
		var publicKeyEncodedHexString = CryptoJS.enc.Hex.parse(publicKeyEncoded.toString('hex'));
		var publicKeyEncodedSha256 = CryptoJS.SHA256(publicKeyEncodedHexString);
        var publicKeyHash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(publicKeyEncodedSha256.toString()));
        
        console.log( "publicKeyHash:", publicKeyHash.toString() );

        if (publicKeyHash.toString() != this.publicKeyHash) {
			return -2;
		}

		// Get ProgramHash
		var ProgramHexString = CryptoJS.enc.Hex.parse("21" + publicKeyEncoded.toString('hex') + "ac");
		var ProgramSha256 = CryptoJS.SHA256(ProgramHexString);
		var ProgramHash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(ProgramSha256.toString()));
		this.scriptHash = ProgramHash.toString();
		console.log( "ProgramHash:", ProgramHash.toString() );

		// Get Address
        var address = this.toAddress(ProgramHash.toString());
        this.address = address;
        console.log("address:", address);

        this.bDecrypt = true;
        
        return 0;
    }
}

