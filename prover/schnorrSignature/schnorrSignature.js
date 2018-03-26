"use strict";
exports.__esModule = true;
var SchnorrSignature = /** @class */ (function () {
    function SchnorrSignature(s, e, generator) {
        this.s = s;
        this.e = e;
        this.generator = generator;
    }
    SchnorrSignature.prototype.getS = function () {
        return this.s;
    };
    SchnorrSignature.prototype.getE = function () {
        return this.e;
    };
    SchnorrSignature.prototype.getGenerator = function () {
        return this.generator;
    };
    return SchnorrSignature;
}());
exports.SchnorrSignature = SchnorrSignature;
