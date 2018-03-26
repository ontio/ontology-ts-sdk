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

### 3.1 创建账户

````
import {Account} from 'Ont'
var account = new Account()
//@param {string} privateKey 用户的私钥
//@param {string} password 密码
//@param {string} label 账户的名称
//@param {object} algorithmObj 可选参数，加密算法对象
account.create(privateKey, password, label, algorithmObj)
````

### 3.2 导入账户

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

####Token类型：
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


