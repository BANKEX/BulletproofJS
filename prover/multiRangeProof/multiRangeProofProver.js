"use strict";
exports.__esModule = true;
var rangeProof_1 = require("../rangeProof/rangeProof");
var proofUtil_1 = require("../util/proofUtil");
var fieldVector_1 = require("../linearAlgebra/fieldVector");
var bigInteger_1 = require("../bigInteger/bigInteger");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var generatorVector_1 = require("../linearAlgebra/generatorVector");
var fieldVectorPolynomial_1 = require("../linearAlgebra/fieldVectorPolynomial");
var polyCommitment_1 = require("../commitments/polyCommitment");
var innerProductWitness_1 = require("../innerProduct/innerProductWitness");
var innerProductProver_1 = require("../innerProduct/innerProductProver");
var MultiRangeProofProver = /** @class */ (function () {
    function MultiRangeProofProver() {
    }
    MultiRangeProofProver.prototype.generateProof = function (parameter, commitments, witness) {
        var m = commitments.size();
        var vectorBase = parameter.getVectorBase();
        var base = parameter.getBase();
        var n = vectorBase.getGs().size();
        var bitsPerNumber = Math.floor(n / m);
        var q = parameter.getGroup().order;
        var ZERO = bigInteger_1.toBI(0, 10);
        var ONE = bigInteger_1.toBI(1, 10);
        var TWO = bigInteger_1.toBI(2, 10);
        var THREE = bigInteger_1.toBI(3, 10);
        //Bits
        var aLelements = [];
        for (var i = 0; i < n; i++) {
            var number = witness[Math.floor(i / bitsPerNumber)].getX();
            if (number.testn(i % bitsPerNumber)) {
                aLelements.push(ONE);
            }
            else {
                aLelements.push(ZERO);
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
        var challengeArr = commitments.getVector().concat([a, s]);
        var y = proofUtil_1.ProofUtils.computeChallenge(q, challengeArr);
        //y^n
        var ys = fieldVector_1.FieldVector.pow(y, n, q);
        var z = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [y]);
        //z^Q
        var zs = fieldVector_1.FieldVector.pow(z, m + 2, q).subVector(2, m + 2); // 1, z, z^2, z^3 ... -> z^2, z^3 ...
        utils_1.assert(zs.getVector().length == m);
        var twos = fieldVector_1.FieldVector.pow(TWO, bitsPerNumber, q); // Powers of TWO
        var elements = zs.getVector().map(function (bi) {
            return twos.times(bi).getVector();
        })
            .reduce(function (prev, current) {
            return prev.concat(current);
        }, []);
        utils_1.assert(elements.length == n);
        //2^n \cdot z || 2^n \cdot z^2 ...
        var twoTimesZs = new fieldVector_1.FieldVector(elements, q);
        var l0 = aL.addScalar(z.neg());
        var l1 = sL;
        var lPoly = new fieldVectorPolynomial_1.FieldVectorPolynomial([l0, l1]);
        var r0 = ys.hadamard(aR.addScalar(z)).addVector(twoTimesZs);
        var r1 = sR.hadamard(ys);
        var rPoly = new fieldVectorPolynomial_1.FieldVectorPolynomial([r0, r1]);
        //t(X)
        var tPoly = lPoly.innerProduct(rPoly);
        //Commit(t)
        var tPolyCoefficients = tPoly.getCoefficients();
        var polyCommitment = polyCommitment_1.PolyCommitment.from(base, tPolyCoefficients[0], tPolyCoefficients.slice(1));
        var x = proofUtil_1.ProofUtils.computeChallenge(q, polyCommitment.getNonzeroCommitments());
        var mainCommitment = polyCommitment.evaluate(x);
        var mu = alpha.add(rho.mul(x)).umod(q);
        var t = mainCommitment.getX().umod(q);
        var tauX = mainCommitment.getR().add(zs.innerPoduct(new fieldVector_1.FieldVector(witness.map(function (w) {
            return w.getR();
        }), q))).umod(q);
        var uChallenge = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        var u = base.g.mul(uChallenge);
        var hs = vectorBase.getHs();
        var gs = vectorBase.getGs();
        var hPrimes = hs.hadamard(ys.invert().getVector());
        var l = l0.addVector(l1.times(x));
        var r = r0.addVector(r1.times(x));
        var hExp = ys.times(z).addVector(twoTimesZs);
        var P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).add(u.mul(t)).sub(base.h.mul(mu));
        var primeBase = new vectorBase_1.VectorBase(gs, hPrimes, u);
        var prover = new innerProductProver_1.InnerProductProver();
        var innerProductWitness = new innerProductWitness_1.InnerProductWitness(l, r);
        var proof = prover.generateProofFromWitness(primeBase, P, innerProductWitness);
        return new rangeProof_1.RangeProof(a, s, new generatorVector_1.GeneratorVector(polyCommitment.getNonzeroCommitments(), hs.getGroup()), tauX, mu, t, proof);
    };
    return MultiRangeProofProver;
}());
exports.MultiRangeProofProver = MultiRangeProofProver;
