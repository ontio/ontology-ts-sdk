

export default abstract class Payload {
    abstract serialize() : string 
    abstract deserialize(ss : any) : void
}