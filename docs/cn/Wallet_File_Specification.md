# Wallet File Specification

## Wallet
A wallet file in JSON format has the following basic structure:

```
{
  "name": "MyWallet",
  "version": "1.0",
  "scrypt": {},
  "identities": [],
  "accounts": [],
  "extra": null
}
```
```name``` is a label that the user has made to the wallet file.

```version``` is currently fixed at 1.0 and will be used for functional upgrades in the future.

```scrypt``` is a ScryptParameters object which describe the parameters of SCrypt algorithm used for encrypting and decrypting the private keys in the wallet.

```identities``` is an array of Identity objects which describe the details of each Identity in the wallet.

```accounts``` is an array of Account objects which describe the details of each account in the wallet.

```extra``` is an object that is defined by the implementor of the client for storing extra data. This field can be null.

## ScryptParameters
ScryptParameters object has the following structure:

```
{
  "n": 16384,
  "r": 8,
  "p": 8
}
```
```n``` is a parameter that defines the CPU/memory cost. Must be a value 2^N.

```r``` is a tuning parameter.

```p``` is a tuning parameter (parallelization parameter). A large value of p can increase computational cost of SCrypt without increasing the memory usage.

## Identity
Identity object has the following structure:
```
{
  "ontid": "did:ont:TQLASLtT6pWbThcSCYU1biVqhMnzhTgLFq",
  "label": "MyIdentity",
  "isDefault": true,
  "lock": false,
  "controls": [],
  "extra": null
}
```
```ontid``` is the ontid of the identity.

```label``` is a label that the user has made to the identity.

```isDefault``` indicates whether the identity is the default change identity.

```lock``` indicates whether the identity is locked by user. The client shouldn't update the infomation in a locked identity.

```controls``` is an array of Controller objects which describe the details of each controller in the identity.

```extra``` is an object that is defined by the implementor of the client for storing extra data. This field can be null.

## Control
Control object has the following structure:
```
{
  "algorithm": "ECDSA",
  "parameters": {},
  "id": "1",
  "key": "6PYWB8m1bCnu5bQkRUKAwbZp2BHNvQ3BQRLbpLdTuizpyLkQPSZbtZfoxx",
}
```
```algorithm``` is the algorithms used in encryption system.

```parameters``` is the array of parameter objects used in encryption system.

```id``` is the identify of this control.

```key``` is the private key of the account in the NEP-2 format. This field can be null (for watch-only address or non-standard address).

## Parameter
Parameter object has the following structure:
```
{
  "curve":"secp256r1"
}
```
```curve``` is the name of the elliptic curve.

## Account
Account object has the following structure:
```
{
  "address": "AQLASLtT6pWbThcSCYU1biVqhMnzhTgLFq",
  "label": "MyAddress",
  "isDefault": true,
  "lock": false,
  "algorithm": "ECDSA",
  "parameters": {},
  "key": "6PYWB8m1bCnu5bQkRUKAwbZp2BHNvQ3BQRLbpLdTuizpyLkQPSZbtZfoxx",
  "contract": {},
  "extra": null
}
```
```address``` is the base58 encoded address of the account.

```label``` is a label that the user has made to the account.

```isDefault``` indicates whether the account is the default change account.

```lock``` indicates whether the account is locked by user. The client shouldn't spend the funds in a locked account.

```algorithm``` is the algorithms used in encryption system.

```parameters``` is the array of parameter objects used in encryption system.

```key``` is the private key of the account in the NEP-2 format. This field can be null (for watch-only address or non-standard address).

```contract``` is a Contract object which describes the details of the contract. This field can be null (for watch-only address).

```extra``` is an object that is defined by the implementor of the client for storing extra data. This field can be null.

## Contract
Contract object has the following structure:
```
{
  "script": "21036dc4bf8f0405dcf5d12a38487b359cb4bd693357a387d74fc438ffc7757948b0ac",
  "parameters": [],
  "deployed": false
}
```

```script``` is the script code of the contract. This field can be null if the contract has been deployed to the blockchain.

```parameters``` is an array of Parameter objects which describe the details of each parameter in the contract function.

```deployed``` indicates whether the contract has been deployed to the blockchain.