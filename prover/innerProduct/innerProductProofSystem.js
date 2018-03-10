"use strict";
exports.__esModule = true;
var buffer_1 = require("buffer");
var vectorBase_1 = require("../linearAlgebra/vectorBase");
var innerProductProver_1 = require("./innerProductProver");
var efficientInnerProductVerifier_1 = require("./efficientInnerProductVerifier");
var generatorVector_1 = require("../linearAlgebra/generatorVector");
var InnerProductProofSystem = /** @class */ (function () {
    function InnerProductProofSystem() {
    }
    InnerProductProofSystem.prototype.getProver = function () {
        return new innerProductProver_1.InnerProductProver();
    };
    InnerProductProofSystem.prototype.getVerifier = function () {
        return new efficientInnerProductVerifier_1.EfficientInnerProductVerifier();
    };
    InnerProductProofSystem.prototype.generatePublicParams = function (size, group) {
        var gPoints = [];
        var hPoints = [];
        for (var i = 0; i < size; i++) {
            var gString = "G" + i;
            var gHash = group.hash(buffer_1.Buffer.from(gString, "utf8"));
            var g = group.hashInto(gHash);
            gPoints.push(g);
            var hString = "H" + i;
            var hHash = group.hash(buffer_1.Buffer.from(hString, "utf8"));
            var h = group.hashInto(hHash);
            hPoints.push(h);
        }
        var gs = new generatorVector_1.GeneratorVector(gPoints, group);
        var hs = new generatorVector_1.GeneratorVector(hPoints, group);
        var hash = group.hash(buffer_1.Buffer.from("V", "utf8"));
        var v = group.hashInto(hash);
        //TODO: This setup has a trapdoor. Just use it for testing. The previous setup is secure.
        // GeneratorVector gs = GeneratorVector.from(VectorX.generate(size, ProofUtils::randomNumber).map(ECConstants.G::multiply));
        // GeneratorVector hs = GeneratorVector.from(VectorX.generate(size, ProofUtils::randomNumber).map(ECConstants.G::multiply));
        // ECPoint v=ECConstants.G.multiply(ProofUtils.randomNumber());
        return new vectorBase_1.VectorBase(gs, hs, v);
    };
    return InnerProductProofSystem;
}());
exports.InnerProductProofSystem = InnerProductProofSystem;
