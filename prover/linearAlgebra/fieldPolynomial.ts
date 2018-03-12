import { BigInteger } from "../bigInteger/bigInteger";

export class FieldPolynomial {
    public coefficients: BigInteger[];


    constructor(coefficients: BigInteger[]) {
        this.coefficients = coefficients;
    }



    public getCoefficients(): BigInteger[] {
        return this.coefficients;
    }


}
