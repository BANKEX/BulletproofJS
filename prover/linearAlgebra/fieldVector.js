"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var utils_1 = require("../elliptic/lib/elliptic/utils");
var FieldVector = /** @class */ (function () {
    function FieldVector(a, q) {
        // this.a = a.map((el) => {
        //     return el.toRed(this.red);
        // });
        this.a = a;
        this.q = q;
    }
    FieldVector.prototype.innerPoduct = function (other) {
        utils_1.assert(other.a.length === this.a.length);
        utils_1.assert(this.q.cmp(other.q) === 0);
        var accumulator = bigInteger_1.toBI(0, 10);
        var res = this.a.reduce(function (prev, next, index) {
            return prev.add(next.mul(other.a[index]));
        }, accumulator);
        return res.mod(this.q);
    };
    FieldVector.prototype.hadamard = function (other) {
        utils_1.assert(other.a.length === this.a.length);
        utils_1.assert(this.q.cmp(other.q) === 0);
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(other.a[i].mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.times = function (scalar) {
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(scalar.mul(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.addVector = function (other) {
        utils_1.assert(other.a.length === this.a.length);
        utils_1.assert(this.q.cmp(other.q) === 0);
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(other.a[i].add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.addScalar = function (scalar) {
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(scalar.add(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.subtractVector = function (other) {
        utils_1.assert(other.a.length === this.a.length);
        utils_1.assert(this.q.cmp(other.q) === 0);
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(other.a[i].sub(this.a[i]).mod(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.sum = function () {
        var accumulator = bigInteger_1.toBI(0, 10);
        for (var i = 0; i < this.a.length; i++) {
            accumulator.add(this.a[i]);
        }
        return accumulator;
    };
    FieldVector.prototype.invert = function () {
        var res = [];
        for (var i = 0; i < this.a.length; i++) {
            res.push(this.a[i].invm(this.q));
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.firstValue = function () {
        return this.a[0];
    };
    FieldVector.prototype.get = function (i) {
        return this.a[i];
    };
    FieldVector.prototype.size = function () {
        return this.a.length;
    };
    FieldVector.prototype.subVector = function (start, end) {
        var res = [];
        for (var i = start; i < end; i++) {
            res.push(this.a[i]);
        }
        return new FieldVector(res, this.q);
    };
    FieldVector.prototype.getVector = function () {
        return this.a;
    };
    FieldVector.pow = function (k, n, q) {
        var res = [];
        var element = bigInteger_1.toBI(1, 10);
        res.push(element);
        for (var i = 1; i < n; i++) {
            element = element.mul(k);
            res.push(element);
        }
        return new FieldVector(res, q);
    };
    FieldVector.prototype.equals = function (other) {
        if (this == other)
            return true;
        if (other == null)
            return false;
        if (other.a.length !== this.a.length || this.q.cmp(other.q) !== 0) {
            return false;
        }
        for (var i = 0; i < this.a.length; i++) {
            if (this.a[i].cmp(other.a[i]) !== 0) {
                return false;
            }
        }
        return true;
    };
    return FieldVector;
}());
exports.FieldVector = FieldVector;
