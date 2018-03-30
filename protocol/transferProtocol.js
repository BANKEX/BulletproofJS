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
const aesjs = require('aes-js');
const {ECDHWitness} = require("../prover/ecdh/ecdhWitness");
const {ECDHProtocol} = require("../prover/ecdh/ecdhProtocol");
const {BIP32Deriver} = require("../prover/bip32/bip32Derivation");
function transferProtocol() {
    const group = new ECCurve("bn256")
    const signatureGenerator = group.generator;
    const data = secureRandom(32, {type: 'Buffer'});
    const index = new BN(data, 16, "be");
    const Alice = SchnorrWitness.newKey(signatureGenerator)
    const Bob = SchnorrWitness.newKey(signatureGenerator)
    const q = group.order;
    const parameters = GeneratorParams.generateParams(64, group);

    const BobEphemeral = Bob;

    const AliceEphemeralDerived = BIP32Deriver.derivePrivate(Alice, index);
    const AliceEphemeral = AliceEphemeralDerived.newWitness;
    const derivedIndex = AliceEphemeralDerived.newIndex;
    const AliceEphemeralDerivedPublic = BIP32Deriver.derivePublic(Alice.getPublicKey(), signatureGenerator, index);
    const AliceEphemeralPublicKey = AliceEphemeralDerivedPublic.newPublicKey;
    const derivedAliceIndex = AliceEphemeralDerivedPublic.newIndex;
    assert(derivedAliceIndex.cmp(derivedIndex) === 0, 'BIP32 failed');
    assert(AliceEphemeral.getPublicKey().equals(AliceEphemeralPublicKey), 'BIP32 failed');
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

    // const ecdhWitnessAlice = new ECDHWitness(AliceEphemeral.getPrivateKey(), AliceEphemeral.getGenerator())
    // const ecdhWitnessBob = new ECDHWitness(BobEphemeral.getPrivateKey(), BobEphemeral.getGenerator())

    // const agreedKey = ECDHProtocol.getAgreedKey(ecdhWitnessAlice, ecdhWitnessBob.getKey());
    // const agreedKey2 = ECDHProtocol.getAgreedKey(ecdhWitnessBob, ecdhWitnessAlice.getKey());

    // assert(agreedKey.cmp(agreedKey2) === 0, "ECDH failed");
    // console.log("ECDH has completed");

    // const ephemeralECDHwitness = ECDHWitness.newKey(signatureGenerator);
    // const trueAgreedKey = ECDHProtocol.getAgreedKey(ephemeralECDHwitness, AliceEphemeralPublicKey)

    // Bob does ECDH on his side, using his private key and derived Alice's public key

    const ecdhWitnessBob = new ECDHWitness(BobEphemeral.getPrivateKey(), BobEphemeral.getGenerator())
    const trueAgreedKey = ECDHProtocol.getAgreedPoint(ecdhWitnessBob, AliceEphemeralPublicKey)

    const commitments = new GeneratorVector([witness.getCommitment(), witness_change.getCommitment()], group)
    const prover = new MultiRangeProofProver();
    const proof = prover.generateProof(parameters, commitments, [witness, witness_change]);
    const rangeProofVerifier = new MultiRangeProofVerifier();
    let valid = rangeProofVerifier.verify(parameters, commitments, proof);
    assert(valid, "Range proof is not valid");
    console.log("For two proofs proof size is: scalaras " + proof.numInts() + ", field elements " + proof.numElements());

    const originalKey = trueAgreedKey.getX().toArrayLike(Buffer, "be", 32);
    const originalIV = trueAgreedKey.getY().toArrayLike(Buffer, "be", 32).slice(16, 32);
    const aesCtrEncryptor = new aesjs.ModeOfOperation.ctr(originalKey, originalIV);
    const dataToEncrypt = Buffer.concat([witness.getX().toArrayLike(Buffer, "be", 32), witness.getR().toArrayLike(Buffer, "be", 32)]);
    const encryptedBytes = aesCtrEncryptor.encrypt(dataToEncrypt);
    console.log("Succesfully encrypted");

    // Alice does ECDH on her side, using her derived private key (index is public) and Bob's public key;
    
    const ecdhWitnessAlice = new ECDHWitness(AliceEphemeral.getPrivateKey(), AliceEphemeral.getGenerator())
    const trueAgreedKeyFromAlice = ECDHProtocol.getAgreedPoint(ecdhWitnessAlice, ecdhWitnessBob.getKey())
    const restoredKey = trueAgreedKeyFromAlice.getX().toArrayLike(Buffer, "be", 32);
    const restoredIV = trueAgreedKeyFromAlice.getY().toArrayLike(Buffer, "be", 32).slice(16,32);
    assert(restoredKey.equals(originalKey), "Failed to restore a key");
    
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
    console.log("Protocol is complete")

    console.log("Public parameters: Bob's public key, Alice's master public key, index of derivation (random number by Bob), aes encrypted text, aes CTR IV");
    console.log("Private parameters: Bob's private key, Alice's master private key");
}

transferProtocol();