# Ont SDK 说明文档

## 1 钱包 Wallet

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

希望了解更多钱包数据规范请参考[Wallet_File_Specification](https://github.com/ontio/opendoc/blob/master/resources/specifications/Wallet_File_Specification.md).

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

## 2 身份 Identity

#### Identity 具有以下数据结构

````
{
  ontid : string,
  label : string,
  isDefault : boolean,
  lock : boolean,
  controls : array of ControlData,
  extra : null
}
````

```ontid``` 是代表身份的唯一的id

`label` 是用户给身份所取的名称。

`isDefault` 表明身份是用户默认的身份。默认值为false。

`lock` 表明身份是否被用户锁定了。客户端不能更新被锁定的身份信息。默认值为false。

`controls` 是身份的所有控制对象**ControlData**的数组。

`extra` 是客户端开发者存储额外信息的字段。可以为null。

#### ControlData 具有以下数据结构

````
{
  algorithm: string;
  parameters: {
  	curve: string;
  };
  id: string;
  key: string;
}
````

`algorithm` 是用来加密的算法名称。

`parameters` 是加密算法所需参数。

```curve``` 是椭圆曲线的名称。

`id` 是control的唯一标识。

`key` 是NEP-2格式的私钥。该字段可以为null（对于只读地址或非标准地址时）。

### 2.1 创建身份

在创建身份过程中会将生成的Ont Id注册到区块链上。注册失败时会抛出相应错误。

````
import {Identity} from 'Ont'
var identity = new Identity()
//@param {string} privateKey 用户私钥
//@param {string} password 密码
//@param {string} label 身份的名称
//@param {object} algorithmObj 可选参数，加密算法对象
try {
  identity.create(privateKey, password, label, algorithmObj)
} catch (error) {
  //注册ontid失败
  console.log(error)
}
````

### 2.2 导入身份

根据用户提供的**身份的 json格式字符串，加密私钥，密码，Ont Id** 来导入身份。导入过程中需要先检查密码和加密后的私钥，后检查Ont Id是否存在于本体Ontology。

````
import {Identity} from 'Ont'
var identity = new Identity()
//@param {string} identityDataStr 身份的json格式字符串
//@param {string} encryptedPrivateKey 用户加密后的私钥
//@param {string} password 密码
//@param {string} ontid 身份的ontid
try {
  identity.importIdentity(identityDataStr,encryptedPrivateKey, password, ontid)
} catch (error) {
  console.log(error)
}
````

## 3 账户 Account

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

### 4 声明 Claim

#### Claim 具有以下数据结构

````
{
  unsignedData : string,
  signedData : string,
  context : string,
  id : string,
  claim : {},
  metadata : Metadata,
  signature : Signature
}
````

```unsignedData``` 是未被签名的声明对象的json格式字符串，声明对象包含Context, Id, Claim, Metadata这些字段。

```signedData ``` 是声明对象被签名后的json格式字符串，该json包含声明对象和签名对象。

```Context``` 是声明模板的标识。

```Id``` 是声明对象的标识。

```Claim``` 是声明的内容。

```Metadata``` 是声明对象的元数据。

#### Metadata 具有以下数据结构

````
{
  createTime : datetime string
  issuer : string,
  subject : string,
  expires : datetime string
  revocation : string,
  crl : string
}
````

```createtime``` 是声明的创建时间。

```issuer``` 是声明的发布者。

```subject``` 是声明的主语。

```expires``` 是声明的过期时间。

```revocation``` 是声明撤销方法。

```crl``` 是声明撤销列表的链接。

#### Signature 具有以下数据结构

````
{
	format : string,
    algorithm : string,
    value : string
}
````

```format``` 是签名的格式。

```algorithm``` 是签名的算法。

```value``` 是计算后的签名值。

### 4.1 构造声明对象的签名

根据用户输入内容构造声明对象，该声明对象里包含了签名后的数据。

````
import {Claim} from 'Ont'
//@param {string} context 声明模板的标识
//@param {object} claim 用户声明的内容
//@param {object} metadata 声明的元数据
//@param {string} privateKey 用户的私钥
var claim = new Claim(context, claim, metadata, privateKey)
//声明签名后的数据
console.log(claim.signedData)
````

## 5 交易 Transaction

#### Transaction 数据规范

````
{
    hash : string
    type : number
    version : number
    payload : InvokeCode
    txAttributes : array of TransactionAttribute
    UTXOInput : number
    TXOutput : number
    gas : string
    programs : array of Program
}
````

```hash``` 交易的hash值。

```type``` 交易的类型。默认值为0x80。

```version``` 交易的版本。默认值为0x00。

```payload``` 决定交易类别的装载数据。当前为InvokeCode。

```txAttribute``` 交易的属性集合。

```UTXOInput``` 交易的输入。默认值为0x00。

```TXOutput``` 交易的输出。默认值为0x00。

```gas``` 交易费。默认值为‘0000000000000000’。

```programs``` 交易的脚本内容。

#### InvokeCode 数据规范

````
{
    scriptHash : string
    parameters : array of Parameter
    functionName : string
}
````

````scriptHash```` 智能合约中指定的脚本hash值。

```functionName``` 构建交易时从智能合约中指定的函数名称

```parameters``` 函数所需参数对象数组。

#### TransactionAttribute 数据规范

````
{
    usage : number
    data : string
}
````

```usage``` 表明交易属性的用途，默认值为0x20。

```data``` 交易属性值。该值是对用户的公钥做签名和哈希运算得到的。

#### Program数据规范

````
{
    code : string
    parameter : string
}
````

```code``` 该值是对交易对象中除了**programs**以外的内容进行签名后得到的。签名过程需要用户的私钥。

```parameter``` 该值是用户的编码后的公钥。

### 5.1 序列化交易对象

在发送交易前需要对交易对象进行序列化操作，得到一条16进制字符串。

````
//已有transaction对象
var serialized = transaction.serialize()
````

### 5.2 反序列化交易对象

可以通过对序列化后的字符串进行反序列化操作，得到序列化前的交易对象。

````
import {Transaction} from 'Ont'
//@param {string} hexstring 序列化后的字符串
var transaction = Transaction.deserialize( hexstring )
````

## 6 AbiInfo

#### AbiInfo数据结构

````
{
    hash : string
    entrypoint : string
    functions : array of AbiFunction
}
````

```hash``` 该值是智能合约中指定的hash值。

```entrypoint``` 该值是智能合约中指定的值。

```functions``` 该值是需要执行的函数的数组。

#### AbiFunction数据结构

````
{
    name : string
    returntype : string
    parameters : array of Parameter
}
````

```name``` 是该函数的名称。

```returntype``` 是函数的返回值。

```parameters``` 是函数的参数数组。

#### Parameter数据结构

```
{
    name : string
    type : string
    value : string
}
```

```name``` 是参数的名称。

```type``` 是参数的类型。

```value``` 是参数的值。

### 6.1 构建InvokeCode类型的交易并序列化

````
import {makeInvokeTransaction} from 'Ont'

//1.我们通过解析智能合约文件得到AbiInfo对象
let abiInfo = AbiInfo.parseJson(JSON.stringify(json2))

//2.从AbiInfo对象中获取要执行的函数。如 "RegIdByPublicKey"
let f = abiInfo.getFunction('RegIdByPublicKey')

//3. 创建参数对象并设置到函数对象中
let p1 = new Parameter('id', 'ByteArray', ontid)
let p2 = new Parameter('pk', 'ByteArray', publicKey)
f.setParamsValue(p1, p2)

//4. 创建transaction对象
let tx = makeInvokeTransaction(abiInfo.hash, f)

//5. 先序列化transaction中未签名的部分
let unsignedData = tx.serializeUnsignedData()

//6. 根据上面序列化的结果做签名，来构造program 对象，并添加到transaction对象中。
let program = new Program()
let signed = core.signatureData(unsignedData, privateKey)
program.code = signed
program.parameter = publicKey
tx.programs = [program]

//7. 序列化签名后的内容。最终交易对象序列化的结果就是两次序列化的结果拼接而成。
let signedData = tx.serializeSignedData()
let serialized = unsignedData + signedData

````

你也可以在构建完整的交易对象后，直接调用**transaction**的**serialize**方法得到最终序列化结果。

````
let serialized = tx.serialize()
````

实际上，**serialize** 方法内部实现也是拼接两次序列化的结果。















