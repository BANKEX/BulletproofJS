class PeddersenCommitment {
    constructor(base, x, r) {
        this.base = base;
        this.x = x;
        this.r = r;
        this.commitment = null;
    }
  
    getX() {
        return this.x;
    }

    getR() {
        return this.r;
    }

    getCommitment() {
        if (this.commitment == null) {
            this.commitment = this.base.commit(this.x, this.r);
        }
        return this.commitment;
    }
  }
 
  class CommitmentBase {
    constructor(G, H) {
        this.G = G;
        this.H = H;
    }
  
    commit(x, r) {
        return this.G.mul(x).add(this.H.mul(r));
    }
  }

  class PeddersenBase {
    constructor(g, h, group) {
        this.g = g;
        this.h = h;
        this.group = group;
    }
  
    commit(x, r) {
        return this.g.mul(x).add(this.h.mul(r));
    }
  }

  module.exports = {CommitmentBase, PeddersenCommitment, PeddersenBase}