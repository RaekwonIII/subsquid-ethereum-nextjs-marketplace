require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const infuraId = fs.readFileSync(".infuraid").toString().trim() || ""; // process.env.INFURA_NODE_ID;//

const account = fs.readFileSync(".account").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      // mining: {
      //   auto: false,
      //   interval: [4800, 5200]
      // }
    },
    goerli: {
      // Infura
      url: `https://goerli.infura.io/v3/${infuraId}`,
      accounts: [account]
    },
    /*
    matic: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [process.env.privateKey]
    }
    */
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

