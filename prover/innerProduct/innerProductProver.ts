import {BigInteger, toBI} from "../bigInteger/bigInteger";
import {ECPoint} from "../curve/curve";
import {Buffer} from "buffer"
import {FieldVector} from "../linearAlgebra/fieldVector";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {InnerProductProof} from "./innerProductProof";
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import {InnerProductWitness} from "./innerProductWitness";

export class InnerProductProver {
    constructor () {

    }
    public generateProofFromWitness(base:VectorBase, c: ECPoint, witness: InnerProductWitness) {
        const n = base.getGs().size() as number;
        if (!((n & (n - 1)) == 0)) {
            assert(false, "n is not a power of 2")
        }
        const nBI = toBI(n, 10)
        let nPopulation = 0;
        for (let i = 0; i < (nBI.bitLength() as number); i++) {
            if (nBI.testn(i)) {
                nPopulation++
            }
        }
        const emptyLS = [] as ECPoint[]
        const emptyRS = [] as ECPoint[]
        return this.generateProof(base, c, witness.getA(), witness.getB(), emptyLS, emptyRS);
    }

    public generateProof(base: VectorBase, P: ECPoint, as: FieldVector , bs: FieldVector , ls: ECPoint[], rs: ECPoint[]) {
        let n = as.size() as number;
        if (n == 1) {
            return new InnerProductProof(ls, rs, as.firstValue(), bs.firstValue());
        }
        const nPrime = n / 2;
        const asLeft = as.subVector(0, nPrime);
        const asRight = as.subVector(nPrime, nPrime * 2);
        const bsLeft = bs.subVector(0, nPrime);
        const bsRight = bs.subVector(nPrime, nPrime * 2);

        const gs = base.getGs();
        const gLeft = gs.subVector(0, nPrime);
        const gRight = gs.subVector(nPrime, nPrime * 2);

        const hs = base.getHs();
        const hLeft = hs.subVector(0, nPrime);
        const hRight = hs.subVector(nPrime, nPrime * 2);

        const cL = asLeft.innerPoduct(bsRight);
        const cR = asRight.innerPoduct(bsLeft);
        let L = gRight.commit(asLeft.getVector()).add(hLeft.commit(bsRight.getVector()));
        let R = gLeft.commit(asRight.getVector()).add(hRight.commit(bsLeft.getVector()));

        const u = base.getH();
        L = L.add(u.mul(cL));
        ls.push(L);
        R = R.add(u.mul(cR));
        rs.push(R);
        const q = gs.getCurve().order;
        const x = ProofUtils.computeChallenge(q, [L, P, R]);
        const xInv = x.invm(q) as BigInteger;
        const TWO = toBI(2, 10);
        const xSquare = x.pow(TWO).mod(q) as BigInteger;
        const xInvSquare = xInv.pow(TWO).mod(q) as BigInteger;
        let xs = [] as  BigInteger[]
        let xInverses = [] as BigInteger[]
        for (let i = 0; i < nPrime; i++) {
            xs.push(x)
            xInverses.push(xInv)
        }
        const gPrime = gLeft.haddamard(xInverses).addVector(gRight.haddamard(xs));
        const hPrime = hLeft.haddamard(xs).addVector(hRight.haddamard(xInverses));
        const aPrime = asLeft.times(x).addVector(asRight.times(xInv));
        const bPrime = bsLeft.times(xInv).addVector(bsRight.times(x));

        // System.out.println("P " + P.stringRepresentation());
        // System.out.println("PAlt "+gs.commit(as).add(hs.commit(bs)).add(u.multiply(as.innerPoduct(bs))).stringRepresentation());
        const PPrime = L.mul(xSquare).add(R.mul(xInvSquare)).add(P);
        const basePrime = new VectorBase(gPrime, hPrime, u);
        // System.out.println("c "+ aPrime.innerPoduct(bPrime).mod(q));
        // System.out.println("calt "+asLeft.innerPoduct(bsRight).multiply(xSquare).add(asRight.innerPoduct(bsLeft).multiply(xInvSquare)).add(as.innerPoduct(bs)).mod(q));
        // System.out.println("X " + x);
        // System.out.println("Xinv " + xInv);
        // System.out.println("C " +PPrime.stringRepresentation());
        //System.out.println("C alt" + pPrimeAlt);
        //System.out.println(PPrime.equals(pPrimeAlt));
        return this.generateProof(basePrime, PPrime, aPrime, bPrime, ls, rs);
    }

}

