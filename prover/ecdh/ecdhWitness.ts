import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";

export class ECDHWitness {
    public randomness: BigInteger;
    public generator: ECPoint;
    constructor(randomness: BigInteger, generator: ECPoint ) {
        this.randomness = randomness;
        this.generator = generator;
    }

    public getRandomness(): BigInteger  {
        return this.randomness;
    }

    public getGenerator(): ECPoint  {
        return this.generator;
    }

    public static newKey(generator: ECPoint) : ECDHWitness {
        let rand = ProofUtils.randomNumber()
        while (rand.cmp(generator.curve.order) >= 0) {
            rand = ProofUtils.randomNumber()
        }

        return new ECDHWitness(rand, generator)
    }

    public getKey(): ECPoint {
        return this.generator.mul(this.randomness)
    }
}
