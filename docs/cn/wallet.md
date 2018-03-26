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

### 1.1 创建钱包

用户可以从零开始创建自己的钱包。

#### 1）创建一个空的钱包

用户只需要传入钱包名称。

````
import {Wallet} from 'Ont'
var wallet = new Wallet()
wallet.create( name )
````

#### 2) 创建用户的身份并添加到钱包中。

用户需要提供自己的**私钥，身份的名称，密码**来创建身份。你还可以指定创建身份所需的算法对象，该对象应该符合如下结构:

````
{
  algorithm : string,
  parameters : {}
}
````

创建过程默认会提供一个算法对象，如下：

````
{
  algorithm : "ECDSA",
  parameters : {
    "curve": "secp256r1"
}
````

创建身份需要用户提供私钥，用户可以通过以下方法生成自己的私钥。

```
import {core} from 'Ont'
var privateKey = core.generatePrivateKeyStr()
console.log(privateKey)
```

在创建身份的过程中，会生成身份的ONT ID，同时sdk会将该Ont ID发到区块链上注册。

如果注册失败会抛出错误给用户捕获。用户可以重新尝试。

如果注册成功，再将创建好的身份添加到钱包中。可以将身份的Ont ID赋值给钱包。

````
import {Identity} from 'Ont'
var identity = new Identity()
try {
    identity.create( privateKey, password, name, algorithmObj )
} catch(error) {
    //注册Ont ID失败
}
wallet.ontid = identity.ontid
wallet.addIdentity(identity)
````

#### 3) 创建账户并添加到钱包中

用户需要提供**私钥，密码，账户名称**来创建新的账户。也可以指定创建账户所需的算法对象。创建过程也可以提供默认的算法对象。 同上。

创建好账户后添加到钱包中。

````
import {Account} from 'Ont'
var account = new Account()
account.create( privateKey, password, name )
wallet.addAccount(account)
````

### 1.2 导入新的数字身份到钱包

#### 1）无钱包时导入

这种情况通常发生在用户已经拥有了一个数字身份，但此时客户端应用还没有创建用户钱包文件。此时需要先给用户创建一个空的钱包文件，然后根据用户的信息导出身份，并加入到钱包中。

导入数字身份需要用户提供以下参数：

**identityDataStr** 用户身份json格式字符串

**encryptedPrivateKey** 加密后的私钥 

**password** 用户用来加密的密码

**ontid** 用户身份唯一的Ont ID

在导入过程中，先要检查密码和加密后的私钥是否正确，然后检查用户提供的Ont ID是否存在于本体Ontology，如果任意一种检查不通过，都会抛出相应错误让用户捕获。

钱包添加身份时会根据身份的Ont ID进行去重判断。 重复的身份不会在钱包中添加多次。

````
import {Wallet} from 'Ont'
import {Identity} from 'Ont'
//1.创建新的钱包
var wallet = new Wallet()
wallet.create( name )
//2.导出身份
var identity 
try {
    identity = Identity.importIdentity( identityDataStr, encryptedPrivateKey, password, ontid)
} catch (error) {
    //根据错误信息判断
}
//3.添加身份到钱包
wallet.addIdentity(identity)
````

#### 2) 有钱包时导入

过程同上，区别在于用户本地已有钱包。

同样的，导出身份前先检查用户提供的Ont ID是否存在于链上。

````
import {Identity} from 'Ont'
//1.导出身份
var identity 
try {
    identity = Identity.importIdentity( identityDataStr, encryptedPrivateKey, password, ontid)
} catch (error) {
    //根据错误信息判断
}
//2.添加身份到已有钱包
wallet.addIdentity(identity)
````

### 1.3 设置默认身份

钱包有且仅有一个默认的身份。 用户可以切换默认的身份。

````
//@param {number} index 要设为默认的身份在钱包的身份数组中索引
wallet.setDefaultIdentity( index )
````