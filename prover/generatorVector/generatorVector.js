"use strict";
exports.__esModule = true;
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
        var accumulator = this.curve.zero;
        return this.gs.reduce(function (prev, current, index) {
            return prev.add(current.mul(exponents[index]));
        }, accumulator);
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
    GeneratorVector.prototype.get = function (i) {
        return this.gs[i];
    };
    GeneratorVector.prototype.ize = function () {
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
    // public GeneratorVector<T> plus(T other) {
    //     return from(gs.plus(other));
    // }
    GeneratorVector.prototype.getCurve = function () {
        return this.curve;
    };
    return GeneratorVector;
}());
exports.GeneratorVector = GeneratorVector;
