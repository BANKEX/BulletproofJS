pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./alt_bn128.sol";
import {Conversion} from "./Conversion.sol";

contract GasTester {
    using alt_bn128 for alt_bn128.G1Point;
    using alt_bn128 for uint256;
    using alt_bn128 for uint256[2];
    using Conversion for uint256;

    uint256 public ECADDPrice;
    uint256 public ECMULPrice;
    uint256 public MODINVPrice;
    uint256 public pointGenPrice;

    constructor() public {

    }

    function testECADD() public returns (uint256 gasUsage) {
        alt_bn128.G1Point memory point = alt_bn128.G1Point(1,2);
        gasUsage = gasleft();
        point = point.add(point);
        gasUsage -= gasleft();
        ECADDPrice = gasUsage;
        return gasUsage;
    }

    // function testECADD() public returns (uint256 gasUsage) {
    //     uint256[2] memory point = [uint256(1),uint256(2)];
    //     gasUsage = gasleft();
    //     point = point.add(point);
    //     gasUsage -= gasleft();
    //     ECADDPrice = gasUsage;
    //     return gasUsage;
    // }

    function testECMUL() public returns (uint256 gasUsage) {
        alt_bn128.G1Point memory point = alt_bn128.G1Point(1, 2);
        gasUsage = gasleft();
        point = point.mul(uint256(100));
        gasUsage -= gasleft();
        ECMULPrice = gasUsage;
        return gasUsage;
    }

    // function testECMUL() public returns (uint256 gasUsage) {
    //     uint256[2] memory point = [uint256(1),uint256(2)];
    //     gasUsage = gasleft();
    //     point = point.mul(uint256(100));
    //     gasUsage -= gasleft();
    //     ECMULPrice = gasUsage;
    //     return gasUsage;
    // }

    function testMODINV() public returns (uint256 gasUsage) {
        uint256 num = uint256(100);
        gasUsage = gasleft();
        num = num.inv();
        gasUsage -= gasleft();
        MODINVPrice = gasUsage;
        return gasUsage;
    }

    // function testPointGen() public returns(uint256 gasUsage) {
    //     uint256 index = 1;
    //     bytes32 h = keccak256("G", index.uintToBytes());
    //     gasUsage = gasleft();
    //     alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(h));
    //     gasUsage -= gasleft();
    //     pointGenPrice = gasUsage;
    //     return gasUsage;
    // }

    function testPointGen() public returns(uint256 gasUsage) {
        gasUsage = gasleft();
        alt_bn128.G1Point memory g1p = alt_bn128.uintToCurvePoint(uint256(0));
        gasUsage -= gasleft();
        pointGenPrice = gasUsage;
        return gasUsage;
    }
}