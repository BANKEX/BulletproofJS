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
        var pointRef = this.curveRef.curve.point(x, y);
        return new ECPoint(pointRef, this);
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
        var seed = new bigInteger_1.BNCLASS(input, 16, "be").umod(this.primeFieldSize);
        var ONE = bigInteger_1.toBI(1, 10);
        var ZERO = bigInteger_1.toBI(0, 10);
        var y;
        seed = seed.sub(ONE);
        do {
            seed = seed.add(ONE);
            var x = seed.toRed(this.curveRef.curve.red);
            var y2 = void 0;
            if (this.curveRef.curve.a.cmp(ZERO) == 0) {
                y2 = x.redSqr().redIMul(x).redIAdd(this.curveRef.curve.b);
            }
            else {
                y2 = x.redSqr().redIMul(x).redIAdd(x.redMul(this.curveRef.curve.a)).redIAdd(this.curveRef.curve.b);
            }
            // y = y2.redPow(this.primeFieldSize.add(ONE).div(toBI(4, 10)));
            y = y2.redSqrt();
            if (y.redSqr().cmp(y2) === 0) {
                break;
            }
            // if (y.redSqr().redSub(y2).cmp(ZERO) === 0) {
            //     break;
            // }
        } while (true);
        // y = y.fromRed();
        var point = this.curveRef.curve.point(seed, y);
        var ecpoint = new ECPoint(point, this);
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
    ECPoint.prototype.serialize = function (pad) {
        if (pad) {
            return buffer_1.Buffer.concat([this.getX().toArrayLike(buffer_1.Buffer, "be", 32), this.getY().toArrayLike(buffer_1.Buffer, "be", 32)]);
        }
        else {
            return buffer_1.Buffer.concat([this.getX().toArrayLike(buffer_1.Buffer, "be"), this.getY().toArrayLike(buffer_1.Buffer, "be")]);
        }
    };
    ECPoint.prototype.compress = function () {
        var X = this.getX().toArrayLike(buffer_1.Buffer, "be", 32);
        if (this.getY().isEven()) {
            return buffer_1.Buffer.concat([buffer_1.Buffer.from([0x02]), X]);
        }
        else {
            return buffer_1.Buffer.concat([buffer_1.Buffer.from([0x03]), X]);
        }
    };
    ECPoint.prototype.equals = function (other) {
        return this.getX().cmp(other.getX()) == 0 && this.getY().cmp(other.getY()) == 0;
    };
    return ECPoint;
}());
exports.ECPoint = ECPoint;
