import { PeddersenBase } from "../linearAlgebra/peddersenBase";
import { BigInteger } from "../bigInteger/bigInteger";
import { ECCurve, ECPoint } from "../curve/curve";
import {ProofUtils} from "../util/proofUtil"
export class PeddersenCommitment {
    public base: PeddersenBase;
    public x: BigInteger;
    public r: BigInteger ;
    public commitment: ECPoint;

    constructor(base: PeddersenBase, x: BigInteger, r?: BigInteger) {
        this.base = base;
        this.x = x;
        if (r === undefined) {
            r = ProofUtils.randomNumber()
        }
        this.r = r;
    }

    public add(other: PeddersenCommitment) : PeddersenCommitment {
        return new PeddersenCommitment(this.base, this.x.add(other.getX()), this.r.add(other.getR()));
    }

    public times(exponent: BigInteger ): PeddersenCommitment {
        return new PeddersenCommitment(this.base, this.x.mul(exponent), this.r.mul(exponent));
    }

    public addConstant(constant: BigInteger ): PeddersenCommitment {
        return new PeddersenCommitment(this.base, this.x.add(constant), this.r);
    }

    public getX(): BigInteger  {
        return this.x;
    }

    public getR(): BigInteger  {
        return this.r;
    }

    public getCommitment(): ECPoint {
        const commitment = this.base.commit(this.x, this.r);
        return commitment;
    }

    public getBlinding(): ECPoint {
        const p = this.base.getH().mul(this.r);
        return p;
    }
}
