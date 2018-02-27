const BN = require('bignumber.js');
const proofUtils = require('./utils');
const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);

class RangeProofProver{
    generateProof(parameter, commitment, witness) {
        const q = parameter.getGroup().n; //
        const number = witness.getX();
        const vectorBase = parameter.getVectorBase();
        const base = parameter.getBase();
        const n = vectorBase.getGs().size();

        const numberBits = number.toString(2).reversed();
        const numberBitsLenth = numberBits.length;
        const range = Array.from({length: n}, (x,i) => i);
        const aLs = [];
        for (let i = 0; i < n; i++) {
            if (numberBits.substring(i, i+1) === "1") {
                aLs.push(new BN(1));
            } else {
                aLs.push(new BN(0));
            }
        }
        const aL = new FieldVector(aLs, q);
        const aRs = [];
        for (let i = 0; i < n; i++) {
            if (numberBits.substring(i, i+1) === "1") {
                aRs.push(new BN(0));
            } else {
                aRs.push(new BN(-1));
            }
        }
        const aR = new FieldVector (aRs, q);
        let scaling = new BN(10);
        scaling = scaling.pow(70);
        const alpha = BN.random(70).mul(scaling).integerValue().mod(q);
        const a = vectorBase.commit(aL, aR, alpha);

        const sLs = [];
        const sRs = [];
        for (let i = 0; i < n; i++) {
            sLs.push(BN.random(70).mul(scaling).integerValue().mod(q));
            sRs.push(BN.random(70).mul(scaling).integerValue().mod(q));
        }
        const sL = new FieldVector(sLs, q);
        const sR = new FieldVector(sRs, q);
        const rho = BN.random(70).mul(scaling).integerValue().mod(q);
        const s = vectorBase.commit(sL, sR, rho);

        const y = proofUtils.computeChallenge(q, commitment.append(a).append(s));
        const yss = [];

        for (let i = 0; i < n; i++) {
            yss.push(ONE.mul(y))
        }
        const ys = new FieldVector(yss, q);

        const z = ProofUtils.computeChallengeFromBigints(q,[y]);
        const zSquared = z.pow(2).mod(q);
        const zCubed = z.pow(3).mod(q);

        const twoss =[];
        for (let i = 0; i < n; i++) {
            twoss.push(TWO.pow(n));
        }
        const twos = new FieldVector(twoss, q);

        const l0 = aL.addConstant(z.negate());
        const l1 = sL;
        const twoTimesZSquared = twos.times(zSquared);
        const r0 = ys.hadamard(aR.addConstant(z)).addConstant(twoTimesZSquared);
        const r1 = sR.hadamard(ys);
        const k = ys.sum().multiply(z.subtract(zSquared)).subtract(zCubed.mul(TWO.pow(n)).subtract(zCubed));
        const t0 = k.add(zSquared.multiply(number));
        const t1 = l1.innerPoduct(r0).add(l0.innerPoduct(r1));
        const t2 = l1.innerPoduct(r1);
        
        PolyCommitment<T> polyCommitment = PolyCommitment.from(base, t0, VectorX.of(t1, t2));

        BigInteger x = ProofUtils.computeChallenge(q,polyCommitment.getCommitments());

        PeddersenCommitment<T> evalCommit = polyCommitment.evaluate(x);
        BigInteger tauX = zSquared.multiply(witness.getR()).add(evalCommit.getR()).mod(q);
        BigInteger t = evalCommit.getX().mod(q);
        BigInteger mu = alpha.add(rho.multiply(x)).mod(q);

        BigInteger uChallenge = ProofUtils.challengeFromints(q,tauX, mu, t);
        T u = base.g.multiply(uChallenge);
        GeneratorVector<T> hs = vectorBase.getHs();
        GeneratorVector<T> gs = vectorBase.getGs();
        GeneratorVector<T> hPrimes = hs.haddamard(ys.invert());
        FieldVector l = l0.add(l1.times(x));
        FieldVector r = r0.add(r1.times(x));
        FieldVector hExp = ys.times(z).add(twoTimesZSquared);
        T P = a.add(s.multiply(x)).add(gs.sum().multiply(z.negate())).add(hPrimes.commit(hExp)).add(u.multiply(t)).subtract(base.h.multiply(mu));
        VectorBase<T> primeBase = new VectorBase<>(gs, hPrimes, u);
        InnerProductProver<T> prover = new InnerProductProver<>();
        InnerProductWitness innerProductWitness = new InnerProductWitness(l, r);
        InnerProductProof<T> proof = prover.generateProof(primeBase, P, innerProductWitness);
        return new RangeProof<>(a, s, new GeneratorVector<T>(polyCommitment.getCommitments(), hs.getGroup()), tauX, mu, t, proof);
    }
}