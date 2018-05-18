const PublicParameters = artifacts.require("PublicParameters.sol");
const EfficientInnerProductVerifier = artifacts.require("EfficientInnerProductVerifier.sol");
const EthereumRangeProofVerifier = artifacts.require("MultiRangeProofVerifier.sol");
const TokenProxy = artifacts.require("TokenProxy.sol");
const SchnorrVerifier = artifacts.require("SchnorrVerifier.sol");
const CoinMixer = artifacts.require("EfficientCoinMixer.sol");
const util = require("util");
const aesjs = require('aes-js');
const secureRandom = require("secure-random")
const BN = require("bn.js")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");
const {MultiRangeProofProver} = require("../prover/multiRangeProof/multiRangeProofProver")
const {MultiRangeProofVerifier} = require("../prover/multiRangeProof/multiRangeProofVerifier")
const {GeneratorParams} = require("../prover/rangeProof/generatorParams")
const {PeddersenCommitment} = require("../prover/commitments/peddersenCommitment")
const {ECCurve, ECPoint} = require("../prover/curve/curve")
const {ProofUtils} = require("../prover/util/proofUtil")
const {SchnorrSystem} = require("../prover/schnorrSignature/schnorrSystem")
const {SchnorrWitness} = require("../prover/schnorrSignature/schnorrWitness")
const {ECDHWitness} = require("../prover/ecdh/ecdhWitness");
const {ECDHProtocol} = require("../prover/ecdh/ecdhProtocol");
const {BIP32Deriver} = require("../prover/bip32/bip32Derivation");
const {GeneratorVector} = require("../prover/linearAlgebra/generatorVector");

const t = require('truffle-test-utils')
t.init()
// const expectThrow = require("../helpers/expectThrow");

const M = 64;
const N = 6;

