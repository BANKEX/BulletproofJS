import { ECPoint } from "../curve/curve";
import { RangeProof } from "./rangeProof";
import {GeneratorParams} from "./generatorParams";
import {ProofUtils} from "../util/proofUtil";
import {FieldVector} from "../linearAlgebra/fieldVector";
import { toBI, BigInteger } from "../bigInteger/bigInteger";
import { assert } from "../elliptic/lib/elliptic/utils";
import {VectorBase} from "../linearAlgebra/vectorBase";
import {EfficientInnerProductVerifier} from "../innerProduct/efficientInnerProductVerifier";
import {PeddersenCommitment} from "../commitments/peddersenCommitment";
import {PolyCommitment} from "../commitments/polyCommitment";
import {InnerProductWitness} from "../innerProduct/innerProductWitness";
import {InnerProductProver} from "../innerProduct/innerProductProver";
import {GeneratorVector} from "../linearAlgebra/generatorVector";

export class RangeProofProver {

    public generateProof(parameter: GeneratorParams, commitment: ECPoint, witness: PeddersenCommitment) {
        const q = parameter.getGroup().order as BigInteger;

        const number = witness.getX();
        const vectorBase = parameter.getVectorBase();
        const base = parameter.getBase();
        const n = vectorBase.getGs().size();
        const ZERO = toBI(0, 10);
        const ONE = toBI(1, 10);
        const TWO = toBI(2, 10);
        const THREE = toBI(3, 10);
        const aLelements = [] as BigInteger[]
        // const aRelements = [] as BigInteger[]
        for (let i = 0; i < n; i++) {
            if (number.testn(i)) {
                aLelements.push(ONE);
                // aRelements.push(ZERO);
            } else {
                aLelements.push(ZERO);
                // aRelements.push(ONE);
            }
        }
        const aL = new FieldVector(aLelements, q);
        const aR = aL.subtractVector(FieldVector.fill(ONE, n, q));
        // aL.getVector().map((v) => {
        //     console.log(v.toString(10))
        // })
        // aR.getVector().map((v) => {
        //     console.log(v.toString(10))
        // })
        // const aR = new FieldVector(aRelements, q);
        const alpha = ProofUtils.randomNumber();
        const a = vectorBase.commitToTwoVectors(aL.getVector(), aR.getVector(), alpha);
        const sL = FieldVector.random(n,q);
        const sR = FieldVector.random(n,q);
        const rho = ProofUtils.randomNumber();
        const s = vectorBase.commitToTwoVectors(sL.getVector(), sR.getVector(), rho);

        const y = ProofUtils.computeChallenge(q, [commitment, a, s]);
        const ys = FieldVector.pow(y, n, q);

        const z = ProofUtils.computeChallengeForBigIntegers(q,[y]) as BigInteger;
        const zSquared = z.pow(TWO).umod(q) as BigInteger;
        const zCubed = z.pow(THREE).umod(q) as BigInteger;

        const twos = FieldVector.pow(TWO, n, q);
        const l0 = aL.addScalar(z.neg());

        const l1 = sL;
        const twoTimesZSquared = twos.times(zSquared);
        const r0 = ys.hadamard(aR.addScalar(z)).addVector(twoTimesZSquared);
        const r1 = sR.hadamard(ys);
        const k = ys.sum().mul(z.sub(zSquared)).sub(zCubed.ushln(n).sub(zCubed));
        const t0 = k.add(zSquared.mul(number));
        const t1 = l1.innerPoduct(r0).add(l0.innerPoduct(r1)) as BigInteger;
        const t2 = l1.innerPoduct(r1) as BigInteger;
        const polyCommitment = PolyCommitment.from(base, t0, [t1, t2]);

        const x = ProofUtils.computeChallenge(q, polyCommitment.getNonzeroCommitments());

        const evalCommit = polyCommitment.evaluate(x);
        const tauX = zSquared.mul(witness.getR()).add(evalCommit.getR()).umod(q);
        const t = evalCommit.getX().umod(q);
        const mu = alpha.add(rho.mul(x)).umod(q);

        const uChallenge = ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        const u = base.g.mul(uChallenge);
        const hs = vectorBase.getHs();
        const gs = vectorBase.getGs();
        const hPrimes = hs.hadamard(ys.invert().getVector());
        const l = l0.addVector(l1.times(x));
        const r = r0.addVector(r1.times(x));
        const hExp = ys.times(z).addVector(twoTimesZSquared);
        const P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).add(u.mul(t)).sub(base.h.mul(mu));
        const primeBase = new VectorBase(gs, hPrimes, u);
        const prover = new InnerProductProver();
        const innerProductWitness = new InnerProductWitness(l, r);
        const proof = prover.generateProofFromWitness(primeBase, P, innerProductWitness);
        return new RangeProof(a, s, new GeneratorVector(polyCommitment.getNonzeroCommitments(), hs.getGroup()), tauX, mu, t, proof);
    }
}
