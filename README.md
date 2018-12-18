
<h1 align="center">TypeScript SDK For Ontology blockchain </h1>
<h4 align="center">Version V1.0.10 </h4>

## Overview

The project is a comprehensive TypeScript library for the Ontology blockchain. Currently, it supports local wallet management, digital identity management, digital asset management,  deployment, and envoke for Smart Contract. In the future there will also be support for more functions and applications.

## Getting started

* 进入 [中文版](https://ontio.github.io/documentation/ontology_ts_sdk_zh.html).
* Enter [English Version](https://ontio.github.io/documentation/ontology_ts_sdk_en.html).

## Installation

#### Download

```
git clone 'https://github.com/ontio/ontology-ts-sdk.git'
```

Then please install the packges.

```
npm install (or yarn)
```

#### Use in your project

````
npm install 'ontology-ts-sdk' --save
````

#### Compile

Get into the 'ontology-ts-sdk' directory and run:

````
npm run build:dev // or npm run build:prod
````

You will get the packaged code under '/lib'

#### Test

Test code of the project is in directory '/test'. Run:

```
npm run test
```

#### Import

Modules library export by 'ontology-ts-sdk'

```
import {Wallet} from 'ontology-ts-sdk';
var wallet = Wallet.create('test');
```

#### Require

````
var Ont = require('ontology-ts-sdk');
var wallet = Ont.Wallet.create('test');
````

#### Web require

The browser.js file under the '/lib' folder need referenced to the page:

````
<script src="./lib/browser.js"></script>
````

The use of the code is required under the global namespace of Ont.

```
var wallet = Ont.Wallet.create('test');
```

# Contributing
Please open a pull request with signed-off commits. We appreciate your help! You can also send your codes as emails to the developer mailing list. You're welcomed to join the Ontology mailing list or developer forum.

Please provide detailed submission information when you want to contribute code for this project. The format is as follows:

Header line: explain the commit in one line (use the imperative).

Body of commit message is a few lines of text, explaining things  in more detail, possibly giving some background about the issue  being fixed, etc.

The body of the commit message can be several paragraphs, and  please do proper word-wrap and keep columns shorter than about 74 characters or so. That way "git log" will show things  nicely even when it's indented.

Make sure you explain your solution and why you're doing what you're  doing, as opposed to describing what you're doing. Reviewers and your future self can read the patch, but might not understand why a particular solution was implemented.

Reported-by: whoever-reported-it
Signed-off-by: Your Name [youremail@yourhost.com](mailto:youremail@yourhost.com)

## Community

## Site

* https://ont.io/

## License

The Ontology library (i.e. all code outside of the cmd directory) is licensed under the GNU Lesser General Public License v3.0, also included in our repository in the License file
