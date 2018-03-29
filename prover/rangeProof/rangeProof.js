"use strict";
exports.__esModule = true;
var buffer_1 = require("buffer");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var RangeProof = /** @class */ (function () {
    function RangeProof(aI, s, tCommits, tauX, mu, t, productProof) {
        this.aI = aI;
        this.s = s;
        this.tCommits = tCommits;
        this.tauX = tauX;
        this.mu = mu;
        this.t = t;
        this.productProof = productProof;
    }
    RangeProof.prototype.getaI = function () {
        return this.aI;
    };
    RangeProof.prototype.getS = function () {
        return this.s;
    };
    RangeProof.prototype.getTauX = function () {
        return this.tauX;
    };
    RangeProof.prototype.getMu = function () {
        return this.mu;
    };
    RangeProof.prototype.getT = function () {
        return this.t;
    };
    RangeProof.prototype.getProductProof = function () {
        return this.productProof;
    };
    RangeProof.prototype.gettCommits = function () {
        return this.tCommits;
    };
    RangeProof.prototype.numInts = function () {
        return 5;
    };
    RangeProof.prototype.numElements = function () {
        return 2 + this.tCommits.getVector().length + this.productProof.getL().length + this.productProof.getR().length;
    };
    return RangeProof;
}());
exports.RangeProof = RangeProof;
