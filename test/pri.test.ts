import { PrivateKey } from '../src/crypto/PrivateKey';
import { str2hexstr } from '../src/utils';
import { Account } from './../src/account';
import { Address } from './../src/crypto/address';
import { PublicKey } from './../src/crypto/PublicKey';

describe('private', () => {

    function createDec() {
        const params = {
            cost: 16384, // 除以2时间减半
            blockSize: 8,
            parallel: 8,
            size: 64
        };
        const password = '$Pass1234';
        const pri = PrivateKey.random();
        const account = Account.create(pri, password, '', params);
        const accountObj = account.toJsonObj();
        const enc = new PrivateKey(accountObj.key);
        const addr = new Address(accountObj.address);
        let pri2;
        try {
            pri2 = enc.decrypt(password, addr, accountObj.salt, params);
        } catch (err) {
            console.log('Found: ');
            console.log('Pri1: ' + pri.key);
            console.log('Pri2: ' + pri2.key);
            throw Error('Found');
        }
    }
    test('500', () => {
        for (let i = 1; i <= 1000; i++ ) {
            createDec();
        }
    });
});
