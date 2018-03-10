"use strict";
exports.__esModule = true;
var buffer_1 = require("buffer");
var emptyBuffer = buffer_1.Buffer.alloc(0);
var InnerProductProof = /** @class */ (function () {
    function InnerProductProof(L, R, a, b) {
        this.L = L;
        this.R = R;
        this.a = a;
        this.b = b;
    }
    InnerProductProof.prototype.getL = function () {
        return this.L;
    };
    InnerProductProof.prototype.getR = function () {
        return this.R;
    };
    InnerProductProof.prototype.getA = function () {
        return this.a;
    };
    InnerProductProof.prototype.getB = function () {
        return this.b;
    };
    InnerProductProof.prototype.serialize = function () {
        var L_ser = buffer_1.Buffer.concat(this.L.map(function (el) { return el.serialize(true); }));
        var R_ser = buffer_1.Buffer.concat(this.R.map(function (el) { return el.serialize(true); }));
        var a_ser = this.a.toArrayLike(buffer_1.Buffer, "be", 32);
        var b_ser = this.b.toArrayLike(buffer_1.Buffer, "be", 32);
        return buffer_1.Buffer.concat([L_ser, R_ser, a_ser, b_ser]);
    };
    return InnerProductProof;
}());
exports.InnerProductProof = InnerProductProof;
