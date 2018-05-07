"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var fieldVector_1 = require("../linearAlgebra/fieldVector");
var bigInteger_1 = require("../bigInteger/bigInteger");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var efficientInnerProductVerifier_1 = require("../innerProduct/efficientInnerProductVerifier");
var MultiRangeProofVerifier = /** @class */ (function () {
    function MultiRangeProofVerifier() {
    }
    MultiRangeProofVerifier.prototype.verify = function (params, commitments, proof) {
        var m = commitments.size();
        var vectorBase = params.getVectorBase();
        var base = params.getBase();
        var n = vectorBase.getGs().size();
        var bitsPerNumber = Math.floor(n / m);
        var a = proof.getaI();
        var s = proof.getS();
        var ZERO = bigInteger_1.toBI(0, 10);
        var ONE = bigInteger_1.toBI(1, 10);
        var TWO = bigInteger_1.toBI(2, 10);
        var THREE = bigInteger_1.toBI(3, 10);
        var q = params.getGroup().order;
        var challengeArr = commitments.getVector().concat([a, s]);
        var y = proofUtil_1.ProofUtils.computeChallenge(q, challengeArr);
        // console.log(y.toString(10));
        var ys = fieldVector_1.FieldVector.pow(y, n, q);
        var z = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [y]);
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
        var twoTimesZSquared = new fieldVector_1.FieldVector(elements, q);
        var zSum = zs.sum().mul(z).umod(q);
        var k = ys.sum().mul(z.sub(zs.get(0))).sub(zSum.shln(bitsPerNumber).sub(zSum)).umod(q);
        var tCommits = proof.gettCommits();
        var x = proofUtil_1.ProofUtils.computeChallenge(q, tCommits.getVector());
        var tauX = proof.getTauX();
        var mu = proof.getMu();
        var t = proof.getT();
        var lhs = base.commit(t, tauX);
        var rhs = tCommits.commit([x, x.pow(TWO)]).add(commitments.commit(zs.getVector())).add(base.commit(k, ZERO));
        utils_1.assert(lhs.equals(rhs), "Polynomial identity check failed");
        var uChallenge = proofUtil_1.ProofUtils.computeChallengeForBigIntegers(q, [tauX, mu, t]);
        var u = base.g.mul(uChallenge);
        var hs = vectorBase.getHs();
        var gs = vectorBase.getGs();
        var hPrimes = hs.hadamard(ys.invert().getVector());
        var hExp = ys.times(z).addVector(twoTimesZSquared);
        var P = a.add(s.mul(x)).add(gs.sum().mul(z.neg())).add(hPrimes.commit(hExp.getVector())).sub(base.h.mul(mu)).add(u.mul(t));
        var primeBase = new vectorBase_1.VectorBase(gs, hPrimes, u);
        var verifier = new efficientInnerProductVerifier_1.EfficientInnerProductVerifier();
        return verifier.verify(primeBase, P, proof.getProductProof());
    };
    return MultiRangeProofVerifier;
}());
exports.MultiRangeProofVerifier = MultiRangeProofVerifier;
