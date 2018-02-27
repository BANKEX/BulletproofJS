const assert = require('assert');
const ethUtil = require('ethereumjs-util');
const BN = require('bignumber.js')

function hashToPoint(ec, inputBN){
    const data = ethUtil.setLengthLeft(ethUtil.toBuffer(inputBN),32);
    const h = ec.hash("BANKEXFOUNDATION", data);
    let x = new BN(h, 16);
    let valid = false;
    while (!valid) {
        try {
            const point = ec.curve.pointFromX(x);
            const valid = ec.curve.validate(point);
            assert(valid);
            return point;
        }
        catch(err) {
            x = x.add(1);
            continue
        }
    }
}

function hashRawToPoint(ec, hash){
    let x = new BN(hash, 16);
    let valid = false;
    while (!valid) {
        try {
            const point = ec.curve.pointFromX(x);
            const valid = ec.curve.validate(point);
            assert(valid);
            return point;
        }
        catch(err) {
            x = x.add(1);
            continue
        }
    }
}

function computeChallenge(q, points) {
    let full = Buffer.alloc(0);
    for (const point of points) {
        const x = point.getX();
        const y = point.getY();
        full.append(ethUtil.setLengthLeft(ethUtil.toBuffer(x), 32))
        full.append(ethUtil.setLengthLeft(ethUtil.toBuffer(y), 32))
    }
    const hash = ethUtil.sha3(full);
    return new BN(hash, 16).mod(q);
}

function computeChallenge(q, points) {
    let full = Buffer.alloc(0);
    for (const point of points) {
        const x = point.getX();
        const y = point.getY();
        full.append(ethUtil.setLengthLeft(ethUtil.toBuffer(x), 32))
        full.append(ethUtil.setLengthLeft(ethUtil.toBuffer(y), 32))
    }
    const hash = ethUtil.sha3(full);
    return new BN(hash, 16).mod(q);
}

function computeChallengeFromBigints(q, ints) {
    let full = Buffer.alloc(0);
    for (const int of ints) {
        full.append(ethUtil.setLengthLeft(ethUtil.toBuffer(int), 32))
    }
    const hash = ethUtil.sha3(full);
    return new BN(hash, 16).mod(q);
}

module.exports = {hashToPoint, hashRawToPoint, computeChallenge, computeChallengeFromBigints}