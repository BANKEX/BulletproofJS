import {BigInteger, toBI} from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";

export class SchnorrSignature {
    public s: BigInteger;
    public e: BigInteger;
    public group: ECCurve;
    constructor(s: BigInteger , e: BigInteger, group: ECCurve ) {
        this.s = s;
        this.e = e;
        this.group = group;
    }

    public getS(): BigInteger  {
        return this.s;
    }

    public getE(): BigInteger {
        return this.e;
    }

    public getGroup(): ECCurve  {
        return this.group;
    }
}
