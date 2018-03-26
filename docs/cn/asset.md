## 数字资产账户 Account

#### Account 具有以下数据结构。

````
{
  address : string,
  label : string,
  isDefault : boolean,
  lock : boolean,
  algorithm : boolean,
  parameters : {
    curve : string
  },
  key : string,
  contract : {}
  extra : null
}
````

```address``` 是base58编码的账户地址。

```label``` 是账户的名称。

`isDefault` 表明账户是否是默认的账户。默认值为false。

`lock` 表明账户是否是被用户锁住的。客户端不能消费掉被锁的账户中的资金。

`algorithm` 是加密算法名称。

`parameters` 是加密算法所需参数。

```curve``` 是椭圆曲线的名称。

`key` 是NEP-2格式的私钥。该字段可以为null（对于只读地址或非标准地址）。

`contract` 是智能合约对象。该字段可以为null（对于只读的账户地址）。

`extra` 是客户端存储额外信息的字段。该字段可以为null。

#### Contract 具有以下数据结构

````
{
  script : string,
  parameters : [],
  deployed : boolean
}
````

`script` 是智能合约的脚本。当合约已经被部署到区块链上时，该字段可以为null。

`parameters` 是智能合约中函数所需的参数对象，组成的数组。

`deployed` 表明合约是否已被部署到区块链上。默认值为false。

###  创建账户

````
import {Account} from 'Ont'
var account = new Account()
//@param {string} privateKey 用户的私钥
//@param {string} password 密码
//@param {string} label 账户的名称
//@param {object} algorithmObj 可选参数，加密算法对象
account.create(privateKey, password, label, algorithmObj)
````

###  导入账户

导入账户的过程中会验证密码和加密后的私钥，如果不正确会抛出相应错误。

````
import { Account } from 'Ont'
//@param {accountDataStr} 账户的json格式字符串
//@param {encryptedPrivateKey} 加密后的私钥
//@param {password} 用来加密私钥的密码
var account;
try {
    account = Account.importAccount(accountDataStr, encryptedPrivateKey, password)
} catch(error) {
    //密码或私钥不正确
}
````

## 钱包 Wallet

钱包Wallet是一个Json格式的数据存储文件。在本体Ontology中， Wallet既可存储数字身份，也可以存储数字资产。

### Wallet 数据规范

````
{
	name: string;
    ontid: string;
    createTime: string;
    version: string;
    scrypt: {
        "n": number;
        "r": number;
        "p": number;
    };
    identities: Array<Identity>;
    accounts: Array<Account>;
    extra: null;
}
````

`name` 是用户为钱包所取的名称。

```ontid``` 是钱包唯一ontid。

```createTime``` 是ISO格式表示的钱包的创建时间，如 : "2018-02-06T03:05:12.360Z"

`version` 目前为固定值1.0，留待未来功能升级使用。

`scrypt` 是加密算法所需的参数，该算法是在钱包加密和解密私钥时使用。

`identities` 是钱包中所有数字身份对象的数组

```accounts``` 是钱包中所有数字资产账户对象的数组

```extra``` 是客户端由开发者用来存储额外数据字段，可以为null。

希望了解更多钱包数据规范请参考[Wallet_File_Specification](./Wallet_File_Specification.md).

### 创建钱包

用户可以从零开始创建自己的钱包。

#### 1）创建一个空的钱包

用户只需要传入钱包名称。

````
import {Wallet} from 'Ont'
var wallet = new Wallet()
wallet.create( name )
````

#### 2) 创建账户并添加到钱包中

用户需要提供**私钥，密码，账户名称**来创建新的账户。也可以指定创建账户所需的算法对象。创建过程也可以提供默认的算法对象。 同上。

创建好账户后添加到钱包中。

````
import {Account} from 'Ont'
var account = new Account()
account.create( privateKey, password, name )
wallet.addAccount(account)
````


## 数字资产转账 Transfer

####  转账函数说明
````
function makeTransferTransaction(tokenType:string, from : string, to : string, value : string,  privateKey : string)

tokenType: token 类型
from: 转账者的公钥哈希地址
to: 接收者的公钥哈希地址
value: 转账数值，需要乘以10^8以避免小数点后精度损失
privateKey: 转账者公钥对应的私钥
````

####Token类型
````
TOKEN_TYPE = {
  ONT : 'ONT',  //Ontology Token
  ONG : 'ONG'   //Ontology Gas
}
````

#### 样例
````
import { makeTransferTransaction } from "../src/transaction/makeTransactions";

var tx = makeTransferTransaction( 'ONT', '0144587c1094f6929ed7362d6328cffff4fb4da2', 'ffeeddccbbaa99887766554433221100ffeeddcc', '1000000000', '760bb46952845a4b91b1df447c2f2d15bb40ab1d9a368d9f0ee4bf0d67500160' )

var rpcData = buildRpcParam(tx)

axios.post('127.0.0.1:20386', rpcData).then(res => {
       console.log('transfer response: ' + JSON.stringify(res.data))
   }).catch(err => {
       console.log(err)
   })
````

## 数字资产查询 getBalance
####查询余额链接
````
http://${nodeURL}:${httpRestPort}/api/v1/balance/${address}
````

####样例：
````
let request = `http://127.0.0.1:20384/api/v1/balance/TA5uYzLU2vBvvfCMxyV2sdzc9kPqJzGZWq`
	axios.get(request).then((res : any) => {
		if(res.data.Error === 0) {
			let obj = {
				error : 0,
				result : res.data.Result
			}
		} else {
			let obj = {
				error: res.data.Error,
				result : ''
			}
		}
	}).catch( (err:any) => {
		let obj = {
			error: JSON.stringify(err),
			result: ''
		}
	})
````
