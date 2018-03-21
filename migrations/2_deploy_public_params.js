
const PublicParameters = artifacts.require("PublicParameters.sol");

module.exports = function(deployer, network, accounts) {
    return;
    const operator   = accounts[0];
    deployer.deploy(PublicParameters, {from: operator})
};
