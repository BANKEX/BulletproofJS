import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"
import {GeneratorVector} from "../linearAlgebra/generatorVector";
import {InnerProductProof} from "../innerProduct/innerProductProof";

const emptyBuffer = Buffer.alloc(0);
type Buffer = typeof emptyBuffer;


export class RangeProof {
    public aI: ECPoint;
    public s: ECPoint;
    public tCommits: GeneratorVector;
    public tauX: BigInteger;
    public mu: BigInteger;
    public t: BigInteger;
    public productProof: InnerProductProof;

    constructor(aI: ECPoint, s: ECPoint, tCommits: GeneratorVector, tauX: BigInteger, mu: BigInteger, t: BigInteger, productProof: InnerProductProof) {
        this.aI = aI;
        this.s = s;
        this.tCommits = tCommits;
        this.tauX = tauX;
        this.mu = mu;
        this.t = t;
        this.productProof = productProof;
    }

    public getaI():ECPoint {
        return this.aI;
    }

    public getS():ECPoint {
        return this.s;
    }

    public getTauX(): BigInteger  {
        return this.tauX;
    }

    public getMu(): BigInteger {
        return this.mu;
    }

    public getT(): BigInteger {
        return this.t;
    }

    public getProductProof(): InnerProductProof {
        return this.productProof;
    }

    public gettCommits(): GeneratorVector {
        return this.tCommits;
    }
    public numInts(): number{
        return 5;
    }
    public numElements(): number{
        return 2+ this.tCommits.getVector().length + this.productProof.getL().length + this.productProof.getR().length;
    }
}

