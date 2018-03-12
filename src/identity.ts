import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'
import {DEFAULT_ALGORITHM, Algorithm} from './consts'
import {ERROR_CODE} from './error'
import {checkOntid} from './transaction/makeTransactions'

export class ControlData {
    algorithm: string;
    parameters: {
        // curve: string;
    };
    id: string;
    key: string;
}

export class Identity {

    ontid: string;
    label: string;
    isDefault: boolean;
    lock: boolean;
    controls: Array<ControlData> = [];
    extra: null;

    constructor() {
    }

    create( privateKey: string, keyphrase: string, label: string, algorithmObj ?: Algorithm ) {
        
        this.ontid = "";
        this.label = label;
        this.isDefault = false;
        this.lock = false;

        // control
        let control = (<ControlData> {})

        //algorithm
        if (algorithmObj) {
            control.algorithm = algorithmObj.algorithm
            control.parameters = algorithmObj.parameters
        } else {
            control.algorithm = DEFAULT_ALGORITHM.algorithm
            control.parameters = DEFAULT_ALGORITHM.parameters
        }

        //start from 1
        control.id = "1";
        control.key = scrypt.encrypt( privateKey, keyphrase );

        this.controls.push( control );

        // ontid
        this.ontid = core.generateOntid(privateKey)

        //TODO register ontid
        //调用方处理register和监听结果
        return this
    }

    createRandomLabel() {
        let d = new Date()
        let m = d.getMonth()
        let date = d.getDate()
        return 'Identity' + (m > 9? m : '0'+m )+ date
    }

    static importIdentity(label : string ,encryptedPrivateKey : string, password : string) {
        //create identity
        let identity = new Identity()
        let privateKey = scrypt.decrypt(encryptedPrivateKey, password);
        if(!label) {
            let d = new Date()
            let m = d.getMonth() + 1
            let date = d.getDate()
            label = 'Identity' + (m > 9 ? m : '0' + m) + date
        }

       // identity.create(privateKey, password, label) // will take more time
        identity.ontid = core.generateOntid(privateKey)
        identity.label = label;
        identity.isDefault = false;
        identity.lock = false;

        // control
        let control = (<ControlData>{})

        //algorithm

        control.algorithm = DEFAULT_ALGORITHM.algorithm
        control.parameters = DEFAULT_ALGORITHM.parameters

        //start from 1
        control.id = "1";
        control.key = encryptedPrivateKey;

        identity.controls.push(control);

        //check ontid on chain
        /* return checkOntid(identity.ontid).then((res:any)=>{
            let result
            if(res == ERROR_CODE.SUCCESS) {
                result = identity
            } else {
                result = null
            } 
            return {
                error : res,
                result : result,
                desc : ''
            }
        }, (error:any) => {
            return {
                error : ERROR_CODE.NETWORK_ERROR,
                result : null,
                desc : error
            }
        }) */

        return identity
    }

    addControl(control : ControlData) {
        for(let c of this.controls) {
            if(c.key == control.key) {
                return;
            }
        }
        control.id = (this.controls.length + 1).toString()
        this.controls.push(control)
    }


    toJson(): string {
        let obj = {
            ontid: this.ontid,
            label: this.label,
            isDefault: this.isDefault,
            lock: this.lock,
            controls: this.controls,
            extra: this.extra,
        }
        return JSON.stringify(obj)
    }

    static parseJson(json: string): Identity {
        let obj = JSON.parse(json)
        let id = new Identity()
        id.ontid = obj.ontid
        id.label = obj.label
        id.isDefault = obj.isDefault
        id.lock = obj.lock
        id.controls = obj.controls
        id.extra = obj.extra
        return id;
    }

}

