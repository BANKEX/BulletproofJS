const SchnorrVerifier = artifacts.require("SchnorrVerifier.sol");
const util = require("util");

const {ECCurve, ECPoint} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {SchnorrSystem} = require("../prover/schnorrSignature/schnorrSystem")
const {SchnorrWitness} = require("../prover/schnorrSignature/schnorrWitness")
const {ProofUtils} = require("../prover/util/proofUtil")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

const M = 16;
const N = 4;

contract('SchnorrVerifier', async (accounts) => {
    return 
    
    var schnorrVerifier;
    const operator = accounts[0]

    beforeEach(async () => {
        schnorrVerifier = await SchnorrVerifier.new({from: operator})
    })

    it('check single signature', async () => {
        const group = new ECCurve("bn256")
        const parameters = GeneratorParams.generateParams(M, group);
        let data = secureRandom(128, {type: 'Buffer'});
        data = ethUtil.sha3(data);
        const signatureGenerator = group.generator;
        const witness = SchnorrWitness.newKey(signatureGenerator)
        const system = new SchnorrSystem()
        const signer = system.getSigner()
        const verifier = system.getVerifier()
        const signature = signer.sign(data, witness)
        const publicKey = witness.getPublicKey()
        const s = signature.getS()
        const e = signature.getE()
        const result = verifier.verity(data, signature, publicKey)
        assert(result === true, "Local test failed")
            // bytes32 _hash,
            // uint256 _s,
            // uint256 _e,
            // uint256[2] _generator,
            // uint256[2] _publicKey
        const valid = await schnorrVerifier.verifySignature(
            ethUtil.bufferToHex(data),
            [s],
            [e],
            [signatureGenerator.getX(), signatureGenerator.getY()],
            [publicKey.getX(), publicKey.getY()]
        )
        assert(valid === true, "Ethereum test failed")
        console.log("Schnorr signature result successful")
    })
})
