import { VectorBase } from "../linearAlgebra/vectorBase";
import { PeddersenBase } from "../linearAlgebra/peddersenBase";
import { ECCurve, ECPoint } from "../curve/curve";
import {Buffer} from "buffer"
import {sha3} from "ethereumjs-util"
import {ProofUtils} from "../util/proofUtil";
import { assert } from "../elliptic/lib/elliptic/utils";
import { GeneratorVector } from "../linearAlgebra/generatorVector";

export class GeneratorParams {
    public vectorBase: VectorBase;
    public base: PeddersenBase;
    public group: ECCurve;

    constructor(vectorBase: VectorBase, base: PeddersenBase, group: ECCurve) {
        this.vectorBase = vectorBase;
        this.base = base;
        this.group = group;
    }

    public getVectorBase(): VectorBase {
        return this.vectorBase;
    }

    public getBase(): PeddersenBase {
        return this.base;
    }

    public getGroup(): ECCurve {
        return this.group;
    }

    public static generateParams(size: number, group: ECCurve): GeneratorParams {
        const gPoints = [] as ECPoint[]
        const hPoints = [] as ECPoint[]
        for (let i = 0; i < size; i++) {
            const gString = "G"+i
            const gHash = group.hash(Buffer.from(gString, "utf8"))
            const g = group.hashInto(gHash)
            gPoints.push(g)
            let hString = "H"+i
            const hHash = group.hash(Buffer.from(hString, "utf8"))
            const h = group.hashInto(hHash)
            hPoints.push(h)
        }
        const g = group.hashInto(group.hash(Buffer.from("G", "utf8")));
        const h = group.hashInto(group.hash(Buffer.from("H", "utf8")));
        const generatorVectorG = new GeneratorVector(gPoints, group)
        const generatorVectorH = new GeneratorVector(hPoints, group)
        const vectorBase = new VectorBase(generatorVectorG, generatorVectorH, h);
        const base = new PeddersenBase(g, h, group);
        return new GeneratorParams(vectorBase, base, group);

    }
}
