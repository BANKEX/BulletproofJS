"use strict";
exports.__esModule = true;
var proofUtil_1 = require("../util/proofUtil");
var PeddersenCommitment = /** @class */ (function () {
    function PeddersenCommitment(base, x, r) {
        this.base = base;
        this.x = x;
        if (r === undefined) {
            r = proofUtil_1.ProofUtils.randomNumber();
        }
        this.r = r;
    }
    PeddersenCommitment.prototype.add = function (other) {
        return new PeddersenCommitment(this.base, this.x.add(other.getX()), this.r.add(other.getR()));
    };
    PeddersenCommitment.prototype.times = function (exponent) {
        return new PeddersenCommitment(this.base, this.x.mul(exponent), this.r.mul(exponent));
    };
    PeddersenCommitment.prototype.addConstant = function (constant) {
        return new PeddersenCommitment(this.base, this.x.add(constant), this.r);
    };
    PeddersenCommitment.prototype.getX = function () {
        return this.x;
    };
    PeddersenCommitment.prototype.getR = function () {
        return this.r;
    };
    PeddersenCommitment.prototype.getCommitment = function () {
        var commitment = this.base.commit(this.x, this.r);
        return commitment;
    };
    PeddersenCommitment.prototype.getBlinding = function () {
        var p = this.base.getH().mul(this.r);
        return p;
    };
    return PeddersenCommitment;
}());
exports.PeddersenCommitment = PeddersenCommitment;