contract('Protocol test', async (accounts) => {
    return

    var rangeProofVerifier;
    var publicParams;
    var ipVerifier;
    var schnorrVerifier;
    var tokenProxy;
    var coinMixer;
    const operator = accounts[0]
    const group = new ECCurve("bn256");
    const q = group.order;
    const parameters = GeneratorParams.generateParams(M, group);
    const signatureGenerator = group.generator;
    const Alice = SchnorrWitness.newKey(signatureGenerator)
    const Bob = SchnorrWitness.newKey(signatureGenerator)

    beforeEach(async () => {

        tokenProxy = await TokenProxy.new({from: operator})
        console.log('Proxy address: ' + tokenProxy.address);

        schnorrVerifier = await SchnorrVerifier.new({from: operator})
        console.log('Schnorr verifier address: ' + schnorrVerifier.address);

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

        console.log('Public parameters address: ' + publicParams.address);

        ipVerifier = await EfficientInnerProductVerifier.new(publicParams.address, {from: operator});

        console.log('Inner product proof verifier address: ' + ipVerifier.address);

        rangeProofVerifier = await EthereumRangeProofVerifier.new(publicParams.address, ipVerifier.address, {from: operator});
        for (let i = 0; i < 100; i++) {
            try{
                await rangeProofVerifier.producePowers()
            } catch(err) {
                break
            }
        }
        console.log('Multi range proof verifier address: ' + rangeProofVerifier.address);
        // address _schnorrVerifier,
        // address _publicParameters,
        // address _rangeProofVerifier,
        // address _tokenProxy
        coinMixer = await CoinMixer.new(schnorrVerifier.address, publicParams.address, rangeProofVerifier.address, tokenProxy.address, {from: operator})
        console.log('Coin mixer address: ' + coinMixer.address);
    })

    it('check single transfer', async () => {
        let data = secureRandom(32, {type: 'Buffer'});
        const index_0 = new BN(data, 16, "be");
        data = secureRandom(32, {type: 'Buffer'});
        const index_1 = new BN(data, 16, "be");
        const BobEphemeral = Bob;
        const AliceEphemeralDerived = BIP32Deriver.derivePrivate(Alice, index_0);
        const AliceEphemeral = AliceEphemeralDerived.newWitness;
        const derivedIndex = AliceEphemeralDerived.newIndex;
        const AliceEphemeralDerivedPublic = BIP32Deriver.derivePublic(Alice.getPublicKey(), signatureGenerator, index_0);
        const AliceEphemeralPublicKey = AliceEphemeralDerivedPublic.newPublicKey;
        const derivedAliceIndex = AliceEphemeralDerivedPublic.newIndex;
        const to_0_X = AliceEphemeralPublicKey.getX()
        const to_0_Y = AliceEphemeralPublicKey.getY()
        assert(derivedAliceIndex.cmp(derivedIndex) === 0, 'BIP32 failed');
        assert(AliceEphemeral.getPublicKey().equals(AliceEphemeralPublicKey), 'BIP32 failed');

        const bobsDepositInEth = new BN(10);
        const bobsBlinding = new BN(0);
        // const blinding = parameters.getBase().getH().mul(bobsBlinding)
        const TEN = new BN(10);
        const assetID = new BN(0);
        const value = bobsDepositInEth.mul(TEN.pow(new BN(18)));
        
        const depositGasEstimate = await coinMixer.deposit.estimateGas([assetID], [value], [BobEphemeral.getPublicKey().getX(), BobEphemeral.getPublicKey().getY()], {from: operator, value: value})
        console.log("Deposit requires " + depositGasEstimate + " gas")
        
        const depositResult = await coinMixer.deposit([assetID], [value], [BobEphemeral.getPublicKey().getX(), BobEphemeral.getPublicKey().getY()], {from: operator, value: value})
        let allEvents = coinMixer.allEvents({fromBlock: depositResult.receipt.blockNumber, toBlock: depositResult.receipt.blockNumber});
        let get = util.promisify(allEvents.get.bind(allEvents))
        let evs = await get()
        const bobsDeposit = new BN(evs[0].args._convertedAmount.toString(10), 10)
        let bobsDepositWitness = new PeddersenCommitment(parameters.getBase(), bobsDeposit, bobsBlinding);
        console.log("Asset ID is " + evs[0].args._assetID.toString(10));
        console.log("Converted value = " + evs[0].args._convertedAmount.toString(10));
        assert(evs[0].args._X.cmp(BobEphemeral.getPublicKey().getX()) == 0, "Invalid public key's X in event")
        assert(evs[0].args._Y.cmp(BobEphemeral.getPublicKey().getY()) == 0, "Invalid public key's Y in event")
        const from_X = evs[0].args._X
        const from_Y = evs[0].args._Y
        let output = await coinMixer.outputs([assetID], [from_X], [from_Y])
        const x = new BN(output[0].toString(16), 16)
        const y = new BN(output[1].toString(16), 16)

        const outputCommitment = group.pointFromCoordinates(x, y)
        assert(outputCommitment.equals(bobsDepositWitness.getCommitment()))
                                                
        let hashToSign = ethUtil.sha3(Buffer.concat([x.toArrayLike(Buffer, "be", 32), y.toArrayLike(Buffer, "be", 32)]));
        const system = new SchnorrSystem()
        const signer = system.getSigner()
        const verifier = system.getVerifier()
        const signature_ownership = signer.sign(hashToSign, BobEphemeral)
        const s_0 = signature_ownership.getS()
        const e_0 = signature_ownership.getE()

        let valid = await schnorrVerifier.verifySignature(
            ethUtil.bufferToHex(hashToSign),
            [s_0],
            [e_0],
            [signatureGenerator.getX(), signatureGenerator.getY()],
            [BobEphemeral.getPublicKey().getX(), BobEphemeral.getPublicKey().getY()]
        )

        const transferToAlice = new BN(42);
        const extra = new BN(1);
        const changeToBob = bobsDeposit.sub(transferToAlice).sub(extra);
        const zero = new BN(0);

        const witness = new PeddersenCommitment(parameters.getBase(), transferToAlice, ProofUtils.randomNumber());
        const witness_change = new PeddersenCommitment(parameters.getBase(), changeToBob, ProofUtils.randomNumber());
        const witness_extra = new PeddersenCommitment(parameters.getBase(), extra, ProofUtils.randomNumber());
        const witness_zero = new PeddersenCommitment(parameters.getBase(), zero, ProofUtils.randomNumber());
        const commitments = new GeneratorVector([witness.getCommitment(), witness_change.getCommitment(), witness_extra.getCommitment(), witness_zero.getCommitment()], group)
        const prover = new MultiRangeProofProver();
        const proof = prover.generateProof(parameters, commitments, [witness, witness_change, witness_extra, witness_zero]);
        const rangeVerifier = new MultiRangeProofVerifier();
        valid = rangeVerifier.verify(parameters, commitments, proof);
        console.log("For two proofs proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());
        console.log("Multi range proof is " + valid + "\n");

        const insMinusOuts = bobsDepositWitness.getCommitment()
                            .sub(witness.getCommitment())
                            .sub(witness_change.getCommitment())
                            .sub(witness_extra.getCommitment())
                            .sub(witness_zero.getCommitment());

        const h = parameters.getBase().getH();

        const publicKey = insMinusOuts;
        const privateKey = bobsDepositWitness.getR()
                        .sub(witness.getR())
                        .sub(witness_change.getR())
                        .sub(witness_extra.getR())
                        .sub(witness_zero.getR())
                        .umod(parameters.getGroup().order);

        assert(insMinusOuts.equals(parameters.getBase().getH().mul(privateKey)), "Sum of ins and outs to zero has diverged")

        const sumToZeroSchnorrWitness = new SchnorrWitness(privateKey, ProofUtils.randomNumber(), parameters.getBase().getH());
        const signature_sumToZero = signer.sign(ethUtil.sha3(publicKey.serialize(true)), sumToZeroSchnorrWitness);
        const s_1 = signature_sumToZero.getS()
        const e_1 = signature_sumToZero.getE()

        valid = await schnorrVerifier.verifySignature(
            ethUtil.bufferToHex(ethUtil.sha3(publicKey.serialize(true))),
            [s_1],
            [e_1],
            [parameters.getBase().getH().getX(), parameters.getBase().getH().getY()],
            [insMinusOuts.getX(), insMinusOuts.getY()]
        )

        assert(valid, "Failed to proof the form r*H")

        const BobEphemeralDerivedPublicForChange = BIP32Deriver.derivePublic(Alice.getPublicKey(), signatureGenerator, index_1);
        const BobsPublicKeyForChange = BobEphemeralDerivedPublicForChange.newPublicKey;
        const to_1_X = BobsPublicKeyForChange.getX()
        const to_1_Y = BobsPublicKeyForChange.getY()

        const ecdhWitnessBob = new ECDHWitness(BobEphemeral.getPrivateKey(), BobEphemeral.getGenerator())
        const trueAgreedKeyWithAlice = ECDHProtocol.getAgreedPoint(ecdhWitnessBob, AliceEphemeralPublicKey)

        const originalKey = trueAgreedKeyWithAlice.getX().toArrayLike(Buffer, "be", 32);
        const originalIV = trueAgreedKeyWithAlice.getY().toArrayLike(Buffer, "be", 32).slice(16, 32);
        const aesCtrEncryptor = new aesjs.ModeOfOperation.ctr(originalKey, originalIV);
        const dataToEncrypt = Buffer.concat([witness.getX().toArrayLike(Buffer, "be", 32), witness.getR().toArrayLike(Buffer, "be", 32)]);
        const encryptedBytes = Buffer.from(aesCtrEncryptor.encrypt(dataToEncrypt));

        const trueAgreedKey_change = ECDHProtocol.getAgreedPoint(ecdhWitnessBob, BobsPublicKeyForChange)

        const originalKey_change = trueAgreedKey_change.getX().toArrayLike(Buffer, "be", 32);
        const originalIV_change = trueAgreedKey_change.getY().toArrayLike(Buffer, "be", 32).slice(16, 32);
        const aesCtrEncryptor_change = new aesjs.ModeOfOperation.ctr(originalKey_change, originalIV_change);
        const dataToEncrypt_change = Buffer.concat([witness_change.getX().toArrayLike(Buffer, "be", 32), witness_change.getR().toArrayLike(Buffer, "be", 32)]);
        const encryptedBytes_change = Buffer.from(aesCtrEncryptor_change.encrypt(dataToEncrypt_change));

        const exchangeData = []
        exchangeData.push(ethUtil.bufferToHex(encryptedBytes.slice(0, 32)))
        exchangeData.push(ethUtil.bufferToHex(encryptedBytes.slice(32, 64)))
        exchangeData.push(ethUtil.bufferToHex(encryptedBytes_change.slice(0, 32)))
        exchangeData.push(ethUtil.bufferToHex(encryptedBytes_change.slice(32, 64)))
        exchangeData.push(ethUtil.bufferToHex(Buffer.alloc(32))); //dummy
        exchangeData.push(ethUtil.bufferToHex(Buffer.alloc(32)));
        exchangeData.push(ethUtil.bufferToHex(Buffer.alloc(32)));
        exchangeData.push(ethUtil.bufferToHex(Buffer.alloc(32)));

        const numInputs = new BN(1);
        const numOuts = new BN(4);

        const numOfInsAndOuts = [numInputs, numOuts];

        const conservationSignature = [s_1, e_1];
        const inputPublicKeys = [from_X, from_Y];
        const inputSignature = [s_0, e_0];

        const outputPublicKeys = [to_0_X, to_0_Y, to_1_X, to_1_Y];
        outputPublicKeys.push(new BN(2)); //dummies
        outputPublicKeys.push(new BN(2));
        outputPublicKeys.push(new BN(3));
        outputPublicKeys.push(new BN(3));

        const outputs = [];
        outputs.push(witness.getCommitment().getX())
        outputs.push(witness.getCommitment().getY())
        outputs.push(witness_change.getCommitment().getX())
        outputs.push(witness_change.getCommitment().getY())
        outputs.push(witness_extra.getCommitment().getX())
        outputs.push(witness_extra.getCommitment().getY())
        outputs.push(witness_zero.getCommitment().getX())
        outputs.push(witness_zero.getCommitment().getY())

        const outputIndexes = [];
        outputIndexes.push(index_0)
        outputIndexes.push(index_1);
        outputIndexes.push(new BN(3));
        outputIndexes.push(new BN(4));

        // range proof

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

        const scalars = [proof.getTauX(), proof.getMu(), proof.getT(), proof.getProductProof().getA(), proof.getProductProof().getB()];

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

        // uint256 _assetID,
        // uint256[2] _numOfInsAndOuts,
        // uint256[] _parametersArray, // total 2 + (2+2)*numIns + (2+2+1)*numOuts following the parameters listed below for each it or out
        // // uint256[2] output conservation signature, 
        // // uint256[2] input public keys, // [PubX, PubY]
        // // uint256[2] input signature,
        // // uint256[2] output public keys, 
        // // uint256[] output, // [outX, outY]
        // // uint256[] output index, // indexes of output public keys generated

        // bytes32[] _outputKeyExchangeData, // chunks of output encoded data
        
        // //range proofs
        // uint256[8] coords, // [A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        // uint256[5] scalars, // [tauX, mu, t, a, b]
        // uint256[2*n] ls_coords, // 2 * n
        // uint256[2*n] rs_coords  // 2 * n
        let parametersArray = [];
        parametersArray = parametersArray.concat(conservationSignature);
        for (let i = 0; i < 1; i++) {
            parametersArray.push(inputPublicKeys[2*i])
            parametersArray.push(inputPublicKeys[2*i + 1])
            parametersArray.push(inputSignature[2*i])
            parametersArray.push(inputSignature[2*i + 1])
        }
        for (let i = 0; i < 4; i++) {
            parametersArray.push(outputPublicKeys[2*i])
            parametersArray.push(outputPublicKeys[2*i + 1])
            parametersArray.push(outputs[2*i])
            parametersArray.push(outputs[2*i + 1])
            parametersArray.push(outputIndexes[i])
            
        }

        assert(parametersArray.length === 2 + 4*1 + 5*4, "Invalid number of parameters for transfer");
        assert(exchangeData.length == 2*4, "Invalid number of encrypted arrays");

        const gasEstimate = await coinMixer.transfer.estimateGas(
            [assetID],
            numOfInsAndOuts,
            parametersArray,
            exchangeData,
            coords,
            scalars,
            ls_coords,
            rs_coords,
            {from: operator})
            
        console.log("Aggregated transfer with " + M + " total bits to prove is " + gasEstimate + " gas")

        const transferResult = await coinMixer.transfer(
            [assetID],
            numOfInsAndOuts,
            parametersArray,
            exchangeData,
            coords,
            scalars,
            ls_coords,
            rs_coords,
            {from: operator})
        const allTransferEvents = coinMixer.allEvents({fromBlock: transferResult.receipt.blockNumber, toBlock: transferResult.receipt.blockNumber});
        // const allTransferEvents = rangeProofVerifier.allEvents({fromBlock: transferResult.receipt.blockNumber, toBlock: transferResult.receipt.blockNumber});
        const getAllTransferEvents = util.promisify(allTransferEvents.get.bind(allTransferEvents))
        const allTransferEventsResult = await getAllTransferEvents()
        // uint256[2+4+2+4+1] _scalars, // [from_X, from_Y, to_0_X, to_0_Y, to_1_X, to_1_Y, index_0, index_1, schnorr_0_S, schnorr_0_E, schnorr_1_S, schnorr_1_E, assetID]
        // bytes _exchangeData0,
        // bytes _exchangeData1,
        // //range proofs
        // uint256[20] coords, // [input_x, input_y, A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        // uint256[10] scalars, // [tauX, mu, t, a, b]
        // uint256[2*2*n] ls_coords, // 2 * n
        // uint256[2*2*n] rs_coords  // 2 * n


        // Alice does ECDH on her side, using her derived private key (index is public) and Bob's public key;
        const indexForAlice = new BN(allTransferEventsResult[0].args._index.toString(10))
        assert(indexForAlice.cmp(index_0) == 0, "Index mismatch after transfer")
        const aliceX = new BN(allTransferEventsResult[0].args._X.toString(10))
        const aliceY = new BN(allTransferEventsResult[0].args._Y.toString(10))
        assert(aliceX.cmp(AliceEphemeral.getPublicKey().getX()) == 0, "Alice's derivation mismatch")
        assert(aliceY.cmp(AliceEphemeral.getPublicKey().getY()) == 0, "Alice's derivation mismatch")

        const ecdhWitnessAlice = new ECDHWitness(AliceEphemeral.getPrivateKey(), AliceEphemeral.getGenerator())
        const trueAgreedKeyFromAlice = ECDHProtocol.getAgreedPoint(ecdhWitnessAlice, ecdhWitnessBob.getKey())
        const restoredKey = trueAgreedKeyFromAlice.getX().toArrayLike(Buffer, "be", 32);
        const restoredIV = trueAgreedKeyFromAlice.getY().toArrayLike(Buffer, "be", 32).slice(16,32);
        assert(restoredKey.equals(originalKey), "Failed to restore a key");
        const restoredEncreyptedBytes = Buffer.concat([ethUtil.toBuffer(allTransferEventsResult[0].args._dataX), ethUtil.toBuffer(allTransferEventsResult[0].args._dataR)]);
        assert(Buffer.from(encryptedBytes).equals(restoredEncreyptedBytes))
        const aesCtrDecryptor = new aesjs.ModeOfOperation.ctr(restoredKey, restoredIV);
        const decryptedBytes = new Buffer.from(aesCtrDecryptor.decrypt(encryptedBytes));
        assert(decryptedBytes.equals(dataToEncrypt), "Failed to decrypt");
        console.log("Succesfully decrypted");
        const transferedValue = new BN(decryptedBytes.slice(0, 32), 16, "be");
        const blindingFactor = new BN(decryptedBytes.slice(32, 64), 16, "be");
    
        assert(transferedValue.cmp(transferToAlice) === 0, "Did not restore a transfer value");
    
        const alicesOutput = witness.getCommitment().serialize(true);
        const restoredCommitment = new PeddersenCommitment(parameters.getBase(), transferedValue, blindingFactor);
        const restoredOutput = restoredCommitment.getCommitment().serialize(true);
        assert(alicesOutput.equals(restoredOutput), "Failed to restore an output");

        //function withdraw(uint256[2] _publicKey, uint256 _assetID, uint256 _value, uint256 _blinding)
        const withdrawGasEstimate = await coinMixer.withdraw.estimateGas([AliceEphemeralPublicKey.getX(), AliceEphemeralPublicKey.getY()], [assetID], [transferedValue], [blindingFactor], {from: operator});
        console.log("Withdraw requires " + withdrawGasEstimate + " gas")
        const withdrawResult = await coinMixer.withdraw([AliceEphemeralPublicKey.getX(), AliceEphemeralPublicKey.getY()], [assetID], [transferedValue], [blindingFactor], {from: operator});
        const allWithdrawEvents = coinMixer.allEvents({fromBlock: withdrawResult.receipt.blockNumber, toBlock: withdrawResult.receipt.blockNumber});
        const getAllWithdrawEvents = util.promisify(allWithdrawEvents.get.bind(allWithdrawEvents))
        const allWithdrawEventsResult = await getAllWithdrawEvents()
        
        console.log("Protocol is complete")
    })
})
