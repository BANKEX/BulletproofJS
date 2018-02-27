"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var elliptic_1 = require("../elliptic");
var buffer_1 = require("buffer");
// import Buffer
var EC = elliptic_1.ec;
var CURVE = elliptic_1.curve.base;
var POINT = CURVE.BasePoint;
var emptyBuffer = buffer_1.Buffer.alloc(0);
var ECCurve = /** @class */ (function () {
    function ECCurve(name) {
        var ellCurve = new EC(name);
        this.curveRef = ellCurve;
        this.order = this.curveRef.n;
        this.halfOrder = this.curveRef.nh;
        this.primeFieldSize = this.curveRef.curve.p;
        this.generator = new ECPoint(this.curveRef.g, this);
        this.zero = this.generator.sub(this.generator);
    }
    ECCurve.prototype.pointFromCoordinates = function (x, y) {
        return this.curveRef.point(x, y, null, null);
    };
    ECCurve.prototype.hash = function (input) {
        return this.curveRef.hash(input);
    };
    return ECCurve;
}());
exports.ECCurve = ECCurve;
var ECPoint = /** @class */ (function () {
    function ECPoint(p, curve) {
        this.pointRef = p;
        this.curve = curve;
    }
    ECPoint.prototype.add = function (another) {
        var p = this.pointRef.add(another.pointRef);
        return new ECPoint(p, this.curve);
    };
    ECPoint.prototype.mul = function (scalar) {
        var p = this.pointRef.mul(scalar);
        return new ECPoint(p, this.curve);
    };
    ECPoint.prototype.sub = function (another) {
        var p = this.pointRef.add(another.pointRef.neg());
        return new ECPoint(p, this.curve);
    };
    ECPoint.prototype.negate = function () {
        var p = this.pointRef.neg();
        return new ECPoint(p, this.curve);
    };
    ECPoint.prototype.inverse = function () {
        var p = this.pointRef.inverse();
        return new ECPoint(p, this.curve);
    };
    ECPoint.prototype.isInfinity = function () {
        return this.pointRef.inf;
    };
    ECPoint.prototype.getX = function () {
        return this.pointRef.getX();
    };
    ECPoint.prototype.getY = function () {
        return this.pointRef.getY();
    };
    return ECPoint;
}());
exports.ECPoint = ECPoint;
var bn256 = new ECCurve("bn256");
var generator = bn256.generator;
console.log(generator.getX().toString(10));
console.log(generator.getY().toString(10));
var doubled = generator.mul(bigInteger_1.toBI(2));
console.log(doubled.getX().toString(10));
console.log(doubled.getY().toString(10));
