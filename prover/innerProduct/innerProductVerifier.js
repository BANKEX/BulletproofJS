"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var InnerProductVerifier = /** @class */ (function () {
    function InnerProductVerifier() {
    }
    InnerProductVerifier.verify = function (base, c, proof) {
        var n = base.getGs().size();
        var gs = base.getGs();
        var hs = base.getHs();
        var q = gs.getCurve().order;
        for (var i = 0; i < proof.getL().length; ++i) {
            var nPrime = n / 2;
            var L = proof.getL()[i];
            var R = proof.getR()[i];
            var gLeft = gs.subVector(0, nPrime);
            var gRight = gs.subVector(nPrime, nPrime * 2);
            var hLeft = hs.subVector(0, nPrime);
            var hRight = hs.subVector(nPrime, nPrime * 2);
            var x = proofUtil_1.ProofUtils.computeChallenge(q, [L, c, R]);
            var xInv = x.invm(q);
            var xSquare = x.pow(2).mod(q);
            var xInvSquare = xInv.pow(2).mod(q);
            var xs = [];
            var xInverses = [];
            for (var i_1 = 0; i_1 < nPrime; i_1++) {
                xs.push(x);
                xInverses.push(xInv);
            }
            var gPrime = gLeft.hadamard(xInverses).addVector(gRight.hadamard(xs));
            var hPrime = hLeft.hadamard(xs).addVector(hRight.hadamard(xInverses));
            if (n % 2 == 1) {
                gPrime = gPrime.plus(gs[(n - 1)]);
                hPrime = hPrime.plus(hs[(n - 1)]);
            }
            c = L.mul(xSquare).add(R.mul(xInvSquare)).add(c);
            gs = gPrime;
            hs = hPrime;
            n = gs.size();
        }
        utils_1.assert(gs.size() == 1, "G Generator size is wrong %s should be 1");
        utils_1.assert(hs.size() == 1, "H Generator size is wrong %s should be 1");
        var g = gs.get(0);
        var h = hs.get(0);
        var prod = proof.getA().mul(proof.getB()).mod(q);
        var cProof = g.mul(proof.getA()).add(h.mul(proof.getB())).add(base.getH().mul(prod));
        return c.equals(cProof);
    };
    return InnerProductVerifier;
}());
exports.InnerProductVerifier = InnerProductVerifier;
