The following tests must be revised and were disabled in order to make the full integration test suite running:

* transfer.test.ts -> 3 tests failing, test accounts missing enough balance for the transfers
* scParams.test.ts -> 2 tests failing, smart contract state errors, does not exit
* transfer.sign.test.ts -> 1 test failing signature failure, according to comments seems to be a bug in the SDK with ed25519
* neo.test.ts -> 2 tests failing, NEO node URLs do not work
* oep4.test.ts -> 7 tests failing, is expecting certain states that are changed by the test, must be rewritten
* oep5.test.ts -> 2 tests failing, need to be rewritten
* oep8.test.ts -> 1 test failing, smart contract state error