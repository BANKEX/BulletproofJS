const {ECCurve, ECPoint} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {SchnorrSystem} = require("../prover/schnorrSignature/schnorrSystem")
const {SchnorrWitness} = require("../prover/schnorrSignature/schnorrWitness")

function testSoundness() {
    const group = new ECCurve("bn256")
    const data = secureRandom(128, {type: 'Buffer'});
    const signatureGenerator = group.generator;
    const witness = SchnorrWitness.newKey(signatureGenerator)
    const system = new SchnorrSystem()
    const signer = system.getSigner()
    const verifier = system.getVerifier()
    const signature = signer.sign(data, witness)
    const publicKey = witness.getPublicKey()
    const s = signature.getS()
    const e = signature.getE()
    const x_e = e.mul(witness.getPrivateKey())
    const kk = s.add(x_e)
    const k = witness.getRandomness()
    // console.log("E = " + e.toString(16))
    // console.log("S = " + s.toString(16))
    // console.log("X_E = " + x_e.toString(16))
    // console.log("KK = " + kk.toString(16))
    // console.log("k = " + s.toString(16))
    const result = verifier.verity(data, signature, publicKey)
    assert(result === true, "Soundness test failed")
    console.log("Schnorr signature result successful")
}

testSoundness();