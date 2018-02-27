"use strict";
exports.__esModule = true;
var PeddersenCommitment = /** @class */ (function () {
    function PeddersenCommitment(base, x, r) {
        this.base = base;
        this.x = x;
        this.r = r;
        this.commitment = null;
    }
    PeddersenCommitment.prototype.getX = function () {
        return this.x;
    };
    PeddersenCommitment.prototype.getR = function () {
        return this.r;
    };
    PeddersenCommitment.prototype.getCommitment = function () {
        if (this.commitment == null) {
            this.commitment = this.base.commit(this.x, this.r);
        }
        return this.commitment;
    };
    return PeddersenCommitment;
}());
exports.PeddersenCommitment = PeddersenCommitment;
var PeddersenBase = /** @class */ (function () {
    function PeddersenBase(G, H) {
        this.G = G;
        this.H = H;
    }
    PeddersenBase.prototype.getG = function () {
        return this.G;
    };
    PeddersenBase.prototype.getH = function () {
        return this.H;
    };
    PeddersenBase.prototype.commit = function (x, r) {
        return this.G.mul(x).add(this.H.mul(r));
    };
    return PeddersenBase;
}());
exports.PeddersenBase = PeddersenBase;
