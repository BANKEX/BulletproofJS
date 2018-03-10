"use strict";
exports.__esModule = true;
var generatorVector_1 = require("./generatorVector");
var PeddersenBase = /** @class */ (function () {
    function PeddersenBase(g, h, group) {
        var generator = new generatorVector_1.GeneratorVector([g, h], group);
        this.generator = generator;
        this.g = g;
        this.h = h;
    }
    PeddersenBase.prototype.commit = function (x, r) {
        return this.g.mul(x).add(this.h.mul(r));
    };
    return PeddersenBase;
}());
exports.PeddersenBase = PeddersenBase;
