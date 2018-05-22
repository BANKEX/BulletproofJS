const PublicParameters = artifacts.require("PublicParameters.sol");
const util = require("util");
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN;
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {ECCurve} = require("../prover/curve/curve")
const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

const M = 64;
const N = 6;
contract('PublicParameters', async (accounts) => {
    return
    
    var publicParams;

    const operator = accounts[0]

    beforeEach(async () => {
        console.log("Public parameters bytecode length = " + (PublicParameters.bytecode.length-2)/2);
        publicParams = await PublicParameters.new({from: operator})
    })

    it('do setup', async () => {
        const group = new ECCurve("bn256")
        const parameters = GeneratorParams.generateParams(256, group);

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

        const gasEstimateForVector = await publicParams.getGVector.estimateGas();
        console.log("Gas estimate to read set of " + M + " of Gs = " + gasEstimateForVector);
    })
})
