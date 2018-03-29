"use strict";
exports.__esModule = true;
var rangeProof_1 = require("./rangeProof");
var proofUtil_1 = require("../util/proofUtil");
var fieldVector_1 = require("../linearAlgebra/fieldVector");
var bigInteger_1 = require("../bigInteger/bigInteger");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var polyCommitment_1 = require("../commitments/polyCommitment");
var innerProductWitness_1 = require("../innerProduct/innerProductWitness");
var innerProductProver_1 = require("../innerProduct/innerProductProver");
var generatorVector_1 = require("../linearAlgebra/generatorVector");
var RangeProofProver = /** @class */ (function () {
    function RangeProofProver() {
    }
    RangeProofProver.prototype.generateProof = function (parameter, commitment, witness) {
        var q = parameter.getGroup().order;
        var number = witness.getX();
        var vectorBase = parameter.getVectorBase();
        var base = parameter.getBase();
        var n = vectorBase.getGs().size();
        var ZERO = bigInteger_1.toBI(0, 10);
        var ONE = bigInteger_1.toBI(1, 10);
        var TWO = bigInteger_1.toBI(2, 10);
        var THREE = bigInteger_1.toBI(3, 10);
        var aLelements = [];
        // const aRelements = [] as BigInteger[]
        for (var i = 0; i < n; i++) {
            if (number.testn(i)) {
                aLelements.push(ONE);
                // aRelements.push(ZERO);
            }
            else {
                aLelements.push(ZERO);
                // aRelements.push(ONE);
            }
        }
        var aL = new fieldVector_1.FieldVector(aLelements, q);
        var aR = aL.subtractVector(fieldVector_1.FieldVector.fill(ONE, n, q));
        // aL.getVector().map((v) => {
        //     console.log(v.toString(10))
        // })
        // aR.getVector().map((v) => {
        //     console.log(v.toString(10))
        // })
        // const aR = new FieldVector(aRelements, q);
        var alpha = proofUtil_1.ProofUtils.randomNumber();
        var a = vectorBase.commitToTwoVectors(aL.getVector(), aR.getVector(), alpha);
        var sL = fieldVector_1.FieldVector.random(n, q);
        var sR = fieldVector_1.FieldVector.random(n, q);
        var rho = proofUtil_1.ProofUtils.randomNumber();
        var s = vectorBase.commitToTwoVectors(sL.getVector(), sR.getVector(), rho);
        var y = proofUtil_1.ProofUtils.computeChallenge(q, [commitment, a, s]);
        var ys = fieldVector_1.FieldVector.pow(y, n, q);
        var z = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [y]);
        var zSquared = z.pow(TWO).umod(q);
        var zCubed = z.pow(THREE).umod(q);
        var twos = fieldVector_1.FieldVector.pow(TWO, n, q);
        var l0 = aL.addScalar(z.neg());
        var l1 = sL;
        var twoTimesZSquared = twos.times(zSquared);
        var r0 = ys.hadamard(aR.addScalar(z)).addVector(twoTimesZSquared);
        var r1 = sR.hadamard(ys);
        var k = ys.sum().mul(z.sub(zSquared)).sub(zCubed.ushln(n).sub(zCubed));
        var t0 = k.add(zSquared.mul(number));
        var t1 = l1.innerPoduct(r0).add(l0.innerPoduct(r1));
        var t2 = l1.innerPoduct(r1);
        var polyCommitment = polyCommitment_1.PolyCommitment.from(base, t0, [t1, t2]);
        var x = proofUtil_1.ProofUtils.computeChallenge(q, polyCommitment.getNonzeroCommitments());
        var evalCommit = polyCommitment.evaluate(x);
        var tauX = zSquared.mul(witness.getR()).add(evalCommit.getR()).umod(q);
        var t = evalCommit.getX().umod(q);
        var mu = alpha.add(rho.mul(x)).umod(q);
        var uChallenge = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        var u = base.g.mul(uChallenge);
        var hs = vectorBase.getHs();
        var gs = vectorBase.getGs();
        var hPrimes = hs.hadamard(ys.invert().getVector());
        var l = l0.addVector(l1.times(x));
        var r = r0.addVector(r1.times(x));
        var hExp = ys.times(z).addVector(twoTimesZSquared);
        var P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).add(u.mul(t)).sub(base.h.mul(mu));
        var primeBase = new vectorBase_1.VectorBase(gs, hPrimes, u);
        var prover = new innerProductProver_1.InnerProductProver();
        var innerProductWitness = new innerProductWitness_1.InnerProductWitness(l, r);
        var proof = prover.generateProofFromWitness(primeBase, P, innerProductWitness);
        return new rangeProof_1.RangeProof(a, s, new generatorVector_1.GeneratorVector(polyCommitment.getNonzeroCommitments(), hs.getGroup()), tauX, mu, t, proof);
    };
    return RangeProofProver;
}());
exports.RangeProofProver = RangeProofProver;
