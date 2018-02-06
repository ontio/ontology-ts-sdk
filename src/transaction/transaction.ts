
import * as core from './core'

class Transaction {
    constructor (tx={}) {
        //type
        this.type = tx.type || 128

        //version
        this.version = tx.version || 0

        //payload
        this.payload = tx.payload
        
        this.txAttributes = tx.txAttributes || []

        this.UTXOInputs = tx.UTXOInputs || []

        this.balanceInputs = tx.balanceInputs || []

        this.outputs = tx.outputs || []

        this.programs = tx.programs || []

        //Inputs/Outputs map base on Asset (needn't serialize)
        this.assetOutputs = tx.assetOutputs
        this.assetInputAmount = tx.assetInputAmount
        this.assetOutputAmount = tx.assetOutputAmount
        this.hash = tx.hash

    }

    serialize () : string {
        return core.serializeTransaction(this)
    }

    static deserialize (hextring : string) : Transaction {
        return core.deserializeTransaction(hextring)
    }

    makeInvokeCodeTransaction() {

    }

}

export default Transaction