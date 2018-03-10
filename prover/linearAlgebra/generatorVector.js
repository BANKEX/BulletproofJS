"use strict";
exports.__esModule = true;
var utils_1 = require("../elliptic/lib/elliptic/utils");
var GeneratorVector = /** @class */ (function () {
    function GeneratorVector(gs, curve) {
        this.gs = gs;
        this.curve = curve;
    }
    GeneratorVector.prototype.from = function (gs) {
        return new GeneratorVector(gs, this.curve);
    };
    GeneratorVector.prototype.subVector = function (start, end) {
        return this.from(this.gs.slice(start, end));
    };
    GeneratorVector.prototype.commit = function (exponents) {
        utils_1.assert(exponents.length === this.gs.length, "Commitment base and vector should have the same length");
        var accumulator = this.curve.zero;
        var res = this.gs.reduce(function (prev, current, index) {
            var newPoint = current.mul(exponents[index]);
            return prev.add(newPoint);
        }, accumulator);
        utils_1.assert(!res.isInfinity(), "Commitment resulted in infinity point");
        return res;
    };
    GeneratorVector.prototype.commitToFieldVector = function (vec) {
        var _this = this;
        var exponents = vec.getVector();
        utils_1.assert(exponents.length === this.gs.length, "Commitment base and vector should have the same length");
        var accumulator = this.curve.zero;
        var res = this.gs.reduce(function (prev, current, index) {
            var newPoint = current.mul(exponents[index].umod(_this.curve.order));
            return prev.add(newPoint);
        }, accumulator);
        utils_1.assert(!res.isInfinity(), "Commitment resulted in infinity point");
        return res;
    };
    GeneratorVector.prototype.sum = function () {
        var accumulator = this.curve.zero;
        return this.gs.reduce(function (prev, current, index) {
            return prev.add(current);
        }, accumulator);
    };
    GeneratorVector.prototype.hadamard = function (exponents) {
        var newVector = this.gs.map(function (current, index) {
            return current.mul(exponents[index]);
        });
        return new GeneratorVector(newVector, this.curve);
    };
    GeneratorVector.prototype.add = function (other) {
        var newVector = this.gs.map(function (current, index) {
            return current.add(other[index]);
        });
        return new GeneratorVector(newVector, this.curve);
    };
    GeneratorVector.prototype.addVector = function (other) {
        var oth = other.gs;
        return this.add(oth);
    };
    GeneratorVector.prototype.get = function (i) {
        return this.gs[i];
    };
    GeneratorVector.prototype.size = function () {
        return this.gs.length;
    };
    GeneratorVector.prototype.getVector = function () {
        return this.gs;
    };
    // @Override
    // public boolean equals(Object obj) {
    //     if (obj == null || !(obj instanceof GeneratorVector)) {
    //         return false;
    //     }
    //     GeneratorVector vector = (GeneratorVector) obj;
    //     return gs.equals(vector.gs);
    // }
    // @Override
    // public Iterator<T> iterator() {
    //     return gs.iterator();
    // }
    GeneratorVector.prototype.plus = function (other) {
        var newArray = [];
        for (var _i = 0, _a = this.gs; _i < _a.length; _i++) {
            var point = _a[_i];
            newArray.push(point);
        }
        newArray.push(other);
        return this.from(newArray);
    };
    GeneratorVector.prototype.getGroup = function () {
        return this.curve;
    };
    GeneratorVector.prototype.getCurve = function () {
        return this.curve;
    };
    return GeneratorVector;
}());
exports.GeneratorVector = GeneratorVector;
