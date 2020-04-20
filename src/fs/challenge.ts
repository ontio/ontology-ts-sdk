import { Address } from '../crypto';
<<<<<<< HEAD
import { hex2VarBytes } from '../utils';
import { serializeUint64 } from './utils';
=======
import { hex2VarBytes, StringReader } from '../utils';
import {
  decodeAddress,
  decodeVarBytes,
  decodeVarUint,
  serializeAddress,
  serializeVarUint
} from './utils';
>>>>>>> ontio/master

export class Challenge {
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
  static deserializeHex(hex: string): Challenge {
    let sr: StringReader = new StringReader(hex);
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
}

export class ChallengeList {
  public constructor(public challenges: Challenge[]) { }

  public serializeHex(): string {
    let str = '';
    str += serializeVarUint(this.challenges.length);
    for (const challenge of this.challenges) {
      str += hex2VarBytes(challenge.serializeHex());
    }
    return str;
  }

  static deserializeHex(hex: string): ChallengeList {
    let sr: StringReader = new StringReader(hex);
    let challenges: Challenge[] = [];
    let count = decodeVarUint(sr);
    for (let i = 0; i < count; i++) {
      const challenge = Challenge.deserializeHex(decodeVarBytes(sr));
      challenges.push(challenge);
    }
    return new ChallengeList(challenges);
  }
}
