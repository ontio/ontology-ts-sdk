### 可信声明 Claim

#### Claim 具有以下数据结构

```
{
  unsignedData : string,
  SignedData : string,
  Context : string,
  Id : string,
  claim : {},
  Metadata : Metadata,
  Signature : Signature
}
```

```unsignedData``` 是未被签名的声明对象的json格式字符串，声明对象包含Context, Id, Claim, Metadata这些字段。

```SignedData ``` 是声明对象被签名后的json格式字符串，该json包含声明对象和签名对象。

```Context``` 是声明模板的标识。目前有以下可选的值：

**claim:eid_authentication** 代表中国公民认证。

**claim:twitter_authentication** 代表twitter的认证。

**claim:facebook_authentication** 代表facebook的认证。

**claim:github_authentication** 代表github的认证。

**claim:linkedin_authentication** 代表linkedin的认证。

```Id``` 是声明对象的标识。

```Claim ``` 是声明的内容，格式为JSON对象。

```Metadata``` 是声明对象的元数据。

#### Metadata 具有以下数据结构

```
{
  CreateTime : datetime string
  Issuer : string,
  Subject : string,
  Expires : datetime string
  Revocation : string,
  Crl : string
}
```

```Createtime``` 是声明的创建时间。该值是ISO格式字符串，精确到秒，如‘‘2018-01-01T14:00:01Z’’。

```Issuer``` 是声明的发布者。对于自认证声明，该值是用户的ONT ID。

``Subject`` 是声明的主语。对于自认证声明，该值是用户的ONT ID。

```Expires``` 是声明的过期时间。该值可以为空，标识没有过期时间。

```Revocation``` 是声明撤销方法。对于自认证声明，不需要该值。

```Crl``` 是声明撤销列表的链接。对于自认证声明，不需要该值。

#### Signature 具有以下数据结构

```
{
	Format : string,
    Algorithm : string,
    Value : string
}
```

```Format``` 是签名的格式。

```Algorithm``` 是签名的算法。

```Value``` 是计算后的签名值。

### 4.1 构造自认证声明并签名该声明

该方法所需参数说明如下：

**context** 声明模板的标识。该值为字符串。

**claimData** 要声明的内容，JSON字符串格式。

**ontid** 用户的ONT ID。

**encryptedPrivateKey** 用户加密后的私钥。

**password** 用户的密码。

**callback** 回调函数名。该值为可选参数。

当传入参数正确，返回声明对象，该对象中的signedData是签名后的数据。

如果传入的callback，会通过回调返回声明对象的JSON格式字符串。

````
var claim = Ont.SDK.signSelfClaim(context, claimData, ontid, encryptedPrivateKey, password, callback)
````

### 4.2 工具方法 -- 生成签名

用于对输入内容生成签名的方法，该方法会返回符合格式要求的签名内容。

签名格式同上面的**Signature**。

````
{
	Format : 'pgp', //该值为固定的值
    Algorithm : ECDSAwithSHA256, //该值为固定的值
    Value : string //该值为签名后的值
}
````

该方法所需参数说明如下：

**content** 需要签名的内容， 字符串格式。

**encryptedPrivateKey** 加密后的私钥。

**password** 用户的密码。

**callback** 回调函数名，可选参数。

```
let signature = Ont.SDK.signData(content, encryptedPrivateKey, password, callback)
console.log(signature.Value)
```

### 4.3 工具方法 — 解密私钥

系统中为了安全，避免直接操作明文私钥。在需要使用明文私钥时，SDK提供了根据密码解密出明文私钥的方法。

如果能够解出私钥，该方法通过回调返回私钥；如果不能解出，会返回相应错误码。

```
var encryptedPrivateKey = Ont.SDK.decryptEncryptedPrivateKey( encryptedPrivateKey, password, callback)
```

### 4.4 发送认证声明到链上并验证是否发送成功

用户可以通过websocket发送声明到链上，并且通过持续监听websocket服务器返回的消息，判断发送是否成功。

用户需要传以下参数：

**path** 是发送的属性在DDO中存储的完整路径。规定该值为认证声明签名后的值。

**value** 发送的属性值。规定该值为如下结构：

````
{
    Context : string, //声明模板的标识
    Ontid   : string  //声明签发者的ONT ID
}
````

**ontid** 用户身份的ONT ID

**privateKey** 用户的私钥

用户可以监听到websocket后台推送的消息，如果是Event的推送，可以得到如下结果：

```
{
	"Action": "Notify",
	"Desc": "SUCCESS",
	"Error": 0,
	"Result": {
		"Container": "ea02f7d3c828c79c65c198e016554d6c8ea7a7502dc164d649afe2c0059aa2b1",
		"CodeHash": "8665eebe481029ea4e1fcf32aad2edbbf1728beb",
		"State": [{
			"Value": [{
				"Value": "417474726962757465"
			}, {
				"Value": "757064617465"
			}, {
				"Value": "6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b"
			}, {
				"Value": "436c616d3a74776974746572"
			}]
		}],
		"BlockHeight": 37566
	},
	"Version": "1.0.0"
}
```



示例：

```
//1. call sdk to make the parameter that will be sent to websocket server
var param = Ont.SDK.buildClaimTx( path, value, ontid, privateKey)

//2.send websocket request and listen messages
//websocket服务器地址
const socket_url = 'ws://52.80.115.91:20335'
const socket = new WebSocket(socket_url)
    socket.onopen = () => {
        console.log('connected')
        //发送请求
        socket.send(param)
    }
    //监听消息
    socket.onmessage = (event) => {
		//验证结果
		let res 
        if(typeof event.data === 'string') {
            res = JSON.parse(event.data)
            //可以在成功发送交易后关闭socket
            socket.close()
        }
        //解析后台推送的Event通知
        //通过简单的判断区块高度，得知上链成功，
        if(res.Result.BlockHeight) {
            //通知客户端
        }
        
    }
    socket.onerror = (event) => {
        //no server or server is stopped
        console.log(event)
        socket.close()
    }
```

**注意：** 发送认证上链并监听返回的过程比较耗时，如果一直等待确认上链成功，会十分影响用户体验，可以在成功发送交易后关闭websocket连接，并在等待**约5秒**后显示上链成功。