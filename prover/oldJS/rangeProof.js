class RangeProof {

    constructor(aI, s, tCommits, tauX, mu, t, productProof) {
        this.aI = aI;
        this.s = s;
        this.tCommits = tCommits;
        this.tauX = tauX;
        this.mu = mu;
        this.t = t;
        this.productProof = productProof;
    }

    getaI() {
        return this.aI;
    }

    getS() {
        return this.s;
    }


    getTauX() {
        return this.tauX;
    }

    getMu() {
        return this.mu;
    }

    getT() {
        return this.t;
    }

    getProductProof() {
        return this.productProof;
    }

    gettCommits() {
        return this.tCommits;
    }

    // @Override
    // public byte[] serialize() {
    //     List<byte[]> byteArrs = new ArrayList<>();
    //     byteArrs.add(productProof.serialize());
    //     byteArrs.add(aI.canonicalRepresentation());
    //     byteArrs.add(s.canonicalRepresentation());
    //     tCommits.stream().map(GroupElement::canonicalRepresentation).forEach(byteArrs::add);
    //     BigInteger q = tCommits.getGroup().groupOrder();
    //     byteArrs.add(tauX.mod(q).toByteArray());
    //     byteArrs.add(mu.mod(q).toByteArray());
    //     byteArrs.add(t.mod(q).toByteArray());

    //     int totalBytes = byteArrs.stream().mapToInt(arr -> arr.length).sum();
    //     byte[] fullArray = new byte[totalBytes];
    //     int currIndex = 0;
    //     for (byte[] arr2 : byteArrs) {
    //         System.arraycopy(arr2, 0, fullArray, currIndex, arr2.length);
    //         currIndex += arr2.length;
    //     }
    //     return fullArray;
    // }
    numInts(){
        return 5;
    }
    numElements(){
        return 2 + tCommits.size()+productProof.getL().size()+productProof.getR().size();
    }
}

module.exports = {RangeProof}