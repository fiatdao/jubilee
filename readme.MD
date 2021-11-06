# FIAT DAO - Jubilee Rewards Contracts

This is a fork of [BarnBridge-YieldFarming](https://github.com/BarnBridge/BarnBridge-YieldFarming). Here you can find the original contract audits, some basic info about the the architecture and the addresses of the Jubilee Rewards contracts on Mainnet and Rinkeby.

## Running tests
**Note:** The result of tests is readily available [here](./test-results.md).

### 1. Clone this repo
```shell
git clone https://github.com/fiatdao/jubilee
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

## Smart Contract External Audit

The contracts have been formally audited and the original report from the BarnBridge audit can be found [here](https://github.com/fiatdao/jubilee/blob/main/BarnBridge-Yield-Farming-and-Incentivization-AUDIT.pdf).

## Smart Contract Architecture
![yf sc architecture](https://user-images.githubusercontent.com/6073094/140610823-711065a2-0b99-4d12-b7d6-4d37a5dc02d7.png)

# Active Contracts

## Mainnet Contracts

[FDT](https://etherscan.io/address/0xed1480d12be41d92f36f5f7bdd88212e381a3677)

[Staking](https://etherscan.io/address/0xe98ae8cD25CDC06562c29231Db339d17D02Fd486#code)

[Community Vault](https://etherscan.io/address/0x34d53E1aF009fFDd6878413CC8E83D5a6906B8cB#code)

[Yield Farm BOND](https://etherscan.io/address/0xa0A3637e09cD7bEff98889946A4DfD60fE2Db23C#code)

[Yield Farm UMA](https://etherscan.io/address/0x217c4636329Aceb9309f83d2f57E460d3E6c96B5#code)

[Yield Farm MKR](https://etherscan.io/address/0xeD6BAB596Dcb7032142a36EC2048279d0047fA83#code)

[Yield Farm YFI](https://etherscan.io/address/0x665286CB1237261CC2D2eDa969EF0C12f60D3E76#code)

[Yield Farm RGT](https://etherscan.io/address/0x00952A036f2098C82C75Eb9cfAeE2C9849E39A2a#code)

[Yield Farm wsOHM](https://etherscan.io/address/0x0d728866Da7780dB8a0488ADB5300b721AC5211D#code)

## Rinkeby Contracts

### Mock ERC-20 contracts

We have deployed 5 mock contracts on Rinkeby with which one can farm our Rinkeby-FDT token:

[FDT-BOND](https://rinkeby.etherscan.io/address/0x81Ea2B191bfD1C24bbFb5C9297d8a2f6352602cb#code)

[FDT-UMA](https://rinkeby.etherscan.io/address/0xdb8fBc92a9D53226980D2B0bAeDa42484B0ce562#code)

[FDT-MKR](https://rinkeby.etherscan.io/address/0xf6bA9907D08fE2589Cc41B9f1ae41EFBA8C5f273#code)

[FDT-wsOHM](https://rinkeby.etherscan.io/address/0xAccDB008350e163D33a98357EF86Bd3A4092df61#code)

[FDT-Sushi LP](https://rinkeby.etherscan.io/address/0xf21040AAFb938FE8fA3d4e10A3278Fea77B051BD#code)

You can go ahead and trigger their mint function to mint new tokens and farm like a whale - they are free.

### Addresses

[Rinkeby-FDT](https://rinkeby.etherscan.io/address/0xb9e8d9890b41eb4b21b52353a5d4671f48b9840f)

[Staking](https://rinkeby.etherscan.io/address/0x9E5b1200973d32DF419e5a3900A7065aaEcBd652#code)

[Community Vault](https://rinkeby.etherscan.io/address/0x8255F5D523461ae90EF802906eaC67D915f69eE2#code)

[Yield Farm BOND](https://rinkeby.etherscan.io/address/0x2B3F5c77aA54747fef86981c85021221F2255abC#code)

[Yield Farm UMA](https://rinkeby.etherscan.io/address/0x4446C8000D9D0Cb5D748237EE5edAf36F042AF0d#code)

[Yield Farm MKR](https://rinkeby.etherscan.io/address/0x238F1fbcdF121983cF52828455D8111e1D15aF23#code)

[Yield Farm wsOHM](https://rinkeby.etherscan.io/address/0x8B1f231A7a2Dc4D94291Cc03605ad0071E2bA5c4#code)

[Yield Farm SUSHI LP](https://rinkeby.etherscan.io/address/0x9927BF9125222cbea127c87e7d757ea0BA7C8604#code)
