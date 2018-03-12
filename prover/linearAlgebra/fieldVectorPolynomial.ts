import { FieldVector } from "./fieldVector";
import { BigInteger, toBI } from "../bigInteger/bigInteger";
import { FieldPolynomial } from "./fieldPolynomial";

export class FieldVectorPolynomial {
    public coefficients: FieldVector[];

    public constructor(coefficients: FieldVector[]) {
        this.coefficients = coefficients;
    }

    public evaluate(x: BigInteger): FieldVector {
        const intermediateFieldVectors =  this.coefficients
        .filter((element: FieldVector) => {return element != null})
        .map((vector: FieldVector, index: number) : [FieldVector, BigInteger] => {return [vector, toBI(index, 10)] as [FieldVector, BigInteger]})
        .map((tup): [FieldVector, BigInteger] => {
            return [tup[0], x.pow(tup[1])] as [FieldVector, BigInteger]
        })
        .map((tup) => {
            return tup[0].times(tup[1])
        });
        let res = intermediateFieldVectors[0];
        for (let i = 1; i < intermediateFieldVectors.length; i++) {
            res = res.addVector(intermediateFieldVectors[i]);
        }
        return res;
    }

    public innerProduct(other: FieldVectorPolynomial): FieldPolynomial {
        const ZERO = toBI(0, 10);
        const newCoefficients = [] as BigInteger[];
        for (let i = 0; i < this.coefficients.length + other.coefficients.length - 1; i++) {
            newCoefficients.push(ZERO);
        }
        for (let i = 0; i < this.coefficients.length; ++i) {
            const aCoefficient = this.coefficients[i];
            if (aCoefficient != null) {
                for (let j = 0; j < other.coefficients.length; ++j) {
                    const b = other.coefficients[j];
                    if (b != null) {
                        newCoefficients[i + j] = newCoefficients[i + j].add(aCoefficient.innerPoduct(b));
                    }

                }
            }
        }
        return new FieldPolynomial(newCoefficients);
    }
}
