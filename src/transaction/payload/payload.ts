

export default abstract class Payload {
    abstract serialize() : string 
    //static can not use with abstract
    abstract deserialize(ss : any) : void
}