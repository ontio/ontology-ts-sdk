## 数字身份账户 Identity

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