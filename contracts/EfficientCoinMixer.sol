pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;
import "./MultiRangeProofVerifier.sol";
import "./alt_bn128.sol";
import "./TokenProxy.sol";
import "./SchnorrVerifier.sol";

contract EfficientCoinMixer {
    using alt_bn128 for alt_bn128.G1Point;
    using alt_bn128 for uint256;

    mapping(uint256 => mapping (uint256 => mapping (uint256 => alt_bn128.G1Point) ) ) public outputs;

    event Deposit(uint256 indexed _X, uint256 indexed _Y, uint256 indexed _assetID, uint256 _convertedAmount);
    event Transfer(uint256 indexed _index, uint256 indexed _X, uint256 indexed _Y, uint256 _assetID, bytes32 _dataX, bytes32 _dataR);
    event Withdraw(address indexed _address, uint256 indexed _assetID, uint256 _amount);
    event Merge(uint256 indexed _assetID, uint256 indexed _publicKey0_X, uint256 _publicKey0_Y, uint256 indexed _publicKey1_X, uint256 _publicKey1_Y, uint256 _newPublicKey_X, uint256 _newPublicKey_Y);

    event DebugEvent(uint256 a, uint256 b, uint256 c);

    SchnorrVerifier public schnorrVerifier;
    PublicParameters public publicParameters;
    MultiRangeProofVerifier public multiRangeProofVerifier;
    TokenProxy public tokenProxy;

    uint256 public constant m = 64;
    uint256 public constant n = 6;

    constructor (
        address _schnorrVerifier,
        address _publicParameters,
        address _multiRangeProofVerifier,
        address _tokenProxy
    ) public {
        require(_schnorrVerifier != address(0));
        require(_publicParameters != address(0));
        require(_multiRangeProofVerifier != address(0));
        require(_tokenProxy != address(0));
        schnorrVerifier = SchnorrVerifier(_schnorrVerifier);
        publicParameters = PublicParameters(_publicParameters);
        multiRangeProofVerifier = MultiRangeProofVerifier(_multiRangeProofVerifier);
        tokenProxy = TokenProxy(_tokenProxy);
        require(m == publicParameters.m());
        require(n == publicParameters.n());
        require(m == multiRangeProofVerifier.m());
        require(n == multiRangeProofVerifier.n());
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

    struct Board {
        uint256 assetID;
        alt_bn128.G1Point[] inputPublicKeys;
        uint256[] inputSchnorrSignatures;
        alt_bn128.G1Point[] outputPublicKeys;
        uint256[] outputs; // for convenience of range proof verification
        uint256[] outputIndexes; 
        bytes32[] outputKeyExchangeData; 
        uint256[2] outputConservationSignature;
        uint256[8] coords; // [A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        uint256[5] scalars; // [tauX, mu, t, a, b]
        uint256[2*n] ls_coords; // 2 * n
        uint256[2*n] rs_coords;  // 2 * n
    }

    function transfer(
        uint256 _assetID,
        uint256[2] _numOfInsAndOuts,
        uint256[] _parametersArray, // total 2 + (2+2)*numIns + (2+2+1)*numOuts following the parameters listed below for each it or out
        // uint256[2] output conservation signature, 
        // uint256[2] input public keys, // [PubX, PubY]
        // uint256[2] input signature,
        // uint256[2] output public keys, 
        // uint256[] output, // [outX, outY]
        // uint256[] output index, // indexes of output public keys generated

        bytes32[] _outputKeyExchangeData, // chunks of output encoded data
        
        //range proofs
        uint256[8] coords, // [A_x, A_y, S_x, S_y, commits[0]_x, commits[0]_y, commits[1]_x, commits[1]_y]
        uint256[5] scalars, // [tauX, mu, t, a, b]
        uint256[2*n] ls_coords, // 2 * n
        uint256[2*n] rs_coords  // 2 * n
    ) public returns (bool success) {
        require(_parametersArray.length == 2 + 4*_numOfInsAndOuts[0] + 5*_numOfInsAndOuts[1]);
        require(_outputKeyExchangeData.length == 2*_numOfInsAndOuts[1]);
        Board memory b;
        uint256 i = 0;
        for (i = 0; i < 2; i++) {
            b.outputConservationSignature[i] = _parametersArray[i];
        }
        uint256 shift = 2;
        b.inputPublicKeys = new alt_bn128.G1Point[](_numOfInsAndOuts[0]);
        b.inputSchnorrSignatures = new uint256[](2*_numOfInsAndOuts[0]);
        for (i = 0; i < _numOfInsAndOuts[0]; i++) {
            b.inputPublicKeys[i] = alt_bn128.G1Point(_parametersArray[shift + 4*i], _parametersArray[shift + 4*i + 1]);
            b.inputSchnorrSignatures[2*i] = _parametersArray[shift + 4*i+2];
            b.inputSchnorrSignatures[2*i+1] = _parametersArray[shift + 4*i+3];
        }
        shift = shift + 4*_numOfInsAndOuts[0];
        b.outputPublicKeys = new alt_bn128.G1Point[](_numOfInsAndOuts[1]);
        b.outputs = new uint256[](_numOfInsAndOuts[1]*2);
        b.outputIndexes = new uint256[](_numOfInsAndOuts[1]);
        b.outputKeyExchangeData = new bytes32[](_numOfInsAndOuts[1]*2);
        for (i = 0; i < _numOfInsAndOuts[1]; i++) {
            b.outputPublicKeys[i] = alt_bn128.G1Point(_parametersArray[shift + 5*i], _parametersArray[shift + 5*i + 1]);
            b.outputs[2*i] = _parametersArray[shift + 5*i + 2];
            b.outputs[2*i+1] = _parametersArray[shift + 5*i + 3];
            b.outputIndexes[i] = _parametersArray[shift + 5*i + 4];
            b.outputKeyExchangeData[2*i] = _outputKeyExchangeData[2*i];
            b.outputKeyExchangeData[2*i+1] = _outputKeyExchangeData[2*i+1]; 
        }
        b.assetID = _assetID;
        b.coords = coords;
        b.scalars = scalars;
        b.ls_coords = ls_coords;
        b.rs_coords = rs_coords;
        return transfer_internal(b);
    }

    function transfer_internal(Board b) internal returns(bool success) {
        // check the range proof right away
        require(multiRangeProofVerifier.verify(b.outputs, b.coords, b.scalars, b.ls_coords, b.rs_coords));
        alt_bn128.G1Point[] memory reusablePoints = new alt_bn128.G1Point[](2);
        bytes32 hashToVerify;
        uint256 i = 0;
        reusablePoints[0] = alt_bn128.G1Point(0, 0); // zero, accumulator
        // accumulate a total output and check signatures
        for (i = 0; i < b.inputPublicKeys.length; i++) {
            reusablePoints[1] = outputs[b.assetID][b.inputPublicKeys[i].X][b.inputPublicKeys[i].Y]; // old output
            hashToVerify = keccak256(reusablePoints[1].X, reusablePoints[1].Y);
            require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, b.inputSchnorrSignatures[2*i], b.inputSchnorrSignatures[2*i+1], publicParameters.generator(), b.inputPublicKeys[i]));
            reusablePoints[0] = reusablePoints[0].add(reusablePoints[1]);
            delete outputs[b.assetID][b.inputPublicKeys[i].X][b.inputPublicKeys[i].Y];
        }
        // now check conservation law
        for (i = 0; i < b.outputPublicKeys.length; i++) {
            require(outputs[b.assetID][b.outputPublicKeys[i].X][b.outputPublicKeys[i].Y].X == 0);
            require(outputs[b.assetID][b.outputPublicKeys[i].X][b.outputPublicKeys[i].Y].Y == 0);
            reusablePoints[1] = alt_bn128.G1Point(b.outputs[2*i], b.outputs[2*i+1]); // new output
            reusablePoints[0] = reusablePoints[0].add(reusablePoints[1].neg());
            outputs[b.assetID][b.outputPublicKeys[i].X][b.outputPublicKeys[i].Y] = reusablePoints[1];
            emit Transfer(b.outputIndexes[i], b.outputPublicKeys[i].X, b.outputPublicKeys[i].Y, b.assetID, b.outputKeyExchangeData[2*i], b.outputKeyExchangeData[2*i+1]);
        }
        hashToVerify = keccak256(reusablePoints[0].X, reusablePoints[0].Y);
        require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, b.outputConservationSignature[0], b.outputConservationSignature[1], publicParameters.H(), reusablePoints[0]));
        return true;
    }

    // function merge(
    //     uint256 _assetID, uint256[2] _publicKey0, uint256[2] _publicKey1,
    //     uint256[2] _signature0,
    //     uint256[2] _signature1,
    //     uint256[2] _newPublicKey) public returns (bool success) {
    //     alt_bn128.G1Point[] memory reusablePoints = new alt_bn128.G1Point[](3);

    //     reusablePoints[0] = outputs[_assetID][_publicKey0[0]][_publicKey0[1]]; // old output 0
    //     bytes32 hashToVerify = keccak256(reusablePoints[0].X, reusablePoints[0].Y);
    //     reusablePoints[1] = alt_bn128.G1Point(_publicKey0[0], _publicKey0[1]); //public key associated with an output
    //     require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _signature0[0], _signature0[1], publicParameters.generator(), reusablePoints[1]));

    //     reusablePoints[2] = outputs[_assetID][_publicKey1[0]][_publicKey1[1]]; // old output 0
    //     hashToVerify = keccak256(reusablePoints[2].X, reusablePoints[2].Y);
    //     reusablePoints[1] = alt_bn128.G1Point(_publicKey1[0], _publicKey1[1]); //public key associated with an output
    //     require(schnorrVerifier.verifySignatureAsPoints(hashToVerify, _signature1[0], _signature1[1], publicParameters.generator(), reusablePoints[1]));

    //     delete outputs[_assetID][_publicKey0[0]][_publicKey0[1]]; 
    //     delete outputs[_assetID][_publicKey1[0]][_publicKey1[1]];
    //     reusablePoints[1] = reusablePoints[0].add(reusablePoints[2]);
    //     outputs[_assetID][_newPublicKey[0]][_newPublicKey[1]] = reusablePoints[1];

    //     emit Merge(_assetID, _publicKey0[0], _publicKey0[1], _publicKey1[0], _publicKey1[1], _newPublicKey[0], _newPublicKey[1]);

    //     return true;
    // }

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
