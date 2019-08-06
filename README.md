
<h1 align="center">Ontology TypeScript SDK</h1>
<h4 align="center">Version V1.0.18 </h4>

## Overview

This project is a comprehensive TypeScript library for the [Ontology blockchain](https://ont.io). It currently supports management of  wallets, digital identities and digital assets - as well as the deployment and invocation of smart contracts.

## Getting started

* 进入 [中文版](https://ontio.github.io/documentation/ontology_ts_sdk_zh.html).
* Enter [English Version](https://ontio.github.io/documentation/ontology_ts_sdk_en.html).

## Installation

### Download Through npm/Yarn

````
npm install 'ontology-ts-sdk' --save
````

or

```
yarn add 'ontology-ts-sdk'
```

### Build from Source Code

#### Download

```
git clone 'https://github.com/ontio/ontology-ts-sdk.git'
```

Then install the dependencies with:

```
npm install
```

or

```
yarn
```

#### Compile

Compile the project with the:

````
npm run build:dev // or npm run build:prod
````

or

```
yarn run build:dev // or yarn run build:prod
```

This will create a compiled version of the SDK in the `lib` directory.

#### Test

To run the tests in the `test` directory, use:

```
npm run test
```

or

```
yarn run test
```

### Use in Project

#### Import

Using `import` to include the modules from `'ontology-ts-sdk'`:

```
import {Wallet} from 'ontology-ts-sdk';
var wallet = Wallet.create('test');
```

#### Require

Using `require` to include the modules from `'ontology-ts-sdk'`:

````
var Ont = require('ontology-ts-sdk');
var wallet = Ont.Wallet.create('test');
````

#### Browser

To use in the browser you must use the compiled version (as listed above).
The `browser.js` file is located in the `lib` directory.
Include it into the project with a `<script>` tag:

````
<script src="./lib/browser.js"></script>
````

Everything will be available under the `Ont` variable, just like in the `require` example above.

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
