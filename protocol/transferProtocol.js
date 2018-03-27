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
const {SchnorrSystem} = require("../prover/schnorrSignature/schnorrSystem")
const {SchnorrWitness} = require("../prover/schnorrSignature/schnorrWitness")

function transferProtocol() {
    const group = new ECCurve("bn256")
    const data = secureRandom(128, {type: 'Buffer'});
    const signatureGenerator = group.generator;
    const Alice = SchnorrWitness.newKey(signatureGenerator)
    const Bob = SchnorrWitness.newKey(signatureGenerator)
    const q = group.order;
    const parameters = GeneratorParams.generateParams(256, group);

    const AliceEphemeral = Alice;
    const BobEphemeral = Bob; //for now

    const bobsDeposit = new BN(100);
    const bobsBlinding = ProofUtils.randomNumber();
    const bobsDepositWitness = new PeddersenCommitment(parameters.getBase(), bobsDeposit, bobsBlinding);
    const transferToAlice = new BN(42);
    const changeToBob = bobsDeposit.sub(transferToAlice);

    const witness = new PeddersenCommitment(parameters.getBase(), transferToAlice, ProofUtils.randomNumber());
    const witness_change = new PeddersenCommitment(parameters.getBase(), changeToBob, ProofUtils.randomNumber());

    const insMinusOuts = bobsDepositWitness.getCommitment().sub(witness.getCommitment()).sub(witness_change.getCommitment());
    const h = parameters.getBase().getH();

    const publicKey = insMinusOuts;
    const privateKey = bobsDepositWitness.getR().sub(witness.getR()).sub(witness_change.getR());
    // const proofOfSumsToZero = 

    const system = new SchnorrSystem()
    const signer = system.getSigner()
    const verifier = system.getVerifier()
    const schnorrWitness = new SchnorrWitness(privateKey, ProofUtils.randomNumber(), h);
    const signature = signer.sign(publicKey.serialize(true), schnorrWitness);
    const result = verifier.verity(publicKey.serialize(true), signature, publicKey)
    assert(result, "Failed to provide a proof of sum to zero");
    console.log("Proved sum to zero");
    // const commitments = new GeneratorVector([witness.getCommitment(), witness_change.getCommitment()], group)
    // const prover = new MultiRangeProofProver();
    // const proof = prover.generateProof(parameters, commitments, [witness, witness_change]);
    // const verifier = new MultiRangeProofVerifier();
    // let valid = verifier.verify(parameters, commitments, proof);
    // console.log("For two proofs proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());
    // console.log("Multi range proof is " + valid + "\n");
    
}

transferProtocol();