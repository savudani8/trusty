import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-etherscan");
usePlugin("buidler-typechain");
usePlugin("@nomiclabs/buidler-web3");

const INFURA_API_KEY = "196529cd95964f0fb409a840238d1038";
const LOCAL_NETWORK_PRIVATE_KEY = "0x710fd8db1b881e948e291d85ebde38829f774c79d99b775f88c99cbe3f4649c1";
const config: BuidlerConfig = {
  defaultNetwork: "buidlerevm",
  solc: {
    version: "0.6.2"
  },
  networks: {
    localhost: {
      url: `http://127.0.0.1:2000`,
      accounts: [LOCAL_NETWORK_PRIVATE_KEY]
    },
    evm: {
      url: `http://127.0.0.1:8545`,
      accounts: [`0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122`]
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

export default config;