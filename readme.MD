# UniverseXYZ YieldFarm contracts

## Running tests
**Note:** The result of tests is readily available [here](./test-results.md).

### 1. Clone this repo
```shell
git clone git@github.com:UniverseXYZ/XYZ-YieldFarming.git
```

### 2. Install dependencies
```shell
npm install
```

### 3. Run tests
```shell
npm test

# or if you want to run with coverage
npm run coverage
```

UniverseXYZ YeldFarming is a fork of BarnBridge YeldFarming. Here you can find the original contract audits and more info about the the architecture:
### [Smart Contract External Audit](https://github.com/BarnBridge/BarnBridge-YieldFarming/blob/master/BarnBridge-Yield-Farming-and-Incentivization-AUDIT.pdf)

## Smart Contract Architecture
![yf sc architecture](https://user-images.githubusercontent.com/4047772/120464712-e7bee680-c3a5-11eb-97ea-80df581af5ef.png)

## Active Contracts
### YieldFarmGenericToken.sol
We have 7 instances of this contract deployed, that award 10,000,000 XYZ each over 20 Epochs to stakers of AAVE, COMP, BOND, ILV, SUSHI, SNX, LINK tokens.
You can stake only one token in each pool.
## Mainnet Contracts

 [Staking](https://etherscan.io/address/0x2d615795a8bdb804541C69798F13331126BA0c09#tokentxns)

 [Community Vault](https://etherscan.io/address/0xc6f269bcdE85CBA7C9d91aE5fB91f5612ff9bd8e)

 [Yield Farm AAVE](https://etherscan.io/address/0x49E01d04F5aB5Cbc110D4f15Eee983e4729FDf29#code)

 [Yield Farm COMP](https://etherscan.io/address/0x4C82B95202F936afC3f493E6779Fb9d3452811a9#code)

 [Yield Farm BOND](https://etherscan.io/address/0x9f8B01b9Aa4eefb8809c550cF3fe8E904c7Ea659#code)

 [Yield Farm ILV](https://etherscan.io/address/0x0Ef4852645FA17fDAd5f15f7b4021251090Ea0C7#code)

 [Yield Farm SUSHI](https://etherscan.io/address/0xe3e1860a5653c030818226e0cB1efb4a477A5F32#code)

 [Yield Farm SNX](https://etherscan.io/address/0x1d59a853085c2b34ABc433e71AE652186BD7fc8F#code)

 [Yield Farm LINK](https://etherscan.io/address/0x1f926b0924f64175dB5d10f652628e7849d0185e#code)
