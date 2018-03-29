"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var proofUtil_1 = require("../util/proofUtil");
var EfficientInnerProductVerifier = /** @class */ (function () {
    function EfficientInnerProductVerifier() {
    }
    EfficientInnerProductVerifier.prototype.verify = function (params, c, proof) {
        var ls = proof.getL();
        var rs = proof.getR();
        var ONE = bigInteger_1.toBI(1, 10);
        var TWO = bigInteger_1.toBI(2, 10);
        var challenges = [];
        var inverseChallenges = [];
        var q = params.getGs().getCurve().order;
        for (var i = 0; i < ls.length; ++i) {
            var l = ls[i];
            var r = rs[i];
            // console.log(l.getX().toString(16));
            // console.log(l.getY().toString(16));
            var x = proofUtil_1.ProofUtils.computeChallenge(q, [l, c, r]);
            challenges.push(x);
            var xInv = x.invm(q);
            inverseChallenges.push(xInv);
            c = l.mul(x.pow(TWO)).add(r.mul(xInv.pow(TWO))).add(c);
            // console.log(x.toString(16));
            // console.log(c.getX().toString(16));
        }
        var n = params.getGs().size();
        var otherExponents = [];
        for (var i = 0; i < n; i++) {
            otherExponents.push(bigInteger_1.toBI(0, 10));
        }
        otherExponents[0] = challenges.reduce(function (prev, current) {
            return prev.mul(current).umod(q);
        }, ONE).invm(q);
        challenges = challenges.reverse();
        var bitSet = bigInteger_1.toBI(0, 10);
        var n_t = bigInteger_1.toBI(n, 10);
        for (var i = 0; i < n / 2; i++) {
            var i_t = bigInteger_1.toBI(i, 10);
            var j = 0;
            do {
                var shifted = ONE.shln(j);
                if (i_t.add(shifted).cmp(n_t) !== -1) {
                    break;
                }
                var i1 = bigInteger_1.toBI(i, 10).add(shifted).toNumber();
                if (bitSet.testn(i1)) {
                }
                else {
                    otherExponents[i1] = otherExponents[i].mul(challenges[j].pow(TWO)).umod(q);
                    bitSet = bitSet.bincn(i1);
                }
                j++;
            } while (true);
        }
        var challengeVector = [];
        for (var i = 0; i < otherExponents.length; i++) {
            challengeVector.push(otherExponents[i]);
        }
        var g = params.getGs().commit(challengeVector);
        var h = params.getHs().commit(challengeVector.reverse());
        var prod = proof.getA().mul(proof.getB()).umod(q);
        // console.log(prod.toString(16));
        var cProof = g.mul(proof.getA()).add(h.mul(proof.getB())).add(params.getH().mul(prod));
        // console.log(cProof.getX().toString(16));
        return c.equals(cProof);
    };
    return EfficientInnerProductVerifier;
}());
exports.EfficientInnerProductVerifier = EfficientInnerProductVerifier;
