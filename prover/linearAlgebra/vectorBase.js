"use strict";
exports.__esModule = true;
var VectorBase = /** @class */ (function () {
    function VectorBase(gs, hs, h) {
        this.gs = gs;
        this.hs = hs;
        this.h = h;
    }
    VectorBase.prototype.commit = function (gExp, blinding) {
        return this.gs.commit(gExp).add(this.h.mul(blinding));
    };
    VectorBase.prototype.commitToTwoVectors = function (gExp, hExp, blinding) {
        var blind = this.h.mul(blinding);
        var commitGs = this.gs.commit(gExp);
        var commitHs = this.hs.commit(hExp);
        var res = commitGs.add(commitHs).add(blind);
        return res;
    };
    VectorBase.prototype.getGs = function () {
        return this.gs;
    };
    VectorBase.prototype.getHs = function () {
        return this.hs;
    };
    VectorBase.prototype.getH = function () {
        return this.h;
    };
    return VectorBase;
}());
exports.VectorBase = VectorBase;
