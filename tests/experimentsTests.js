const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {ECCurve} = require("../prover/curve/curve")

function testHashing() {
    const ONE = new BN(1)
    const hashOfOne = ethUtil.sha3(ONE);
    const oneSerialized = ONE.toBuffer("be");
    console.log("Serialization length of 1 is " + oneSerialized.length + " bytes")
    const hashOfSerialized = ethUtil.sha3(oneSerialized);
    assert(hashOfSerialized.equals(hashOfOne));
}

function getPublicParams() {
    const group = new ECCurve("bn256")
    const parameters = GeneratorParams.generateParams(4, group);
    parameters.getVectorBase().getGs().getVector().map((v) => {
        console.log("gs = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    parameters.getVectorBase().getHs().getVector().map((v) => {
        console.log("hs = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    const g = [parameters.getBase().g]
    g.map((v) => {
        console.log("g = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    const h = [parameters.getBase().h]
    h.map((v) => {
        console.log("h = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
}

testHashing()
getPublicParams()