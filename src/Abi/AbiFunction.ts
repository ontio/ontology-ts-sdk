import Parameter from './parameter'

export default class AbiFunction {
    name : string
    returntype : string
    parameters : Array<Parameter> 

    constructor(name : string, returntype : string, parameters: [any]) {
        this.name = name
        this.returntype = returntype
        let paramsTemp = parameters.map((item) => new Parameter(item.name, item.type, item.value))
        this.parameters = paramsTemp.reverse()
    }

    getParameter(name : string) : any {
        let p  = <Parameter> {}
        for( let v of this.parameters) {
            if(v.getName() === name) {
                return v
            }
        }
        return null
    }

    setParamsValue(...args) : void {
        for(let i=0, len=args.length; i<len;i++) {
            for(let j =0 ; j < this.parameters.length; j++) {
                if(args[i].name === this.parameters[j].getName()) {
                    this.parameters[j].setValue(args[i])
                }
            }
        }
    }

    toString() : string {
        let json = {
            name : this.name,
            returntype : this.returntype,
            parameters : this.parameters
        }

        return JSON.stringify(json)
    }
}