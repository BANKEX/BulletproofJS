const PublicParameters = artifacts.require("PublicParameters.sol");
const EfficientInnerProductVerifier = artifacts.require("EfficientInnerProductVerifier.sol");
const EthereumRangeProofVerifier = artifacts.require("RangeProofVerifier.sol");
const util = require("util");

const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {RangeProofProver} = require("../prover/rangeProof/rangeProofProver")
const {RangeProofVerifier} = require("../prover/rangeProof/rangeProofVerifier")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {PeddersenCommitment} = require("../prover/commitments/peddersenCommitment")
const {ECCurve} = require("../prover/curve/curve")
const {ProofUtils} = require("../prover/util/proofUtil")
const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

const M = 64;
const N = 6;

contract('RangeProofVerifier', async (accounts) => {

    var rangeProofVerifier;
    var publicParams;
    const operator = accounts[0]

    beforeEach(async () => {
        const group = new ECCurve("bn256");
        const parameters = GeneratorParams.generateParams(M, group);
        // const p = await PublicParameters.deployed();
        // const i = await EfficientInnerProductVerifier.deployed();
        // const r = await RangeProofVerifier.deployed();
        publicParams = await PublicParameters.new({from: operator})
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await publicParams.createGVector()
            } catch(err) {
                console.log("G")
                console.log("i = " + i);
                console.log(err)
            }
        }
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await publicParams.createHVector()
            } catch(err) {
                console.log("H")
                console.log("i = " + i);
                console.log(err)
            }
        }
        console.log('Complete. Public parameters address: ' + publicParams.address);

        const ipVerifier = await EfficientInnerProductVerifier.new(publicParams.address, {from: operator});

        console.log('Complete. Inner product proof verifier address: ' + ipVerifier.address);

        rangeProofVerifier = await EthereumRangeProofVerifier.new(publicParams.address, ipVerifier.address, {from: operator});
        for (let i = 0; i < M/8; i++) {
            try{
                const res = await rangeProofVerifier.producePowers()
            } catch(err) {
                console.log("Error producing powers")
                console.log("i = " + i);
                console.log(err)
            }
        }
        const g = parameters.getBase().g;
        const h = parameters.getBase().h;
        const g_x = await publicParams.baseG(0);
        const g_y = await publicParams.baseG(1);
        const h_x = await publicParams.baseH(0);
        const h_y = await publicParams.baseH(1);
        assert(g_x.cmp(g.getX()) === 0, "Failed at G_X")
        assert(g_y.cmp(g.getY()) === 0, "Failed at G_Y")
        assert(h_x.cmp(h.getX()) === 0, "Failed at H_X")
        assert(h_y.cmp(h.getY()) === 0, "Failed at H_Y")
    })

    it('check single proof', async () => {
        const group = new ECCurve("bn256")
        const number = new BN(7);
        const randomness = ProofUtils.randomNumber();
        const q = group.order;
        const parameters = GeneratorParams.generateParams(M, group);
        const v = parameters.getBase().commit(number, randomness);
        const witness = new PeddersenCommitment(parameters.getBase(), number, randomness);
        const prover = new RangeProofProver();
        const proof = prover.generateProof(parameters, v, witness);

        
        const verifier = new RangeProofVerifier();
        console.log("For one proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());
        console.log("Amount\n");
        const valid = verifier.verify(parameters, v, proof);
        console.log("Proof is valid: " + valid + "\n");
    })
})
