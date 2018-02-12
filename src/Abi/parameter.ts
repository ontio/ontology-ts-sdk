export default class Parameter {
    private name: string
    private type: string
    private value: string 

    constructor(name: string, type: string, value: string = '') {
        this.name = name
        this.type = type
        this.value = value
    }

    getName(): string {
        return this.name
    }

    getType(): string {
        return this.type
    }

    getValue(): string {
        return this.value
    }

    setValue(value: {}): boolean {
        if (value.type === this.type && value.name === this.name && value.value) {
            this.value = value.value
            return true
        }
        return false
    }
}