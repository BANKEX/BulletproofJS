const BN = require('bignumber.js')
const ZERO = new BN(0);
const ONE = new BN(1);

class PolyCommitment {

    constructor(coefficientCommitments) {
        this.coefficientCommitments = coefficientCommitments;
    }


    evaluate(x) {
        let accumulator = ZERO;
        for (let i = 0; i < this.coefficientCommitments.length; i++) {
            const t = ONE.multiply(x);
            const c = t.
        }
        return VectorX.iterate(coefficientCommitments.size(), BigInteger.ONE, x::multiply).zip(coefficientCommitments, (xi, ci) -> ci.times(xi)).reduce(PeddersenCommitment::add).get();
    }

    public VectorX<PeddersenCommitment<T>> getCoefficientCommitments() {
        return coefficientCommitments;
    }

    public VectorX<T> getCommitments() {
        return coefficientCommitments.filterNot(pc -> pc.getR().equals(BigInteger.ZERO)).map(PeddersenCommitment::getCommitment);
    }

    public static <T extends GroupElement<T>> PolyCommitment<T> from(PeddersenBase<T> base, BigInteger x0, VectorX<BigInteger> xs) {
        VectorX<PeddersenCommitment<T>> peddersenCommitments = xs.map(x -> new PeddersenCommitment<>(base, x, ProofUtils.randomNumber())).prepend(new PeddersenCommitment<>(base, x0, BigInteger.ZERO)).materialize();
        return new PolyCommitment<>(peddersenCommitments);
    }
}