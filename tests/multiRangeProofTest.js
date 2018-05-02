const {InnerProductProofSystem} = require("../prover/innerProduct/innerProductProofSystem")
const {ECCurve} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const {FieldVector} = require("../prover/linearAlgebra/fieldVector")
const {InnerProductWitness} = require("../prover/innerProduct/innerProductWitness")
const {EfficientInnerProductVerifier} = require("../prover/innerProduct/efficientInnerProductVerifier")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {MultiRangeProofProver} = require("../prover/multiRangeProof/multiRangeProofProver")
const {MultiRangeProofVerifier} = require("../prover/multiRangeProof/multiRangeProofVerifier")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {PeddersenCommitment} = require("../prover/commitments/peddersenCommitment")
const {GeneratorVector} = require("../prover/linearAlgebra/generatorVector")
const {ProofUtils} = require("../prover/util/proofUtil")

function testSoundness() {
    const group = new ECCurve("bn256")
    const total = new BN(10);
    const number = new BN(7);
    const change = new BN(3);
    const extra = new BN(1);
    const zero = new BN(0);
    const q = group.order;
    console.log("Group order = " + q.toString(10) + "\n");
    const parameters = GeneratorParams.generateParams(256, group);
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
    const witness = new PeddersenCommitment(parameters.getBase(), number, ProofUtils.randomNumber());
    const witness_change = new PeddersenCommitment(parameters.getBase(), change, ProofUtils.randomNumber());
    const witness_extra = new PeddersenCommitment(parameters.getBase(), extra, ProofUtils.randomNumber());
    const witness_zero = new PeddersenCommitment(parameters.getBase(), zero, ProofUtils.randomNumber());
    const commitments = new GeneratorVector([witness.getCommitment(), witness_change.getCommitment(), witness_extra.getCommitment(), witness_zero.getCommitment()], group)
    const prover = new MultiRangeProofProver();
    const proof = prover.generateProof(parameters, commitments, [witness, witness_change, witness_extra, witness_zero]);
    const verifier = new MultiRangeProofVerifier();
    let valid = verifier.verify(parameters, commitments, proof);
    console.log("For two proofs proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());
    console.log("Multi range proof is " + valid + "\n");
}

testSoundness();