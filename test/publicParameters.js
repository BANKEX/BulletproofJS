const PublicParameters = artifacts.require("PublicParameters.sol");
const util = require("util");
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN;
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {ECCurve} = require("../prover/curve/curve")
const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

contract('PublicParameters', async (accounts) => {

    var publicParams;

    const operator = accounts[0]

    beforeEach(async () => {
        publicParams = await PublicParameters.new({from: operator})
    })

    it('test hashing', async () => {
        let i;
        try {
            for (i = 0; i < 256; i++) {
                const res = await publicParams.testToString(i);
                const buffer = ethUtil.toBuffer(res);
                const string = buffer.toString("ascii");
                const ref = i.toString();
                if (string != ref) {
                    console.log("String is " + string);
                    console.log("Ref is " + ref);
                    throw "Error";
                }
                assert(string == ref);
            }
        } catch(err) {
            console.log("I = "+ i)
            console.log(err);
            throw "Failed"
        }
        const g0h = await publicParams.testHashAsBytes(0);
        assert(ethUtil.sha3("G0").equals(ethUtil.toBuffer(g0h)));
        try {
            for (i = 0; i < 256; i++) {
                const gString = "G"+i;
                const gHash = ethUtil.sha3(Buffer.from(gString, "utf8"))
                const gH = await publicParams.testHashAsBytes(i);
                const hBuffer = ethUtil.toBuffer(gH);
                if (!hBuffer.equals(gHash)) {
                    console.log("Hashing error");
                    console.log("I = " + i);
                    throw "Error";
                }
                assert(hBuffer.equals(gHash));
            }
        } catch(err) {
            console.log(err);
            throw "Failed"
        }
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

        for (let i = 0; i < 32; i++) {
            try{
                const res = await publicParams.createGVector()
            } catch(err) {
                console.log("G")
                console.log("i = " + i);
                console.log(err)
            }
        }
        for (let i = 0; i < 32; i++) {
            try{
                const res = await publicParams.createHVector()
            } catch(err) {
                console.log("H")
                console.log("i = " + i);
                console.log(err)
            }
        }

        let vectorsRef = parameters.getVectorBase().getGs().getVector();
        for (let i = 0; i < 256; i++) {
            try{
                // const p = await publicParams.getGVectorComponent(i);
                // const x = p[0];
                // const y = p[1];
                const x = await publicParams.gVector(2*i)
                const y = await publicParams.gVector(2*i + 1)
                const v = vectorsRef[i];
                if (x.cmp(v.getX()) !== 0 || y.cmp(v.getY()) !== 0) {
                    console.log("G vector")
                    console.log("Ref x = " + v.getX().toString(16));
                    console.log("Ref y = " + v.getY().toString(16));
                    console.log("Created x = " + x.toString(16));
                    console.log("Created y = " + y.toString(16));
                    throw Error("Reference is different from created one");
                }
            } catch(err) {
                console.log("G vector")
                console.log("i = " + i);
                console.log(err)
            }
        }
        vectorsRef = parameters.getVectorBase().getHs().getVector();
        for (let i = 0; i < 256; i++) {
            try{
                const x = await publicParams.hVector(2*i)
                const y = await publicParams.hVector(2*i + 1)
                const v = vectorsRef[i];
                if (x.cmp(v.getX()) !== 0 || y.cmp(v.getY()) !== 0) {
                    console.log("H vector")
                    console.log("Ref x = " + v.getX().toString(16));
                    console.log("Ref y = " + v.getY().toString(16));
                    console.log("Created x = " + x.toString(16));
                    console.log("Created y = " + y.toString(16));
                    throw Error("Reference is different from created one");
                }
            } catch(err) {
                console.log("H vector")
                console.log("i = " + i);
                console.log(err)
            }
        }
        
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
        // let lastBlockNumber = await storage.lastBlockNumber()
        // assert(lastBlockNumber.toString() == "0");
        // const submissionReceipt = await plasma.submitBlockHeaders(blockOne);
        // lastBlockNumber = await storage.lastBlockNumber();
        // assert(lastBlockNumber.toString() == "1");
        // // web3.evm.mine()
        // let allEvents = storage.allEvents({fromBlock: submissionReceipt.receipt.blockNumber, toBlock: submissionReceipt.receipt.blockNumber});
        // let get = util.promisify(allEvents.get.bind(allEvents))
        // let evs = await get()
        // assert.web3Event({logs: evs}, {
        //     event: 'BlockHeaderSubmitted',
        //     args: {_blockNumber: 1,
        //          _merkleRoot: "0xdf8a6ee70de2e83987ac7aaba2a92e0161a799706944e123da2babb8c9dc659d"}
        // }, 'The event is emitted');
    })
})
