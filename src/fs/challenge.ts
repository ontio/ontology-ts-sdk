import { Address } from '../crypto';
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';

export class Challenge {
    public constructor(
        public readonly fileHash: string,
        public readonly fileOwner: Address = new Address('0'.repeat(40)),
        public readonly nodeAddr: Address = new Address('0'.repeat(40)),
        public readonly challengeHeight: number = 0,
        public readonly reward: number = 0,
        public readonly expiredTime: number = 0,
        public readonly state: number = 0
    ) {}

    public serializeHex(): string {
        return hex2VarBytes(this.fileHash)
            + this.fileOwner.serialize()
            + this.nodeAddr.serialize()
            + serializeUint64(this.challengeHeight)
            + serializeUint64(this.reward)
            + serializeUint64(this.expiredTime)
            + serializeUint64(this.state);
    }
}

export class ChallengeList {
    public constructor(
        public challenges: Challenge[]
    ) {}

    public serializeHex(): string {
        let str = '';
        str += serializeUint64(this.challenges.length);
        for (const challenge of this.challenges) {
            str += hex2VarBytes(challenge.serializeHex());
        }
        return str;
    }
}