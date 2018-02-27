"use strict";
exports.__esModule = true;
var bn_js_1 = require("bn.js");
var ZERO = new bn_js_1.BN(0);
var ONE = new bn_js_1.BN(1);
var TWO = new bn_js_1.BN(2);
function toBI(num) {
    return new bn_js_1.BN(num);
}
exports.toBI = toBI;
