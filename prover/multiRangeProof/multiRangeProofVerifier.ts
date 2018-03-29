import { ECPoint } from "../curve/curve";
import { RangeProof } from "../rangeProof/rangeProof";
import {GeneratorParams} from "../rangeProof/generatorParams";
import {ProofUtils} from "../util/proofUtil";
import {FieldVector} from "../linearAlgebra/fieldVector";
import { toBI, BigInteger } from "../bigInteger/bigInteger";
import { assert } from "../elliptic/lib/elliptic/utils";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {EfficientInnerProductVerifier} from "../innerProduct/efficientInnerProductVerifier";
import { GeneratorVector } from "../linearAlgebra/generatorVector";

export class MultiRangeProofVerifier {

    public verify(params: GeneratorParams, commitments: GeneratorVector, proof: RangeProof) : Boolean {
        const m = commitments.size();
        const vectorBase = params.getVectorBase();
        const base = params.getBase();
        const n = vectorBase.getGs().size();

        const bitsPerNumber = Math.floor(n / m);

        const a = proof.getaI();
        const s = proof.getS();
        const ZERO = toBI(0, 10);
        const ONE = toBI(1, 10);
        const TWO = toBI(2, 10);
        const THREE = toBI(3, 10);

        const q = params.getGroup().order;

        const challengeArr = commitments.getVector().concat([a, s])

        const y = ProofUtils.computeChallenge(q, challengeArr);
        const ys = FieldVector.pow(y, n, q);

        const z = ProofUtils.computeChallengeForBigIntegers(q,[y]) as BigInteger;
        const zs = FieldVector.pow(z, m+2, q).subVector(2, m+2); // 1, z, z^2, z^3 ... -> z^2, z^3 ...
        assert(zs.getVector().length == m);

        const twos = FieldVector.pow(TWO, bitsPerNumber, q); // Powers of TWO
        const elements = zs.getVector().map((bi) => {
            return twos.times(bi).getVector();
        })
        .reduce((prev: BigInteger[], current: BigInteger[]) => {
            return prev.concat(current)
        }, [] as BigInteger[]);
        assert(elements.length == n);
        const twoTimesZSquared = new FieldVector(elements, q)  
        const zSum = zs.sum().mul(z).umod(q);
        const k = ys.sum().mul(z.sub(zs.get(0))).sub(zSum.shln(bitsPerNumber).sub(zSum)).umod(q);

        const tCommits = proof.gettCommits();

        const x = ProofUtils.computeChallenge(q, tCommits.getVector()) as BigInteger;

        const tauX = proof.getTauX();
        const mu = proof.getMu();
        const t = proof.getT();
        const lhs = base.commit(t, tauX);
        const rhs = tCommits.commit([x, x.pow(TWO)]).add(commitments.commit(zs.getVector())).add(base.commit(k, ZERO));

        assert(lhs.equals(rhs), "Polynomial identity check failed");

        const uChallenge = ProofUtils.computeChallengeForBigIntegers(q,[tauX, mu, t]);
        const u = base.g.mul(uChallenge);
        const hs = vectorBase.getHs();
        const gs = vectorBase.getGs();
        const hPrimes = hs.hadamard(ys.invert().getVector());
        const hExp = ys.times(z).addVector(twoTimesZSquared);
        const P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).sub(base.h.mul(mu)).add(u.mul(t));
        const primeBase = new VectorBase(gs, hPrimes, u);
        const verifier = new EfficientInnerProductVerifier();
        return verifier.verify(primeBase, P, proof.getProductProof());




        

        



        

    }
}
