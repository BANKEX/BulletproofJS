import { PeddersenCommitment } from "../commitments/peddersenCommitment";

export class MultiRangeProofWitness {
    public commitments: PeddersenCommitment[];

    public constructor(commitments: PeddersenCommitment[]) {

        this.commitments = commitments;
    }
    public getCommitments() {
        return this.commitments;
    }
}
