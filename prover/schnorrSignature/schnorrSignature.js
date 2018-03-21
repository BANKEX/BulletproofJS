"use strict";
exports.__esModule = true;
var SchnorrSignature = /** @class */ (function () {
    function SchnorrSignature(s, e, group) {
        this.s = s;
        this.e = e;
        this.group = group;
    }
    SchnorrSignature.prototype.getS = function () {
        return this.s;
    };
    SchnorrSignature.prototype.getE = function () {
        return this.e;
    };
    SchnorrSignature.prototype.getGroup = function () {
        return this.group;
    };
    return SchnorrSignature;
}());
exports.SchnorrSignature = SchnorrSignature;
