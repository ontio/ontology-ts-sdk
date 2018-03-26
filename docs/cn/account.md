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