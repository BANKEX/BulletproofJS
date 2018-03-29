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
import { PeddersenCommitment } from "../commitments/peddersenCommitment";
import { FieldVectorPolynomial } from "../linearAlgebra/fieldVectorPolynomial";
import { PolyCommitment } from "../commitments/polyCommitment";
import { InnerProductWitness } from "../innerProduct/innerProductWitness";
import { InnerProductProof } from "../innerProduct/innerProductProof";
import { InnerProductProver } from "../innerProduct/innerProductProver";

export class MultiRangeProofProver {
    generateProof(parameter: GeneratorParams, commitments: GeneratorVector, witness: PeddersenCommitment[]) {
        const m = commitments.size();

        const vectorBase = parameter.getVectorBase();
        const base = parameter.getBase();
        const n = vectorBase.getGs().size();

        const bitsPerNumber = Math.floor(n / m);

        const q = parameter.getGroup().order as BigInteger;

        const ZERO = toBI(0, 10);
        const ONE = toBI(1, 10);
        const TWO = toBI(2, 10);
        const THREE = toBI(3, 10);
        //Bits
        const aLelements = [] as BigInteger[]
        for (let i = 0; i < n; i++) {
            const number = witness[Math.floor(i/bitsPerNumber)].getX()
            if (number.testn(i % bitsPerNumber)) {
                aLelements.push(ONE);
            } else {
                aLelements.push(ZERO);
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

        const challengeArr = commitments.getVector().concat([a, s])

        const y = ProofUtils.computeChallenge(q, challengeArr);
        //y^n
        const ys = FieldVector.pow(y, n, q);

        const z = ProofUtils.computeChallengeForBigIntegers(q,[y]) as BigInteger;
        //z^Q
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

        //2^n \cdot z || 2^n \cdot z^2 ...
        const twoTimesZs = new FieldVector(elements, q)  

        const l0 = aL.addScalar(z.neg());

        const l1 = sL;
        const lPoly = new FieldVectorPolynomial([l0, l1]);

        const r0 = ys.hadamard(aR.addScalar(z)).addVector(twoTimesZs);
        const r1 = sR.hadamard(ys);
        const rPoly = new FieldVectorPolynomial([r0, r1]);

        //t(X)
        const tPoly = lPoly.innerProduct(rPoly);

        //Commit(t)
        const tPolyCoefficients = tPoly.getCoefficients();
        const polyCommitment = PolyCommitment.from(base, tPolyCoefficients[0], tPolyCoefficients.slice(1));

        const x = ProofUtils.computeChallenge(q, polyCommitment.getNonzeroCommitments());

        const mainCommitment = polyCommitment.evaluate(x);

        const mu = alpha.add(rho.mul(x)).umod(q);
        const t = mainCommitment.getX().umod(q);
        const tauX = mainCommitment.getR().add(zs.innerPoduct( new FieldVector(witness.map((w) : BigInteger => {
            return w.getR();
        }), q))).umod(q);

        const uChallenge = ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        const u = base.g.mul(uChallenge);
        const hs = vectorBase.getHs();
        const gs = vectorBase.getGs();
        const hPrimes = hs.hadamard(ys.invert().getVector());
        const l = l0.addVector(l1.times(x));
        const r = r0.addVector(r1.times(x));
        const hExp = ys.times(z).addVector(twoTimesZs);
        const P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).add(u.mul(t)).sub(base.h.mul(mu));

        const primeBase = new VectorBase(gs, hPrimes, u);
        const prover = new InnerProductProver();
        const innerProductWitness = new InnerProductWitness(l, r);
        const proof = prover.generateProofFromWitness(primeBase, P, innerProductWitness);
        return new RangeProof(a, s, new GeneratorVector(polyCommitment.getNonzeroCommitments(), hs.getGroup()), tauX, mu, t, proof);        
    }
}
