const PublicParameters = artifacts.require("PublicParameters.sol");
const EfficientInnerProductVerifier = artifacts.require("EfficientInnerProductVerifier.sol");
const EthereumRangeProofVerifier = artifacts.require("MultiRangeProofVerifier.sol");
const util = require("util");

const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {MultiRangeProofProver} = require("../prover/multiRangeProof/multiRangeProofProver")
const {MultiRangeProofVerifier} = require("../prover/multiRangeProof/multiRangeProofVerifier")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {PeddersenCommitment} = require("../prover/commitments/peddersenCommitment")
const {GeneratorVector} = require("../prover/linearAlgebra/generatorVector")
const {ECCurve} = require("../prover/curve/curve")
const {ProofUtils} = require("../prover/util/proofUtil")
const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

const M = 64;
const N = 6;

contract('MultiRangeProofVerifier', async (accounts) => {
    return 

    var rangeProofVerifier;
    var publicParams;
    var ipVerifier;
    const operator = accounts[0]

    beforeEach(async () => {
        const group = new ECCurve("bn256");
        const parameters = GeneratorParams.generateParams(M, group);
        publicParams = await PublicParameters.new({from: operator})

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

        for (let i = 0; i < 1000; i++) {
            try{
                await publicParams.createGVector()
                await publicParams.createHVector()
            } catch(err) {
                break
            }
        }
        const lastG = await publicParams.lastGcreated();
        const lastH = await publicParams.lastGcreated();
        assert(lastG.toString() == "" + M);
        assert(lastH.toString() == "" + M);
        let vectorsRef = parameters.getVectorBase().getGs().getVector();
        for (let i = 0; i < M; i++) {
            const x = await publicParams.gVector(2*i)
            const y = await publicParams.gVector(2*i + 1)
            const v = vectorsRef[i];
            assert(x.cmp(v.getX()) === 0 && y.cmp(v.getY()) === 0, "Invalid G vector + " + i);
        }
        vectorsRef = parameters.getVectorBase().getHs().getVector();
        for (let i = 0; i < M; i++) {
            const x = await publicParams.hVector(2*i)
            const y = await publicParams.hVector(2*i + 1)
            const v = vectorsRef[i];
            assert(x.cmp(v.getX()) === 0 && y.cmp(v.getY()) === 0, "Invalid H vector + " + i);
        }

        console.log('Complete. Public parameters address: ' + publicParams.address);

        ipVerifier = await EfficientInnerProductVerifier.new(publicParams.address, {from: operator});

        console.log('Complete. Inner product proof verifier address: ' + ipVerifier.address);

        rangeProofVerifier = await EthereumRangeProofVerifier.new(publicParams.address, ipVerifier.address, {from: operator});

        console.log('Complete. Multi range proof verifier address: ' + rangeProofVerifier.address);
    })

    it('check single proof', async () => {
    const group = new ECCurve("bn256")
    const total = new BN(10);
    const number = new BN(7);
    const change = new BN(3);
    const extra = new BN(1);
    const zero = new BN(0);
    
    const q = group.order;
    console.log("Group order = " + q.toString(10) + "\n");
    const parameters = GeneratorParams.generateParams(M, group);
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

        // uint256[] commitments, // multiple of 2 items of Peddersen commitments
        // uint256[8] coords, // [A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        // uint256[5] scalars, // [tauX, mu, t, a, b]
        // uint256[2*n] ls_coords, // 2 * n
        // uint256[2*n] rs_coords  // 2 * n
        const comms = [];
        for (let i=0; i < commitments.getVector().length; i++) {
            comms.push(commitments.getVector()[i].getX())
            comms.push(commitments.getVector()[i].getY())
        }

        const coords = [];
        coords.push(proof.getaI().getX())
        coords.push(proof.getaI().getY())
        coords.push(proof.getS().getX())
        coords.push(proof.getS().getY())
        const tCommits = proof.gettCommits();
        coords.push(tCommits.get(0).getX())
        coords.push(tCommits.get(0).getY())
        coords.push(tCommits.get(1).getX())
        coords.push(tCommits.get(1).getY())
        const ls_coords = [];
        const rs_coords = [];
        for (let i=0; i < proof.getProductProof().getL().length; i++) {
            const L = proof.getProductProof().getL()[i];
            const R = proof.getProductProof().getR()[i];
            ls_coords.push(L.getX())
            ls_coords.push(L.getY())
            rs_coords.push(R.getX())
            rs_coords.push(R.getY())
        }
        const scalars = [proof.getTauX(), proof.getMu(), proof.getT(), proof.getProductProof().getA(), proof.getProductProof().getB()]
        const ethValid = await rangeProofVerifier.verify(comms, coords,
        scalars,
        ls_coords,
        rs_coords);

        // let allEvents = rangeProofVerifier.allEvents({fromBlock: ethValid.receipt.blockNumber, toBlock: ethValid.receipt.blockNumber});
        // let get = util.promisify(allEvents.get.bind(allEvents))
        // let evs = await get()
        // evs.map((v) => {
        //     console.log(v.args._i.toString(16));
        // })
        // // console.log(JSON.stringify(evs));
        // // console.log(evs[0].args._i.toString(16));
        // // console.log(evs[1].args._i.toString(16));
        // // console.log(evs[2].args._i.toString(16));
        // let allEvents2 = ipVerifier.allEvents({fromBlock: ethValid.receipt.blockNumber, toBlock: ethValid.receipt.blockNumber});
        // let get2 = util.promisify(allEvents2.get.bind(allEvents2))
        // let evs2 = await get2()
        // console.log("Inner proof");
        // // console.log(JSON.stringify(evs));
        // evs2.map((v) => {
        //     console.log(v.args._i.toString(16));
        // })
        // console.log("Ethereum proof is valid: " + ethValid + "\n");

        const ZERO = new BN(0);
        for (const arr of [coords, scalars, ls_coords, rs_coords]) {
            arr.map((v) => {
                assert(v.cmp(ZERO) >= 0, "One of the items is less than zero");
            })
        }
        const gasEstimate = await rangeProofVerifier.verify.estimateGas(comms, coords,
            scalars,
            ls_coords,
            rs_coords);

        console.log("Aggregated proof of " + M + " total bits gas estimate = " + gasEstimate)

        const ethValidCall = await rangeProofVerifier.verify.call(comms, coords,
            scalars,
            ls_coords,
            rs_coords);
        assert(ethValidCall, "Multi range proof verification failed for Ethereum network")
        console.log("Ethereum proof is valid: " + ethValidCall + "\n");
        
        const ethValidTX = await rangeProofVerifier.verify(comms, coords,
            scalars,
            ls_coords,
            rs_coords, {from: operator, gas: 20000000});

        ethValidTX.logs.map((el) => {
            console.log("A = " + el.args.a.toString(10));
            console.log("B = " + el.args.b.toString(10));
            console.log("C = " + el.args.c.toString(10));
        })
        // console.log(JSON.stringify(ethValidTX.logs));

    })
})
