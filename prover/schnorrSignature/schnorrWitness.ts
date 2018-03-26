import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import { ProofUtils } from "../util/proofUtil";

export class SchnorrWitness {
    public privateKey: BigInteger;
    public randomness: BigInteger;
    public generator: ECPoint;
    constructor(privateKey: BigInteger , randomness: BigInteger, generator: ECPoint ) {
        this.privateKey = privateKey;
        this.randomness = randomness;
        this.generator = generator;
    }

    public getPrivateKey(): BigInteger  {
        return this.privateKey;
    }

    public getRandomness(): BigInteger  {
        return this.randomness;
    }

    public getGenerator(): ECPoint  {
        return this.generator;
    }

    public static newKey(generator: ECPoint) : SchnorrWitness {
        let key = ProofUtils.randomNumber()
        while (key.cmp(generator.curve.order) >= 0) {
            key = ProofUtils.randomNumber()
        }
        let rand = ProofUtils.randomNumber()
        while (rand.cmp(generator.curve.order) >= 0) {
            rand = ProofUtils.randomNumber()
        }

        return new SchnorrWitness(key, rand, generator)
    }

    public getR() : ECPoint {
        return this.generator.mul(this.randomness)
    }

    public getPublicKey(): ECPoint {
        return this.generator.mul(this.privateKey)
    }
}
