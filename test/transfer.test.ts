import { Account } from "../src/account";
import * as core from '../src/core'
import { makeTransferTransaction, buildRpcParam } from "../src/transaction/makeTransactions";
import TxSender from "../src/transaction/TxSender";
import axios from 'axios'

var accountTo = new Account()
var privateKeyTo = core.generatePrivateKeyStr()
accountTo.create(privateKeyTo, '123456', 'AccountTo')

console.log('account to: '+ accountTo.address)

var accountFrom = {
    address : '',
    privateKey : ''
}

var tx = makeTransferTransaction(accountFrom.address, accountTo.address, '100000', accountFrom.privateKey)
var param = buildRpcParam(tx)
console.log('param : '+ param)
var url = 'getfromshuaishuai'

axios.post(url, param).then(res => {
    console.log('transfer response: '+ res.data)
}).catch(err => {
    console.log(err)
})
