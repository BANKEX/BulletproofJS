const {InnerProductProofSystem} = require("../prover/innerProduct/innerProductProofSystem")
const {ECCurve} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const {FieldVector} = require("../prover/linearAlgebra/fieldVector")
const {InnerProductWitness} = require("../prover/innerProduct/innerProductWitness")
const {EfficientInnerProductVerifier} = require("../prover/innerProduct/efficientInnerProductVerifier")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {RangeProofProver} = require("../prover/rangeProof/rangeProofProver")
const {RangeProofVerifier} = require("../prover/rangeProof/rangeProofVerifier")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {PeddersenCommitment} = require("../prover/commitments/peddersenCommitment")

function testSoundness() {
    const group = new ECCurve("bn256")
    const total = new BN(10);
    const number = new BN(7);
    const change = new BN(3);
    // BigInteger randomness = ProofUtils.randomNumber();
    const randomness = new BN(123);
    const q = group.order;
    console.log("Group order = " + q.toString(10) + "\n");
    console.log("Secret 1 = " + randomness.toString(10) + "\n");
    console.log("Secret 2 = " + q.sub(randomness).toString(10) + "\n");
    const parameters = GeneratorParams.generateParams(64, group);
    // parameters.getVectorBase().getGs().getVector().map((v) => {
    //     console.log("gs = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    // parameters.getVectorBase().getHs().getVector().map((v) => {
    //     console.log("hs = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    // const g = [parameters.getBase().g]
    // g.map((v) => {
    //     console.log("g = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    // const h = [parameters.getBase().h]
    // h.map((v) => {
    //     console.log("h = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    const v = parameters.getBase().commit(number, randomness);
    // console.log("c = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    const v_change = parameters.getBase().commit(change, q.sub(randomness));
    // console.log("c = [0x"+v_change.getX().toString(16) + ", 0x"+v_change.getY().toString(16) + "]")
    const witness = new PeddersenCommitment(parameters.getBase(), number, randomness);
    const witness_change = new PeddersenCommitment(parameters.getBase(), change, q.sub(randomness));
    const prover = new RangeProofProver();
    const proof = prover.generateProof(parameters, v, witness);
    const proof_change = prover.generateProof(parameters, v_change, witness_change);
    const verifier = new RangeProofVerifier();
    console.log("For one proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());
    console.log("Amount\n");
    let valid = verifier.verify(parameters, v, proof);
    console.log("Proof is " + valid + "\n");
    console.log("Change\n");
    valid = verifier.verify(parameters, v_change, proof_change);
    console.log("Proof is " + valid + "\n");
}

testSoundness();