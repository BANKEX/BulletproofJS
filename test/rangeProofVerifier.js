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
    // return

    var rangeProofVerifier;
    var publicParams;
    var ipVerifier;
    const operator = accounts[0]

    beforeEach(async () => {
        const group = new ECCurve("bn256");
        const parameters = GeneratorParams.generateParams(M, group);
        // const p = await PublicParameters.deployed();
        // const i = await EfficientInnerProductVerifier.deployed();
        // const r = await RangeProofVerifier.deployed();
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
        // for (let i = 0; i < 100; i++) {
        //     try{
        //         await rangeProofVerifier.producePowers()
        //     } catch(err) {
        //         break
        //     }
        // }
        // const lastTwo = await rangeProofVerifier.lastPowerCreated();
        // assert(lastTwo.toString() == "" + M, "Failed to create powers");

        // const TWO = new BN(2);
        // for (let i = 0; i < M; i++) {
        //     const p = await rangeProofVerifier.twos(i)
        //     const I = new BN(i);
        //     const expe = TWO.pow(I).umod(group.primeFieldSize);
        //     assert(p.cmp(expe) === 0, "Created power is invalid")
        // }
        console.log('Complete. Range proof verifier address: ' + rangeProofVerifier.address);
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

        const valid = verifier.verify(parameters, v, proof);
        console.log("Proof is valid: " + valid + "\n");

        // uint256[10] coords, // [input_x, input_y, A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        // uint256[5] scalars, // [tauX, mu, t, a, b]
        // uint256[2*n] ls_coords, // 2 * n
        // uint256[2*n] rs_coords  // 2 * n

        const coords = [];
        coords.push(v.getX()) //commitment itself
        coords.push(v.getY())
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
        const ethValid = await rangeProofVerifier.verify(coords,
        scalars,
        ls_coords,
        rs_coords);
        const ZERO = new BN(0);
        for (const arr of [coords, scalars, ls_coords, rs_coords]) {
            arr.map((v) => {
                assert(v.cmp(ZERO) >= 0, "One of the items is less than zero");
            })
        }
        const gasEstimate = await rangeProofVerifier.verify.estimateGas(coords,
            scalars,
            ls_coords,
            rs_coords);

        console.log("Single proof for " + M + " bits gas estimate = " + gasEstimate)

        const ethValidCall = await rangeProofVerifier.verify.call(coords,
            scalars,
            ls_coords,
            rs_coords);
        assert(ethValidCall, "Range proof verification failed for Ethereum network")
        console.log("Ethereum proof is valid: " + ethValidCall + "\n");
        // let allEvents = rangeProofVerifier.allEvents({fromBlock: ethValid.receipt.blockNumber, toBlock: ethValid.receipt.blockNumber});
        // let get = util.promisify(allEvents.get.bind(allEvents))
        // let evs = await get()
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
        const ethValidTX = await rangeProofVerifier.verify(coords,
            scalars,
            ls_coords,
            rs_coords, {gas: 20000000});
        ethValidTX.logs.map((el) => {
            console.log("A = " + el.args.a.toString(10));
            console.log("B = " + el.args.b.toString(10));
            console.log("C = " + el.args.c.toString(10));
        })
    })
})
