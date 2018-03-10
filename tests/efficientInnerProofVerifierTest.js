const {InnerProductProofSystem} = require("../prover/innerProduct/innerProductProofSystem")
const {ECCurve} = require("../prover/curve/curve")
const secureRandom = require("secure-random")
const BN = require("bn.js")
const {FieldVector} = require("../prover/linearAlgebra/fieldVector")
const {InnerProductWitness} = require("../prover/innerProduct/innerProductWitness")
const {EfficientInnerProductVerifier} = require("../prover/innerProduct/efficientInnerProductVerifier")
const ethUtil = require("ethereumjs-util");

function testCompletness()  {
    const curve = new ECCurve("bn256");
    const system = new InnerProductProofSystem();
    const systemSize = 16;
    const logSystemSize = 4;
    const parameters = system.generatePublicParams(systemSize, curve);
    const verifier = system.getVerifier();
    const random = 12345
    let as = []
    let bs = []
    for (let i = 0; i < 16; i++) {
        let r1 = new BN(secureRandom(2).toString("hex"), 16).mod(curve.order).mod(new BN(systemSize-1, 10))
        let r2 = new BN(secureRandom(2).toString("hex"), 16).mod(curve.order).mod(new BN(systemSize-1, 10))
        as.push(r1)
        bs.push(r2)
    }
    as = new FieldVector(as, curve.order)
    bs = new FieldVector(bs, curve.order)
    const c = as.innerPoduct(bs);
    const vTot = parameters.commitToTwoVectors(as, bs, c);
    console.log(vTot.serialize().toString("hex"))
    const witness = new InnerProductWitness(as, bs);
    const prover = system.getProver();
    console.log(as);
    console.log(bs);
    console.log(c);
    const proof = prover.generateProofFromWitness(parameters, vTot, witness);
    const result = verifier.verify(parameters, vTot, proof);
    console.log(result)
}

function testBN256() {
    const ONE = new BN(1);
    const TWO = new BN(2);
    const system = new InnerProductProofSystem();
    const group = new ECCurve("bn256");
    const base = system.generatePublicParams(256, group);
    base.getGs().getVector().map((v) => {
        console.log("[0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    base.getHs().getVector().map((v) => {
        console.log("[0x"+v.getX().toString(16) + ", 0x"+v.getY().toString(16) + "]")
    })
    // const firstByte = ethUtil.sha3("V")[0]
    // const vHash = new BN(ethUtil.sha3("V"), 2, "be");
    // const javaNum = new BN("213ed37d4cae01d0252d8962f6ab0859f781aebc5a33886759d44788f93c735a", 16)
    // const prime = new BN("30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47", 16)
    console.log("H = 0x" + base.getH().getX().toString(16) + ", 0x" + base.getH().getY().toString(16) + "]")
    const as = FieldVector.pow(TWO, 256, group.order);
    as.getVector().map((v) => {
        console.log("["+v.toString(10)+"]")
    })
    const bs = FieldVector.pow(ONE, 256, group.order);
    bs.getVector().map((v) => {
        console.log("["+v.toString(10)+"]")
    })
    const g = group.generator
    const dbl = g.add(g);
    console.log("c = [0x"+dbl.getX().toString(16) + ", 0x"+dbl.getY().toString(16) + "]")
    const witness = new InnerProductWitness(as, bs);
    const innerProduct = as.innerPoduct(bs)
    console.log(innerProduct.toString(16))
    const pointA = base.getGs().commit(as.getVector())
    console.log("c = [0x"+pointA.getX().toString(16) + ", 0x"+pointA.getY().toString(16) + "]")
    const point = base.commitToTwoVectors(as, bs, as.innerPoduct(bs));
    console.log("c = [0x"+point.getX().toString(16) + ", 0x"+point.getY().toString(16) + "]")
    const prover = system.getProver();
    const productProof = prover.generateProofFromWitness(base, point, witness);
    console.log(productProof.getL().length);
    // String lstring = "[" + productProof.getL().stream().map(BouncyCastleECPoint::getPoint).map(ECPoint::normalize).map(p -> "0x"+ p.getXCoord() + " , 0x" + p.getYCoord() ).collect(Collectors.joining(",")) + "]";
    // System.out.println(lstring);
    console.log(productProof.getA().toString(16));
    console.log(productProof.getB().toString(16));
    // System.out.println(pe.normalize());
    // System.out.println(pe.normalize().negate());
}
testBN256();
// testCompletness();