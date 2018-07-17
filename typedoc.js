module.exports = {
    module:'commonjs',
    target: 'es5',
    out: './apidoc',
    readme: './README.md',
    includes: './src',
    // exclude: [
    //     '*/node_modules/**/*.*',
    //     '*/src/sdk/*.ts',
    //     '*/src/transaction/txSender.ts',
    //     '*/src/transaction/vmcode.ts',
    //     '*/src/common/uint256.ts',
    //     '*/src/common/uint160.ts',
    //     '*/src/transaction/program.ts',
    //     '*/src/transaction/txAttribute.ts'
    // ],
    exclude: '**/*+(txSender|vmcode|program|uint256|uint160|txAttribute|websocketBuilder|governanceContractTxBuilder|token|nep5TxBuilder).ts',
    // mode: 'file',
    ignoreCompilerErrors: true
}