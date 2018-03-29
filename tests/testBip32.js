const {ECCurve, ECPoint} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {SchnorrSystem} = require("../prover/schnorrSignature/schnorrSystem")
const {SchnorrWitness} = require("../prover/schnorrSignature/schnorrWitness")
const {BIP32Deriver} = require("../prover/bip32/bip32Derivation");

function testDerivation () {
    const group = new ECCurve("bn256")
    const data = secureRandom(32, {type: 'Buffer'});
    const index = new BN(data, 16, "be");
    const signatureGenerator = group.generator;
    const witness = SchnorrWitness.newKey(signatureGenerator);
    const oldPublicKey = witness.getPublicKey();

    const private = BIP32Deriver.derivePrivate(witness,index);
    const public = BIP32Deriver.derivePublic(oldPublicKey, signatureGenerator, index);

    assert(private.newIndex.cmp(public.newIndex) === 0, "index didn't match");
    assert(private.newWitness.getPublicKey().equals(public.newPublicKey), "public and private didn't match");
    console.log("Derivation works");

}

testDerivation()