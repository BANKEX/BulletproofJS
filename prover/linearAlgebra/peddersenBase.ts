import { GeneratorVector } from "./generatorVector";
import { ECPoint, ECCurve } from "../curve/curve";
import {BigInteger, toBI} from "../bigInteger/bigInteger";

export class PeddersenBase {
    public generator: GeneratorVector
    public g: ECPoint;
    public h: ECPoint;

    constructor(g: ECPoint, h: ECPoint, group: ECCurve) {
        const generator = new GeneratorVector([g, h], group);
        this.generator = generator;
        this.g = g;
        this.h = h;
    }

    public commit(x: BigInteger, r: BigInteger ) : ECPoint {
        return this.g.mul(x).add(this.h.mul(r));
    }

    public getG() : ECPoint {
        return this.g;
    }

    public getH() : ECPoint {
        return this.h;
    }

}
