const {InnerProductProofSystem} = require("../prover/innerProduct/innerProductProofSystem")
const {ECCurve} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const {FieldVector} = require("../prover/linearAlgebra/fieldVector")
const {InnerProductWitness} = require("../prover/innerProduct/innerProductWitness")
const {EfficientInnerProductVerifier} = require("../prover/innerProduct/efficientInnerProductVerifier")
const ethUtil = require("ethereumjs-util");
const assert = require("assert");

function testCompletness()  {
    const curve = new ECCurve("bn256");
    const system = new InnerProductProofSystem();
    const systemSize = 16;
    const logSystemSize = 4;
    const parameters = system.generatePublicParams(systemSize, curve);
    const verifier = system.getVerifier();
    const random = 12345
    let As = []
    let Bs = []
    for (let i = 0; i < 16; i++) {
        // let r1 = new BN(i, 10).mod(curve.order).mod(new BN(systemSize, 10))
        // let r2 = new BN(i, 10).mod(curve.order).mod(new BN(systemSize, 10))
        let r1 = new BN(secureRandom(2).toString("hex"), 16).mod(curve.order).mod(new BN(systemSize, 10))
        let r2 = new BN(secureRandom(2).toString("hex"), 16).mod(curve.order).mod(new BN(systemSize, 10))
        As.push(r1)
        Bs.push(r2)
    }
    const As_field = new FieldVector(As, curve.order)
    const Bs_field = new FieldVector(Bs, curve.order)
    const c = As_field.innerPoduct(Bs_field);
    const vTot = parameters.commitToTwoVectors(As_field.getVector(), Bs_field.getVector(), As_field.innerPoduct(Bs_field));
    // console.log(vTot.getX().toString(16));
    const witness = new InnerProductWitness(As_field, Bs_field);
    const prover = system.getProver();
    // console.log(c.toString(10));
    const proof = prover.generateProofFromWitness(parameters, vTot, witness);
    assert(proof.getL().length === logSystemSize);
    // const L = proof.getL();
    // L.map((v) => {
    //     console.log("c = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    // const R = proof.getR();
    // R.map((v) => {
    //     console.log("c = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    // })
    // console.log(proof.getA().toString(10));
    // console.log(proof.getB().toString(10));
    const result = verifier.verify(parameters, vTot, proof);
    assert(result, "Inner product proof should have matched");
    console.log("Efficient inner product verifier test passed")
}

function testBN256() {
    const ONE = new BN(1);
    const TWO = new BN(2);
    const system = new InnerProductProofSystem();
    const group = new ECCurve("bn256");
    const base = system.generatePublicParams(256, group);
    console.log("Gs")
    base.getGs().getVector().map((v) => {
        console.log("[0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    console.log("Hs")
    base.getHs().getVector().map((v) => {
        console.log("[0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    console.log("H = 0x" + base.getH().getX().toString(16) + ", 0x" + base.getH().getY().toString(16) + "]")
    const as = FieldVector.pow(TWO, 256, group.order);
    const bs = FieldVector.pow(ONE, 256, group.order);
    const witness = new InnerProductWitness(as, bs);
    const innerProduct = as.innerPoduct(bs)
    console.log("Inner product = " + innerProduct.toString(16))
    const pointA = base.getGs().commit(as.getVector())
    console.log("A = [0x"+pointA.getX().toString(16) + ", 0x"+pointA.getY().toString(16) + "]")
    const pointB = base.getHs().commit(bs.getVector())
    console.log("B = [0x"+pointB.getX().toString(16) + ", 0x"+pointB.getY().toString(16) + "]")
    const pointC = pointA.add(pointB).add(base.getH().mul(innerProduct));
    console.log("C = [0x"+pointC.getX().toString(16) + ", 0x"+pointC.getY().toString(16) + "]")
    const point = base.commitToTwoVectors(as.getVector(), bs.getVector(), as.innerPoduct(bs));
    console.log("c = [0x"+point.getX().toString(16) + ", 0x"+point.getY().toString(16) + "]")
    const prover = system.getProver();
    const productProof = prover.generateProofFromWitness(base, point, witness);
    console.log(productProof.getL().length);
    productProof.getL().map((v) => {
        console.log("c = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    productProof.getR().map((v) => {
        console.log("c = [0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    console.log(productProof.getA().toString(16));
    console.log(productProof.getB().toString(16));
    console.log("Proof system generated successfully")
    // System.out.println(pe.normalize());
    // System.out.println(pe.normalize().negate());
}
// testBN256();
testCompletness();