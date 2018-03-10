import {GeneratorVector} from "./generatorVector"
import { ECPoint } from "../curve/curve";
import { BigInteger} from "../bigInteger/bigInteger";

export class VectorBase{
    private gs:GeneratorVector;
    private hs:GeneratorVector;
    private h:ECPoint;

    constructor(gs:GeneratorVector, hs:GeneratorVector, h:ECPoint) {
        this.gs = gs;
        this.hs = hs;
        this.h = h;
    }

    commit(gExp: BigInteger[], blinding:BigInteger) : ECPoint {
        return this.gs.commit(gExp).add(this.h.mul(blinding));
    }

    commitToTwoVectors(gExp: BigInteger[], hExp:BigInteger[], blinding: BigInteger): ECPoint {
        const blind = this.h.mul(blinding);
        const commitGs = this.gs.commit(gExp);
        const commitHs = this.hs.commit(hExp);
        const res = commitGs.add(commitHs).add(blind);
        return res;
    }

    getGs(): GeneratorVector {
        return this.gs;
    }

    getHs(): GeneratorVector {
        return this.hs;
    }

    getH(): ECPoint {
        return this.h;
    }
}
