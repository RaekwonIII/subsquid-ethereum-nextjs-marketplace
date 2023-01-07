## Full stack NFT marketplace built with Polygon, Solidity, IPFS, & Next.js

![Header](https://miro.medium.com/max/4800/1*oOVXVZTj0xJ-6Lzy3mRRhw.webp)

This is the codebase to go along with tbe blog post [How to Build a performant and scalable Full Stack NFT Marketplace]([https://dev.to/dabit3/building-scalable-full-stack-apps-on-ethereum-with-polygon-2cfb](https://medium.com/subsquid/how-to-build-a-performant-and-scalable-full-stack-nft-marketplace-63c12466b959))

### Running this project locally

To run this project locally, follow these steps.

1. Clone the project locally, change into the directory, and install the dependencies:

```sh
git clone https://github.com/RaekwonIII/subsquid-ethereum-nextjs-marketplace.git

cd subsquid-ethereum-nextjs-marketplace

# install using NPM or Yarn
npm install
```

2. Add the Infura IPFS account credentials to a `.env` file: 

```
NEXT_PUBLIC_IPFS_PROJECT_ID=<YOUR_CREDENTIAL_HERE>
NEXT_PUBLIC_IPFS_PROJECT_SECRET=<YOUR_CREDENTIAL_HERE>
```

3. Start the local Hardhat node

```sh
npx hardhat node
```

4. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost
```

5. Start the app

```
npm run dev
```

### Configuration

To deploy to Ethereum testnet Goerli, or Mumbai (Polygon), update the configurations located in `hardhat.config.js` to use a private key and, optionally, deploy to a private RPC like Infura, using `.infuraid` and `.account` hidden files.

```javascript
require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const infuraId = fs.readFileSync(".infuraid").toString().trim() || ""; // process.env.INFURA_NODE_ID;//

const account = fs.readFileSync(".account").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      // Infura
      // url: `https://polygon-mumbai.infura.io/v3/${infuraId}`
      url: "https://rpc-mumbai.matic.today",
      accounts: [account]
    },
    goerli: {
      // Infura
      url: `https://goerli.infura.io/v3/${infuraId}`,
      accounts: [account]
    },
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
```

If using Infura, update __.infuraid__ with your [Infura](https://infura.io/) project ID.
