"use strict";
exports.__esModule = true;
var bigInteger_1 = require("../bigInteger/bigInteger");
var fieldPolynomial_1 = require("./fieldPolynomial");
var FieldVectorPolynomial = /** @class */ (function () {
    function FieldVectorPolynomial(coefficients) {
        this.coefficients = coefficients;
    }
    FieldVectorPolynomial.prototype.evaluate = function (x) {
        var intermediateFieldVectors = this.coefficients
            .filter(function (element) { return element != null; })
            .map(function (vector, index) { return [vector, bigInteger_1.toBI(index, 10)]; })
            .map(function (tup) {
            return [tup[0], x.pow(tup[1])];
        })
            .map(function (tup) {
            return tup[0].times(tup[1]);
        });
        var res = intermediateFieldVectors[0];
        for (var i = 1; i < intermediateFieldVectors.length; i++) {
            res = res.addVector(intermediateFieldVectors[i]);
        }
        return res;
    };
    FieldVectorPolynomial.prototype.innerProduct = function (other) {
        var ZERO = bigInteger_1.toBI(0, 10);
        var newCoefficients = [];
        for (var i = 0; i < this.coefficients.length + other.coefficients.length - 1; i++) {
            newCoefficients.push(ZERO);
        }
        for (var i = 0; i < this.coefficients.length; ++i) {
            var aCoefficient = this.coefficients[i];
            if (aCoefficient != null) {
                for (var j = 0; j < other.coefficients.length; ++j) {
                    var b = other.coefficients[j];
                    if (b != null) {
                        newCoefficients[i + j] = newCoefficients[i + j].add(aCoefficient.innerPoduct(b));
                    }
                }
            }
        }
        return new fieldPolynomial_1.FieldPolynomial(newCoefficients);
    };
    return FieldVectorPolynomial;
}());
exports.FieldVectorPolynomial = FieldVectorPolynomial;
