pragma solidity ^0.4.21;

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

interface ERC20Token {
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function allowance(address _owner, address _spender) view external returns (uint256 remaining);
    function balanceOf(address _owner) view external returns (uint256 balance);
    function decimals() view external returns (uint8 decs);
}
  
contract TokenProxy {
    using SafeMath for uint256;

    address public owner = msg.sender;
    address public supervisingContract;
    uint256 public maxAssetID = 0;
    struct TokenInfo {
        address tokenAddress;
        uint8 decimals;
        bool isAuthorized;
    }
    mapping(uint256 => TokenInfo) authorizedTokens;

    string public constant name = "Proxy for tokens in confidential transactions";

    uint8 public constant decimals = 3;
    // Ownership

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner returns (bool success) {
        require(newOwner != address(0));      
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        return true;
    }

    constructor() public {
        //values are in natural format
        TokenInfo memory ETHtoken = TokenInfo({
            tokenAddress: address(0),
            decimals: 18,
            isAuthorized: true
        });
        authorizedTokens[0] = ETHtoken;
    }

    function setSupervisingContract(address _supervisingContract) onlyOwner public returns (bool success) {
        require(_supervisingContract != address(0));
        require(supervisingContract == address(0));
        supervisingContract = _supervisingContract;
        return true;
    }

    function convertFromDeposit(uint256 _amount, uint256 _assetID) public view returns (uint256 convertedAmount) {
        require(_assetID <= maxAssetID);
        TokenInfo storage tokenInfo = authorizedTokens[_assetID];
        require(tokenInfo.isAuthorized);
        if (tokenInfo.decimals >= decimals) {
            uint256 divisor = 10**(uint256(tokenInfo.decimals - decimals));
            convertedAmount = _amount / divisor;
        } else {
            uint256 multiplier = 10**(uint256(decimals - tokenInfo.decimals));
            convertedAmount = _amount * multiplier;
        }
        return convertedAmount;

    }

    function convertForWithdraw(uint256 _amount, uint256 _assetID) public view returns (uint256 convertedAmount) {
        require(_assetID <= maxAssetID);
        TokenInfo storage tokenInfo = authorizedTokens[_assetID];
        require(tokenInfo.isAuthorized);
        if (tokenInfo.decimals >= decimals) {
            uint256 multiplier = 10**(uint256(tokenInfo.decimals - decimals));
            convertedAmount = _amount * multiplier;
        } else {
            uint256 divisor = 10**(uint256(decimals - tokenInfo.decimals));
            convertedAmount = _amount / divisor;
        }
        return convertedAmount;
    }

    function authorizeToken(uint256 _assetID, bool _allow) onlyOwner public returns (bool success) {
        require(_assetID <= maxAssetID);
        TokenInfo storage tokenInfo = authorizedTokens[_assetID];
        require(tokenInfo.isAuthorized != _allow);
        tokenInfo.isAuthorized = _allow;
        return true;
    }

    function addToken(address _tokenAddress) onlyOwner public returns (bool success) {
        ERC20Token tok = ERC20Token(_tokenAddress);
        uint8 tokDecimals = tok.decimals();
        maxAssetID++;
        TokenInfo memory newToken = TokenInfo({
            tokenAddress: _tokenAddress,
            decimals: tokDecimals,
            isAuthorized: true
        });
        authorizedTokens[maxAssetID] = newToken;
        return true;
    }

    function getTokenInfo(uint256 _assetID) public view returns(address tokenAddress, bool isAuthorized) {
        TokenInfo storage tokenInfo = authorizedTokens[_assetID];
        return (tokenInfo.tokenAddress, tokenInfo.isAuthorized);
    }

}