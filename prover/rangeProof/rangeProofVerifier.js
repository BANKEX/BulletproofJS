"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var fieldVector_1 = require("../linearAlgebra/fieldVector");
var bigInteger_1 = require("../bigInteger/bigInteger");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var efficientInnerProductVerifier_1 = require("../innerProduct/efficientInnerProductVerifier");
var RangeProofVerifier = /** @class */ (function () {
    function RangeProofVerifier() {
    }
    RangeProofVerifier.prototype.verify = function (params, input, proof) {
        var vectorBase = params.getVectorBase();
        var base = params.getBase();
        var n = vectorBase.getGs().size();
        var a = proof.getaI();
        var s = proof.getS();
        var ZERO = bigInteger_1.toBI(0, 10);
        var ONE = bigInteger_1.toBI(1, 10);
        var TWO = bigInteger_1.toBI(2, 10);
        var THREE = bigInteger_1.toBI(3, 10);
        var q = params.getGroup().order;
        var y = proofUtil_1.ProofUtils.computeChallenge(q, [input, a, s]);
        // console.log(y.toString(16));
        var ys = fieldVector_1.FieldVector.pow(y, n, q);
        var z = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [y]);
        var zSquared = z.pow(TWO).umod(q);
        var zCubed = z.pow(THREE).umod(q);
        var twos = fieldVector_1.FieldVector.pow(TWO, n, q); // Powers of TWO
        var twoTimesZSquared = twos.times(zSquared);
        var tCommits = proof.gettCommits();
        var x = proofUtil_1.ProofUtils.computeChallenge(q, tCommits.getVector());
        var tauX = proof.getTauX();
        var mu = proof.getMu();
        var t = proof.getT();
        var lhs = base.commit(t, tauX);
        var k = ys.sum().mul(z.sub(zSquared)).sub(zCubed.shln(n).sub(zCubed));
        var rhs = tCommits.commit([x, x.pow(TWO)]).add(input.mul(zSquared)).add(base.commit(k, ZERO));
        utils_1.assert(lhs.equals(rhs), "Polynomial identity check failed");
        var uChallenge = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        // console.log(uChallenge.toString(16));
        var u = base.g.mul(uChallenge);
        var hs = vectorBase.getHs();
        var gs = vectorBase.getGs();
        var hPrimes = hs.hadamard(ys.invert().getVector());
        var hExp = ys.times(z).addVector(twoTimesZSquared);
        var P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).sub(base.h.mul(mu)).add(u.mul(t));
        var primeBase = new vectorBase_1.VectorBase(gs, hPrimes, u);
        var verifier = new efficientInnerProductVerifier_1.EfficientInnerProductVerifier();
        // console.log(P.getX().toString(16));
        return verifier.verify(primeBase, P, proof.getProductProof());
    };
    return RangeProofVerifier;
}());
exports.RangeProofVerifier = RangeProofVerifier;
