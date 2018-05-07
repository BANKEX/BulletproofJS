pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;
import "./RangeProofVerifier.sol";
import "./alt_bn128.sol";
import "./TokenProxy.sol";
import "./SchnorrVerifier.sol";

contract CoinMixer {
    using alt_bn128 for alt_bn128.G1Point;
    using alt_bn128 for uint256;

    mapping(uint256 => mapping (uint256 => mapping (uint256 => alt_bn128.G1Point) ) ) public outputs;
    event Deposit(uint256 indexed _X, uint256 indexed _Y, uint256 indexed _assetID, uint256 _convertedAmount);
    event Transfer(uint256 indexed _index, uint256 indexed _X, uint256 indexed _Y, uint256 _assetID, bytes _data);
    event Withdraw(address indexed _address, uint256 indexed _assetID, uint256 _amount);
    event Merge(uint256 indexed _assetID, uint256 indexed _publicKey0_X, uint256 _publicKey0_Y, uint256 indexed _publicKey1_X, uint256 _publicKey1_Y, uint256 _newPublicKey_X, uint256 _newPublicKey_Y);

    SchnorrVerifier public schnorrVerifier;
    PublicParameters public publicParameters;
    RangeProofVerifier public rangeProofVerifier;
    TokenProxy public tokenProxy;

    uint256 public constant m = 64;
    uint256 public constant n = 6;

    function CoinMixer(
        address _schnorrVerifier,
        address _publicParameters,
        address _rangeProofVerifier,
        address _tokenProxy
    ) public {
        require(_schnorrVerifier != address(0));
        require(_publicParameters != address(0));
        require(_rangeProofVerifier != address(0));
        require(_tokenProxy != address(0));
        schnorrVerifier = SchnorrVerifier(_schnorrVerifier);
        publicParameters = PublicParameters(_publicParameters);
        rangeProofVerifier = RangeProofVerifier(_rangeProofVerifier);
        tokenProxy = TokenProxy(_tokenProxy);
        require(m == publicParameters.m());
        require(n == publicParameters.n());
        require(m == rangeProofVerifier.m());
        require(n == rangeProofVerifier.n());
    }

    function deposit(uint256 _assetID, uint256 _value, uint256[2] _publicKey) public payable returns (bool) {
        require(_assetID == 0 || msg.value == 0);
        require(outputs[_assetID][_publicKey[0]][_publicKey[1]].eq(alt_bn128.G1Point(0, 0)));
        if (_assetID != 0) {
            address tokenAddress;
            bool isAuthorized;
            (tokenAddress, isAuthorized) = tokenProxy.getTokenInfo(_assetID);
            require(isAuthorized);
            ERC20Token token = ERC20Token(tokenAddress);
            require(token.transferFrom(msg.sender, this, _value));
        }
        uint256 convertedValue = tokenProxy.convertFromDeposit(_value, _assetID);
        require(convertedValue < 2**m);
        alt_bn128.G1Point memory output = publicParameters.G().mul(convertedValue);
        outputs[_assetID][_publicKey[0]][_publicKey[1]] = output;
        emit Deposit(_publicKey[0], _publicKey[1], _assetID, convertedValue);
        return true;
    }


    function transfer(
        uint256[2+4+2+4+1] _scalars, // [from_X, from_Y, to_0_X, to_0_Y, to_1_X, to_1_Y, index_0, index_1, schnorr_0_S, schnorr_0_E, schnorr_1_S, schnorr_1_E, assetID]
        bytes _exchangeData0,
        bytes _exchangeData1,
        //range proofs
        uint256[20] coords, // [input_x, input_y, A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        uint256[10] scalars, // [tauX, mu, t, a, b]
        uint256[2*2*n] ls_coords, // 2 * n
        uint256[2*2*n] rs_coords  // 2 * n
    ) public returns (bool success) {
        alt_bn128.G1Point[] memory reusablePoints = new alt_bn128.G1Point[](3);
        reusablePoints[0] = outputs[_scalars[12]][_scalars[0]][_scalars[1]]; // old output
        bytes32 hashToVerify = keccak256(reusablePoints[0].X, reusablePoints[0].Y);
        reusablePoints[1] = publicParameters.generator(); //signature generator
        reusablePoints[2] = alt_bn128.G1Point(_scalars[0], _scalars[1]); //public key associated with an output
        require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _scalars[8], _scalars[9], reusablePoints[1], reusablePoints[2]));

        require(verifyRangeProofForSplits(coords, scalars, ls_coords, rs_coords));
        reusablePoints[1] = alt_bn128.G1Point(coords[0], coords[1]); // commitment to output 0
        reusablePoints[2] = alt_bn128.G1Point(coords[10], coords[11]); // commitment to output 1
        reusablePoints[0] = reusablePoints[0].add(reusablePoints[1].neg()).add(reusablePoints[2].neg()); // should be in a form r*H
        hashToVerify = keccak256(reusablePoints[0].X, reusablePoints[0].Y);
        require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _scalars[10], _scalars[11], publicParameters.H(), reusablePoints[0]));
        outputs[_scalars[12]][_scalars[2]][_scalars[3]] = reusablePoints[1];
        emit Transfer(_scalars[6], _scalars[2], _scalars[3], _scalars[12], _exchangeData0);

        outputs[_scalars[12]][_scalars[4]][_scalars[5]] = reusablePoints[2];
        emit Transfer(_scalars[7], _scalars[4], _scalars[5], _scalars[12], _exchangeData1);

        delete outputs[_scalars[12]][_scalars[0]][_scalars[1]];
        return true;
    }

    function merge(
        uint256 _assetID, uint256[2] _publicKey0, uint256[2] _publicKey1,
        uint256[2] _signature0,
        uint256[2] _signature1,
        uint256[2] _newPublicKey) public returns (bool success) {
        alt_bn128.G1Point[] memory reusablePoints = new alt_bn128.G1Point[](3);

        reusablePoints[0] = outputs[_assetID][_publicKey0[0]][_publicKey0[1]]; // old output 0
        bytes32 hashToVerify = keccak256(reusablePoints[0].X, reusablePoints[0].Y);
        reusablePoints[1] = alt_bn128.G1Point(_publicKey0[0], _publicKey0[1]); //public key associated with an output
        require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _signature0[0], _signature0[1], publicParameters.generator(), reusablePoints[1]));

        reusablePoints[2] = outputs[_assetID][_publicKey1[0]][_publicKey1[1]]; // old output 0
        hashToVerify = keccak256(reusablePoints[2].X, reusablePoints[2].Y);
        reusablePoints[1] = alt_bn128.G1Point(_publicKey1[0], _publicKey1[1]); //public key associated with an output
        require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _signature1[0], _signature1[1], publicParameters.generator(), reusablePoints[1]));

        delete outputs[_assetID][_publicKey0[0]][_publicKey0[1]]; 
        delete outputs[_assetID][_publicKey1[0]][_publicKey1[1]];
        reusablePoints[1] = reusablePoints[0].add(reusablePoints[2]);
        outputs[_assetID][_newPublicKey[0]][_newPublicKey[1]] = reusablePoints[1];

        emit Merge(_assetID, _publicKey0[0], _publicKey0[1], _publicKey1[0], _publicKey1[1], _newPublicKey[0], _newPublicKey[1]);

        return true;
    }

    function verifyRangeProofForSplits(
        uint256[20] coords, // [input_x, input_y, A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        uint256[10] scalars, // [tauX, mu, t, a, b]
        uint256[2*2*n] ls_coords, // 2 * n
        uint256[2*2*n] rs_coords  // 2 * n
        ) public 
        view 
        returns (bool success) {
            uint256[10] memory scratchForCoords;
            uint256[5] memory scratchForScalars;
            uint256[2*n] memory scratchForLs;
            uint256[2*n] memory scratchForRs;
            for (uint256 i = 0; i < 2; i++) {
                uint256 j = 0;
                for (j = 0; j < scratchForCoords.length; j++) {
                    scratchForCoords[j] = coords[i*10 + j];
                }
                for (j = 0; j < scratchForScalars.length; j++) {
                    scratchForScalars[j] = scalars[i*5 + j];
                }
                for (j = 0; j < scratchForLs.length; j++) {
                    scratchForLs[j] = ls_coords[i*2*n + j];
                }
                for (j = 0; j < scratchForRs.length; j++) {
                    scratchForRs[j] = rs_coords[i*2*n + j];
                }
                if (!rangeProofVerifier.verify(scratchForCoords, scratchForScalars, scratchForLs, scratchForRs)) {
                    // emit DebugEvent(i, false, bytes32(0));
                    return false;
                }
            }
            return true;
        }

        function withdraw(uint256[2] _publicKey, uint256 _assetID, uint256 _value, uint256 _blinding) public returns (bool success) {
        alt_bn128.G1Point storage input = outputs[_assetID][_publicKey[0]][_publicKey[1]];
        alt_bn128.G1Point memory output = publicParameters.G().mul(_value).add(publicParameters.H().mul(_blinding));
        require(input.eq(output));
        uint256 convertedValue = tokenProxy.convertForWithdraw(_value, _assetID);
        delete outputs[_assetID][_publicKey[0]][_publicKey[1]];
        emit Withdraw(msg.sender, _assetID, convertedValue);
        if (_assetID != 0) {
            address tokenAddress;
            bool isAuthorized;
            (tokenAddress, isAuthorized) = tokenProxy.getTokenInfo(_assetID);
            require(isAuthorized);
            ERC20Token token = ERC20Token(tokenAddress);
            require(token.transfer(msg.sender, convertedValue));
        } else {
            msg.sender.transfer(convertedValue);
        }
        return true;

    }
}
