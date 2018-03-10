"use strict";
exports.__esModule = true;
var buffer_1 = require("buffer");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var InnerProductWitness = /** @class */ (function () {
    function InnerProductWitness(a, b) {
        this.a = a;
        this.b = b;
    }
    InnerProductWitness.prototype.getA = function () {
        return this.a;
    };
    InnerProductWitness.prototype.getB = function () {
        return this.b;
    };
    return InnerProductWitness;
}());
exports.InnerProductWitness = InnerProductWitness;
