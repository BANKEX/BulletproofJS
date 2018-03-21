import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";

export class SchnorrWitness {
    public privateKey: BigInteger;
    public randomness: BigInteger
    public group: ECCurve
    constructor(privateKey: BigInteger , randomness: BigInteger, group: ECCurve ) {
        this.privateKey = privateKey;
        this.randomness = randomness;
        this.group = group;
    }

    public getPrivateKey(): BigInteger  {
        return this.privateKey;
    }

    public getRandomness(): BigInteger  {
        return this.randomness;
    }

    public getGroup(): ECCurve  {
        return this.group;
    }

    public static newKey(group: ECCurve) : SchnorrWitness {
        let key = ProofUtils.randomNumber()
        while (key.cmp(group.order) >= 0) {
            key = ProofUtils.randomNumber()
        }
        let rand = ProofUtils.randomNumber()
        while (rand.cmp(group.order) >= 0) {
            rand = ProofUtils.randomNumber()
        }

        return new SchnorrWitness(key, rand, group)
    }

    public getR() : ECPoint {
        return this.group.generator.mul(this.randomness)
    }

    public getPublicKey(): ECPoint {
        return this.group.generator.mul(this.privateKey)
    }
}
