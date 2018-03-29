"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var innerProductProof_1 = require("./innerProductProof");
var proofUtil_1 = require("../util/proofUtil");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var InnerProductProver = /** @class */ (function () {
    function InnerProductProver() {
    }
    InnerProductProver.prototype.generateProofFromWitness = function (base, c, witness) {
        var n = base.getGs().size();
        if (!((n & (n - 1)) == 0)) {
            utils_1.assert(false, "n is not a power of 2");
        }
        // const nBI = toBI(n, 10)
        // let nPopulation = 0;
        // for (let i = 0; i < (nBI.bitLength() as number); i++) {
        //     if (nBI.testn(i)) {
        //         nPopulation++
        //     }
        // }
        var emptyLS = [];
        var emptyRS = [];
        return this.generateProof(base, c, witness.getA(), witness.getB(), emptyLS, emptyRS);
    };
    InnerProductProver.prototype.generateProof = function (base, P, as, bs, ls, rs) {
        var n = as.size();
        if (n == 1) {
            return new innerProductProof_1.InnerProductProof(ls, rs, as.firstValue(), bs.firstValue());
        }
        var nPrime = n / 2;
        var asLeft = as.subVector(0, nPrime);
        var asRight = as.subVector(nPrime, nPrime * 2);
        var bsLeft = bs.subVector(0, nPrime);
        var bsRight = bs.subVector(nPrime, nPrime * 2);
        var gs = base.getGs();
        var gLeft = gs.subVector(0, nPrime);
        var gRight = gs.subVector(nPrime, nPrime * 2);
        var hs = base.getHs();
        var hLeft = hs.subVector(0, nPrime);
        var hRight = hs.subVector(nPrime, nPrime * 2);
        var cL = asLeft.innerPoduct(bsRight);
        var cR = asRight.innerPoduct(bsLeft);
        var L = gRight.commit(asLeft.getVector()).add(hLeft.commit(bsRight.getVector()));
        var R = gLeft.commit(asRight.getVector()).add(hRight.commit(bsLeft.getVector()));
        var u = base.getH();
        L = L.add(u.mul(cL));
        ls.push(L);
        R = R.add(u.mul(cR));
        rs.push(R);
        var q = gs.getCurve().order;
        var x = proofUtil_1.ProofUtils.computeChallenge(q, [L, P, R]);
        var xInv = x.invm(q);
        var TWO = bigInteger_1.toBI(2, 10);
        var xSquare = x.pow(TWO).umod(q);
        var xInvSquare = xInv.pow(TWO).umod(q);
        var xs = [];
        var xInverses = [];
        for (var i = 0; i < nPrime; i++) {
            xs.push(x);
            xInverses.push(xInv);
        }
        var gPrime = gLeft.hadamard(xInverses).addVector(gRight.hadamard(xs));
        var hPrime = hLeft.hadamard(xs).addVector(hRight.hadamard(xInverses));
        var aPrime = asLeft.times(x).addVector(asRight.times(xInv));
        var bPrime = bsLeft.times(xInv).addVector(bsRight.times(x));
        // console.log(aPrime.getVector()[0].toString(16))
        var PPrime = L.mul(xSquare).add(R.mul(xInvSquare)).add(P);
        var basePrime = new vectorBase_1.VectorBase(gPrime, hPrime, u);
        return this.generateProof(basePrime, PPrime, aPrime, bPrime, ls, rs);
    };
    return InnerProductProver;
}());
exports.InnerProductProver = InnerProductProver;
