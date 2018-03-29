import { ECPoint } from "../curve/curve";
import { RangeProof } from "./rangeProof";
import {GeneratorParams} from "./generatorParams";
import {ProofUtils} from "../util/proofUtil";
import {FieldVector} from "../linearAlgebra/fieldVector";
import { toBI, BigInteger } from "../bigInteger/bigInteger";
import { assert } from "../elliptic/lib/elliptic/utils";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {EfficientInnerProductVerifier} from "../innerProduct/efficientInnerProductVerifier";

export class RangeProofVerifier {

    public verify(params: GeneratorParams, input: ECPoint, proof: RangeProof) : Boolean {
        const vectorBase = params.getVectorBase();
        const base = params.getBase();
        const n = vectorBase.getGs().size();
        const a = proof.getaI();
        const s = proof.getS();
        const ZERO = toBI(0, 10);
        const ONE = toBI(1, 10);
        const TWO = toBI(2, 10);
        const THREE = toBI(3, 10);

        const q = params.getGroup().order;
        const y = ProofUtils.computeChallenge(q, [input, a, s]);
        // console.log(y.toString(16));
        const ys = FieldVector.pow(y, n, q);
        
        const z = ProofUtils.computeChallengeForBigIntegers(q,[y]) as BigInteger;
        const zSquared = z.pow(TWO).umod(q) as BigInteger;
        const zCubed = z.pow(THREE).umod(q) as BigInteger;

        const twos = FieldVector.pow(TWO, n, q); // Powers of TWO
        const twoTimesZSquared = twos.times(zSquared);
        const tCommits = proof.gettCommits();

        const x = ProofUtils.computeChallenge(q, tCommits.getVector()) as BigInteger;

        const tauX = proof.getTauX();
        const mu = proof.getMu();
        const t = proof.getT();
        const lhs = base.commit(t, tauX);
        const k = ys.sum().mul(z.sub(zSquared)).sub(zCubed.shln(n).sub(zCubed));
        const rhs = tCommits.commit([x, x.pow(TWO)]).add(input.mul(zSquared)).add(base.commit(k, ZERO));
        assert(lhs.equals(rhs), "Polynomial identity check failed");

        const uChallenge = ProofUtils.computeChallengeForBigIntegers(q,[tauX, mu, t]);
        // console.log(uChallenge.toString(16));
        const u = base.g.mul(uChallenge);
        const hs = vectorBase.getHs();
        const gs = vectorBase.getGs();
        const hPrimes = hs.hadamard(ys.invert().getVector());
        const hExp = ys.times(z).addVector(twoTimesZSquared);
        const P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).sub(base.h.mul(mu)).add(u.mul(t));
        const primeBase = new VectorBase(gs, hPrimes, u);
        const verifier = new EfficientInnerProductVerifier();
        // console.log(P.getX().toString(16));
        return verifier.verify(primeBase, P, proof.getProductProof());

    }
}
