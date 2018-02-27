const {hashRawToPoint} = require("./utils");
const {PeddersenBase} = require("./peddersenCommitment");
class GeneratorParams {

    constructor(vectorBase, base, group) {
        this.vectorBase = vectorBase;
        this.base = base;
        this.group = group;
    }

    getVectorBase() {
        return this.vectorBase;
    }

    getBase() {
        return this.base;
    }

    getGroup() {
        return this.group;
    }

}

GeneratorParams.prototype.generateParams = function (size, group) {
    const range = Array.from({length: size}, (x,i) => i);
    const gs = range.map((el) => {
        return "G"+i
    })
    .map((el) => {
        return group.hash(el)
    })
    .map((el) => {
        return hashRawToPoint(group, el);
    });
    const hs = range.map((el) => {
        return "H"+i
    })
    .map((el) => {
        return group.hash(el)
    })
    .map((el) => {
        return hashRawToPoint(group, el);
    });
    const g = hashRawToPoint(group, group.hash("G"));
    const h = hashRawToPoint(group, group.hash("H"));
    const base = new PeddersenBase(g,h,group);
    const vectorBase = new VectorBase(new GeneratorVector(gs, group), new GeneratorVector(hs, group), h);
    return new GeneratorParams(vectorBase, base, group);
}