import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";

export class SchnorrSignature {
    public s: BigInteger;
    public e: BigInteger;
    public generator: ECPoint;
    constructor(s: BigInteger , e: BigInteger, generator: ECPoint) {
        this.s = s;
        this.e = e;
        this.generator = generator;
    }

    public getS(): BigInteger  {
        return this.s;
    }

    public getE(): BigInteger {
        return this.e;
    }

    public getGenerator(): ECPoint {
        return this.generator;
    }
}
