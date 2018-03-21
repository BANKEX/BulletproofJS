const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");

function testHashing() {
    const ONE = new BN(1)
    const hashOfOne = ethUtil.sha3(ONE);
    const oneSerialized = ONE.toBuffer("be");
    console.log("Serialization length of 1 is " + oneSerialized.length + " bytes")
    const hashOfSerialized = ethUtil.sha3(oneSerialized);
    assert(hashOfSerialized.equals(hashOfOne));
}

testHashing()