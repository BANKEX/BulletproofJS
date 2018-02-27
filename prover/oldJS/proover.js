const assert = require('assert');
const ethUtil = require('ethereumjs-util');
const {hashToPoint} = require("./utils");
const {CommitmentBase, PedersenCommitment} = require("./peddersenCommitment");

const BN = ethUtil.BN;
const EC = require('./elliptic').ec;
const ec = new EC('bn256');


const G = ec.g;
const H = hashToPoint(ec, new BN(1));

const base = new CommitmentBase(G, H);

const testX = new BN(1000);
const testR = new BN(12345);
const commitment = new PedersenCommitment(base, testX, testR);

const C = commitment.getCommitment();

console.log(C);
