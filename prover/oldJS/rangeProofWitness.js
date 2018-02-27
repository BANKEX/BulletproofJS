class RangeProofWitness {
    constructor(number, randomness) {
        this.number = number;
        this.randomness = randomness;
    }

    getNumber() {
        return this.number;
    }

    getRandomness() {
        return this.randomness;
    }
}

module.exports = {RangeProofWitness}