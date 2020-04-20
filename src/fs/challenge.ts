import { Address } from '../crypto';
import { hex2VarBytes, StringReader } from '../utils';
import {
  decodeAddress,
  decodeVarBytes,
  decodeVarUint,
  serializeAddress,
  serializeVarUint
} from './utils';

export class Challenge {
    static deserializeHex(hex: string): Challenge {
        const sr: StringReader = new StringReader(hex);
        const fileHash = decodeVarBytes(sr);
        const fileOwner = decodeAddress(sr);
        const nodeAddr = decodeAddress(sr);
        const challengeHeight = decodeVarUint(sr);
        const reward = decodeVarUint(sr);
        const expiredTime = decodeVarUint(sr);
        const state = decodeVarUint(sr);

        return new Challenge(
      fileHash,
      fileOwner,
      nodeAddr,
      challengeHeight,
      reward,
      expiredTime,
      state
    );
    }
    public constructor(
      public readonly fileHash: string,
      public readonly fileOwner: Address = new Address('0'.repeat(40)),
      public readonly nodeAddr: Address = new Address('0'.repeat(40)),
      public readonly challengeHeight: number = 0,
      public readonly reward: number = 0,
      public readonly expiredTime: number = 0,
      public readonly state: number = 0
    ) { }

    public serializeHex(): string {
        return (
          hex2VarBytes(this.fileHash) +
          serializeAddress(this.fileOwner) +
          serializeAddress(this.nodeAddr) +
          serializeVarUint(this.challengeHeight) +
          serializeVarUint(this.reward) +
          serializeVarUint(this.expiredTime) +
          serializeVarUint(this.state)
        );
    }

    public export() {
        return {
            fileHash: this.fileHash,
            fileOwner: this.fileOwner.value,
            nodeAddr: this.nodeAddr.value,
            challengeHeight: this.challengeHeight,
            reward: this.reward,
            expiredTime: this.expiredTime,
            state: this.state
        };
    }
}

export class ChallengeList {

    static deserializeHex(hex: string): ChallengeList {
        const sr: StringReader = new StringReader(hex);
        const challenges: Challenge[] = [];
        const count = decodeVarUint(sr);
        for (let i = 0; i < count; i++) {
            const challenge = Challenge.deserializeHex(decodeVarBytes(sr));
            challenges.push(challenge);
        }
        return new ChallengeList(challenges);
    }
    public constructor(public challenges: Challenge[]) { }

    public serializeHex(): string {
        let str = '';
        str += serializeVarUint(this.challenges.length);
        for (const challenge of this.challenges) {
            str += hex2VarBytes(challenge.serializeHex());
        }
        return str;
    }

    public export() {
        return {
            challenges: this.challenges.map((challenge) => challenge.export())
        };
    }
}
