import {ECPoint} from "../curve/curve";
import {BigInteger, toBI} from "../bigInteger/bigInteger";

export class PeddersenCommitment {
    private x: BigInteger
    private r: BigInteger
    private base: PeddersenBase
    private commitment: ECPoint
    constructor(base: PeddersenBase, x: BigInteger, r: BigInteger) {
        this.base = base;
        this.x = x;
        this.r = r;
        this.commitment = null;
    }
  
    getX() {
        return this.x;
    }

    getR() {
        return this.r;
    }

    getCommitment() {
        if (this.commitment == null) {
            this.commitment = this.base.commit(this.x, this.r);
        }
        return this.commitment;
    }
  }
 
export  class PeddersenBase {
    private G: ECPoint
    private H: ECPoint

    constructor(G: ECPoint, H: ECPoint) {
        this.G = G;
        this.H = H;
    }
    getG(): ECPoint {
        return this.G
    }

    getH(): ECPoint {
        return this.H
    }

    commit(x: BigInteger, r: BigInteger) {
        return this.G.mul(x).add(this.H.mul(r));
    }
}