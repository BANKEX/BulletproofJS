const assert = require('assert');

class VectorBase{
    constructor (gs, hs, h) {
        this.gs = gs;
        this.hs = hs;
        this.h = h;
    }

    commitGs(gExp, blinding) {
        assert(gExp.length == this.gs.length);
        let accumulator = null;
        for (let i = 0; i < this.gs; i++) {
            if (accumulator === null) {
                accumulator = this.gs[i].mul(gExp[i]);
            } else {
                accumulator = accumulator.add(this.gs[i].mul(gExp[i]));
            }
        }
        return accumulator.add(h.multiply(blinding));

    }

    commitGsAndHs(gExp, hExp, blinding) {
        let precommit = this.commitGs(gExp, blinding);
        for (let i = 0; i < this.gs; i++) {
            accumulator = accumulator.add(this.hs[i].mul(hExp[i]));
        }
        return accumulator;

    }

    getGs() {
        return this.gs;
    }

    getHs() {
        return this.hs;
    }

    getH() {
        return this.h;
    }

}

module.exports = {VectorBase}