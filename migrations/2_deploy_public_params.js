
const PublicParameters = artifacts.require("PublicParameters.sol");

module.exports = function(deployer, network, accounts) {
    const operator   = accounts[0];
    deployer.deploy(PublicParameters, {from: operator})
};
