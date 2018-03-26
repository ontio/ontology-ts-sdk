
<h1 align="center">TypeScript SDK For Ontology  </h1>
<h4 align="center">Version V0.6.0 </h4>

## Overview

The project is an ontology official TypeScript SDK, which is a comprehensive SDK. Currently, it supports local wallet management, digital identity management, digital asset management,  deployment and envoke for Smart Contract . The future will also support more rich functions and applications .

## Getting started

* 进入 [中文版](http://opendoc.ont.io/tssdk/cn) .
* Enter [English Version](http://opendoc.ont.io/tssdk/en) .

## Installation

download from github
```
git clone 'https://github.com/ontio/ontology-ts-sdk.git'
```

````
npm install 'ontology-ts-sdk'
````

Compile

从github下载的源码，进入项目根目录，运行:

````
npm run build
````

你会得到编译后的代码在lib文件夹下。

测试

项目的测试代码在根目录```/test``` 文件夹下。运行：

```
npm run test
```

你会看到jest测试结果。

引用

Import

模块通过Ont导出。

```
import {Wallet} from 'Ont'
```

Require

Sdk 使用ES6的模块解决方案，```require``` 需要明确声明你所需的模块。

````
var Ont = require 'Ont'
var wallet = Ont.Wallet()
````

Web

将编译后得到的lib文件夹下```browser.js```文件引入到页面中：

````
<script src="./lib/browser.js"></script>
````

在代码中使用需要在Ont的全局命名空间下。

```
var wallet = Ont.Wallet()
```

# Contributing

Can I contribute patches to Ontology project?

Yes! Please open a pull request with signed-off commits. We appreciate your help!

You can also send your patches as emails to the developer mailing list.
Please join the Ontology mailing list or forum and talk to us about it.

Either way, if you don't sign off your patches, we will not accept them.
This means adding a line that says "Signed-off-by: Name <email>" at the
end of each commit, indicating that you wrote the code and have the right
to pass it on as an open source patch.

Also, please write good git commit messages.  A good commit message
looks like this:

  Header line: explain the commit in one line (use the imperative)

  Body of commit message is a few lines of text, explaining things
  in more detail, possibly giving some background about the issue
  being fixed, etc etc.

  The body of the commit message can be several paragraphs, and
  please do proper word-wrap and keep columns shorter than about
  74 characters or so. That way "git log" will show things
  nicely even when it's indented.

  Make sure you explain your solution and why you're doing what you're
  doing, as opposed to describing what you're doing. Reviewers and your
  future self can read the patch, but might not understand why a
  particular solution was implemented.

  Reported-by: whoever-reported-it
  Signed-off-by: Your Name <youremail@yourhost.com>

## Community

## Site

* https://ont.io/

## License

The Ontology library (i.e. all code outside of the cmd directory) is licensed under the GNU Lesser General Public License v3.0, also included in our repository in the License file.
