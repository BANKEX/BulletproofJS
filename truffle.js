

// const Web3 = require('web3');
// const web3 = new Web3();


// Using the IPC provider in node.js
// var net = require('net');
// var web3 = new Web3('/Users/restereo/Library/Ethereum/geth.ipc', net); // mac os path

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
    networks: {
        ganache: {
            host: "127.0.0.1",
            gas: 7000000,
            port: 8545,
            network_id: "*", // Match any network id,
        },
        development: {
            host: '127.0.0.1',
            gas: 50000000,
            // gas: 4700000,
            port: 8545,
            network_id: '*' // Match any network id
        },
        cli: {
            host: '127.0.0.1',
            gas: 7000000,
            port: 9545,
            network_id: '*' // Match any network id
        }
    },
};
