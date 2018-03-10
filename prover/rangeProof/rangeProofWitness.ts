import {BigInteger, toBI} from "../bigInteger/bigInteger";

export class RangeProofWitness {
    public number: BigInteger;

    public randomness: BigInteger;
    public RangeProofWitness(number: BigInteger , randomness: BigInteger ) {
        this.number = number;
        this.randomness = randomness;
    }

    public getNumber(): BigInteger  {
        return this.number;
    }

    public getRandomness(): BigInteger  {
        return this.randomness;
    }

}
