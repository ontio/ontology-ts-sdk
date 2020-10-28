
<h1 align="center">Ontology TypeScript SDK </h1>
<h4 align="center">Version V1.1.15 </h4>

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Installation](#installation)
  - [Download Through npm/Yarn](#download-through-npmyarn)
  - [Build from Source Code](#build-from-source-code)
    - [Downloading](#downloading)
    - [Compiling](#compiling)
    - [Testing](#testing)
  - [Use in Project](#use-in-project)
    - [Import](#import)
    - [Require](#require)
    - [In the Browser](#in-the-browser)
- [Contributing](#contributing)
- [License](#license)

## Overview

This is the official Ontology TypeScript SDK - a comprehensive library for developing with the [Ontology blockchain](https://ont.io) in both TypeScript and JavaScript. It currently supports management of wallets, digital identities and digital assets - as well as the deployment and invocation of smart contracts.

## Getting Started

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

#### Downloading

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

#### Compiling

Compile the project with the:

````
npm run build:dev // or npm run build:prod
````

or

```
yarn run build:dev // or yarn run build:prod
```

This will create a compiled version of the SDK in the `lib` directory.

#### Testing

The tests can be found in the `test` directory. They are distinguished into three categories stored in separate subfolders:
* `unit`: unit tests that can be run without external or network dependencies
* `integration`: integration tests that require access to one or more Blockchain nodes and test the actual interaction with the Blockchain
* `example`: pure sample code without test assertations that can be used for explorative testing or documentation purposes

To run the tests, use one of:

```
# unit tests
npm run test:unit
# integration tests
npm run test:integration
# examples
npm run test:example
# all
npm run test
```

or

```
yarn run test:unit
# integration tests
yarn run test:integration
# examples
yarn run test:example
# all
yarn run test
```

The integration tests use several accounts on the testnet that require funding of ONG tokens in order to pay for the transactions. If there are any test failures with error messages like "insufficient funds" or similar, make sure the following accounts are properly funded:

* APT4wZG9sFQfjhyfGALPXQj5UyrQ3ZCVkY
* ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6
* AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX
* AVXf5w8WD2y6jV1Lzi36oSKYNif1C7Surc
* AdLUBSSHUuFaak9j169hiamXUmPuCTnaRz
* AJkkLbouowk6teTaxz1F2DYKfJh24PVk3r
* ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc
* AU9TioM24rXk5E3tUGrv8jwgBA1aZVVKDW
* AHTdWzj4jYBzbU48YBCfovvouTMc45M6iP
* AJym8dF7wZLjtoiY8C3mmYt8f2tZDxq5iz

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

#### In the Browser

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

## Contributing

Contributors are welcome to the `ontology-ts-sdk`. Before beginning, please take a look at our [contributing guidelines](CONTRIBUTING.md). You can open an issue by [clicking here](https://github.com/ontio/ontology-ts-sdk/issues/new).

If you have any issues getting setup, open an issue or reach out in the [Ontology Discord](https://discordapp.com/invite/4TQujHj).

## License

The Ontology TypeScript SDK is availabl under the [LGPL-3.0 License](LICENSE).
