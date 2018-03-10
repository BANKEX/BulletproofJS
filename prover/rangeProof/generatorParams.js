"use strict";
exports.__esModule = true;
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var peddersenBase_1 = require("../linearAlgebra/peddersenBase");
var buffer_1 = require("buffer");
var generatorVector_1 = require("../linearAlgebra/generatorVector");
var GeneratorParams = /** @class */ (function () {
    function GeneratorParams(vectorBase, base, group) {
        this.vectorBase = vectorBase;
        this.base = base;
        this.group = group;
    }
    GeneratorParams.prototype.getVectorBase = function () {
        return this.vectorBase;
    };
    GeneratorParams.prototype.getBase = function () {
        return this.base;
    };
    GeneratorParams.prototype.getGroup = function () {
        return this.group;
    };
    GeneratorParams.generateParams = function (size, group) {
        var gPoints = [];
        var hPoints = [];
        for (var i = 0; i < size; i++) {
            var gString = "G" + i;
            var gHash = group.hash(buffer_1.Buffer.from(gString, "utf8"));
            var g_1 = group.hashInto(gHash);
            gPoints.push(g_1);
            var hString = "H" + i;
            var hHash = group.hash(buffer_1.Buffer.from(hString, "utf8"));
            var h_1 = group.hashInto(hHash);
            hPoints.push(h_1);
        }
        var g = group.hashInto(group.hash(buffer_1.Buffer.from("G", "utf8")));
        var h = group.hashInto(group.hash(buffer_1.Buffer.from("H", "utf8")));
        var generatorVectorG = new generatorVector_1.GeneratorVector(gPoints, group);
        var generatorVectorH = new generatorVector_1.GeneratorVector(hPoints, group);
        var vectorBase = new vectorBase_1.VectorBase(generatorVectorG, generatorVectorH, h);
        var base = new peddersenBase_1.PeddersenBase(g, h, group);
        return new GeneratorParams(vectorBase, base, group);
    };
    return GeneratorParams;
}());
exports.GeneratorParams = GeneratorParams;
