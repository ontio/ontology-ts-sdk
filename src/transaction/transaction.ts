/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as cryptoJS from 'crypto-js';
import Fixed64 from '../common/fixed64';
import Uint256 from '../common/uint256';
import { PublicKey } from '../crypto';
import { Address } from '../crypto/address';
import { generateRandomArray } from '../helpers';
import { ab2hexstring, hex2VarBytes, num2hexstring, StringReader } from '../utils';
import DeployCode from './payload/deployCode';
import InvokeCode from './payload/invokeCode';
import Payload from './payload/payload';
import { TransactionAttribute } from './txAttribute';

export enum TxType  {
    BookKeeping     = 0x00,
    IssueAsset      = 0x01,
    BookKeeper      = 0x02,
    Claim           = 0x03,
    PrivacyPayload  = 0x20,
    RegisterAsset   = 0x40,
    TransferAsset   = 0x80,
    Record          = 0x81,
    Deploy          = 0xd0,
    Invoke          = 0xd1,
    DataFile        = 0x12,
    Enrollment      = 0x04,
Vote            = 0x05
}

export const TxName = {
    BookKeeping: 'BookKeeping',
    IssueAsset: 'IssueAsset',
    BookKeeper: 'BookKeeper',
    Claim: 'Claim',
    PrivacyPayload: 'PrivacyPayload',
    RegisterAsset: 'RegisterAsset',
    TransferAsset: 'TransferAsset',
    Record: 'Record',
    Deploy: 'Deploy',
    Invoke: 'Invoke',
    DataFile: 'DataFile',
    Enrollment: 'Enrollment',
    Vote: 'Vote'
};

export class Fee {
    static deserialize(sr: StringReader): Fee {
        const fee = new Fee();
        const amount = Fixed64.deserialize(sr);
        const payer = sr.read(20);
        fee.amount = amount;
        fee.payer = new Address(payer);
        return fee;
    }

    amount: Fixed64;

    // 20 bytes address
    payer: Address;

    serialize(): string {
        let result = '';
        result += this.amount.serialize();
        result += this.payer.toHexString();
        return result;
    }
}

export class Sig {
    static deserialize(sr: StringReader) {
        const sig = new Sig();
        sig.pubKeys = [];
        const pubKeyLength = sr.readNextLen();

        for (let i = 0; i < pubKeyLength; i++) {
            const serializedLength = sr.readNextLen();
            const pk = PublicKey.deserializeHex(sr, serializedLength);
            sig.pubKeys.push(pk);
        }

        sig.M = sr.readNextLen();
        sig.sigData = [];

        const dataLength = sr.readNextLen();
        for (let i = 0; i < dataLength; i++) {
            const data = sr.readNextBytes();
            sig.sigData.push(data);
        }

        return sig;
    }

    pubKeys: PublicKey[];

    // M uint8
    M: number;

    // sigData hexstrings array
    sigData: string[];

    serialize() {
        let result = '';
        result += num2hexstring(this.pubKeys.length);

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.pubKeys.length; i++) {
            const serialized = this.pubKeys[i].serializeHex();
            result += num2hexstring(serialized.length / 2);
            result += serialized;
        }

        result += num2hexstring(this.M);

        result += num2hexstring(this.sigData.length);

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.sigData.length; i++) {
            result += hex2VarBytes(this.sigData[i]);
        }
        return result;
    }
}

export class Transaction {
    static deserialize(hexstring: string): Transaction {
        const tx = new Transaction();

        // console.log(' hexstring' + hexstring)
        const ss = new StringReader(hexstring);

        tx.version = parseInt(ss.read(1), 16);
        tx.type = parseInt(ss.read(1), 16);
        tx.nonce = ss.read(4);
        tx.gasPrice = Fixed64.deserialize(ss);
        tx.gasLimit = Fixed64.deserialize(ss);
        tx.payer = new Address(ss.read(20));
        let payload;

        switch (tx.type) {
        case TxType.Invoke :
            payload = new InvokeCode();
            break;
        case TxType.Deploy:
            payload = new DeployCode();
            break;
        default :
            payload = new InvokeCode();
        }
        payload.deserialize(ss);
        tx.payload = payload;
        tx.txAttributes = [];
        tx.sigs = [];

        const attributeLength = ss.readNextLen();
        for (let i = 0; i < attributeLength; i++) {
            const txAttribute = new TransactionAttribute();
            txAttribute.deserialize(ss);
            tx.txAttributes.push(txAttribute);
        }

        const sigLength = ss.readNextLen();
        for (let i = 0; i < sigLength; i++) {
            tx.sigs.push(Sig.deserialize(ss));
        }

        return tx;
    }

    type: TxType = 0xd1;

    version: number = 0x00;

    payload: Payload;

    // hexstring for uint32 = 4bytes
    nonce: string;

    txAttributes: TransactionAttribute[] = [];

    gasPrice: Fixed64;

    gasLimit: Fixed64;

    payer: Address;

    sigs: Sig[] = [];

    hash: Uint256;

    constructor() {
        this.nonce = ab2hexstring(generateRandomArray(4));
        this.gasPrice = new Fixed64();

        // const limit = num2hexstring(DEFAULT_GAS_LIMIT, 8, true);

        this.gasLimit = new Fixed64();
        this.payer = new Address('0000000000000000000000000000000000000000');
    }

    serialize(): string {
        const unsigned = this.serializeUnsignedData();
        const signed = this.serializeSignedData();

        return unsigned + signed;
    }

    serializeUnsignedData() {
        let result = '';
        result += num2hexstring(this.version);
        result += num2hexstring(this.type);

        // nonce 4bytes
        result += this.nonce;
        result += this.gasPrice.serialize();
        result += this.gasLimit.serialize();
        result += this.payer.toHexString();
        result += this.payload.serialize();

        // serialize transaction attributes
        result += num2hexstring(this.txAttributes.length);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.txAttributes.length; i++) {
            result += this.txAttributes[i].serialize();
        }
        // result += num2hexstring(this.fee.length)
        // for (let i=0 ; i< this.fee.length; i++) {
        //     result += this.fee[i].amount.serialize()
        //     result += this.fee[i].payer.toHexString()
        // }

        // if(this.networkFee) {
        //     result += this.networkFee.serialize()
        // }

        return result;
    }

    serializeSignedData() {
        let result = '';
        // programs
        result += num2hexstring(this.sigs.length);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.sigs.length; i++) {
            result += this.sigs[i].serialize();
        }

        return result;
    }

    getHash() {
        const data = this.serializeUnsignedData();

        const ProgramHexString = cryptoJS.enc.Hex.parse(data);
        const ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
        const ProgramSha2562 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();

        return ProgramSha2562;
    }
}
