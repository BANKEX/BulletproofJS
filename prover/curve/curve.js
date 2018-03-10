"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var elliptic_1 = require("../elliptic");
var buffer_1 = require("buffer");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var ethereumjs_util_1 = require("ethereumjs-util");
// import Buffer
var EC = elliptic_1.ec;
var CURVE = elliptic_1.curve.base;
var POINT = CURVE.BasePoint;
var ZERO = bigInteger_1.toBI(0, 10);
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
        return ethereumjs_util_1.sha3(input);
    };
    ECCurve.prototype.hashToBigInteger = function (input) {
        var buff = ethereumjs_util_1.sha3(input);
        var bn = new bigInteger_1.BNCLASS(buff, 16, "be");
        return bn;
    };
    ECCurve.prototype.validate = function (point) {
        return this.curveRef.curve.validate(point.pointRef);
    };
    ECCurve.prototype.hashInto = function (input) {
        // valid only for short curves
        // const hex = input.toString("hex")
        // let seed = toBI(hex, 16).mod(this.primeFieldSize);
        var seed = new bigInteger_1.BNCLASS(input, 16, "be").umod(this.primeFieldSize);
        var ONE = bigInteger_1.toBI(1, 10);
        var ZERO = bigInteger_1.toBI(0, 10);
        seed = seed.sub(ONE);
        var i = 1;
        var point;
        do {
            try {
                seed = seed.add(ONE);
                point = this.curveRef.curve.pointFromX(seed, true);
                break;
            }
            catch (error) {
            }
            i++;
        } while (true);
        console.log(i);
        var ecpoint = new ECPoint(point, this);
        console.log("[0x" + ecpoint.getX().toString(16) + ", 0x" + ecpoint.getY().toString(16) + "]");
        return ecpoint;
    };
    return ECCurve;
}());
exports.ECCurve = ECCurve;
var ECPoint = /** @class */ (function () {
    function ECPoint(p, curve) {
        this.pointRef = p;
        this.curve = curve;
        utils_1.assert(curve.curveRef.curve.validate(p));
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
    ECPoint.prototype.serialize = function () {
        return buffer_1.Buffer.concat([this.getX().toArrayLike(buffer_1.Buffer, "be", 32), this.getY().toArrayLike(buffer_1.Buffer, "be", 32)]);
    };
    ECPoint.prototype.equals = function (other) {
        return this.getX().cmp(other.getX()) == 0 && this.getY().cmp(other.getY()) == 0;
    };
    return ECPoint;
}());
exports.ECPoint = ECPoint;
