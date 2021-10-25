# FiatDAO YieldFarm contracts

## Running tests
**Note:** The result of tests is readily available [here](./test-results.md).

### 1. Clone this repo
```shell
git clone https://github.com/FiatDAO/FIAT-YieldFarming
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

FiatDAO YeldFarming is a fork of BarnBridge YeldFarming. Here you can find the original contract audits and more info about the the architecture:
### [Smart Contract External Audit](https://github.com/BarnBridge/BarnBridge-YieldFarming/blob/master/BarnBridge-Yield-Farming-and-Incentivization-AUDIT.pdf)

## Smart Contract Architecture
![yf sc architecture](https://user-images.githubusercontent.com/4047772/120464712-e7bee680-c3a5-11eb-97ea-80df581af5ef.png)

# Active Contracts

## Mainnet Contracts

[Staking](https://etherscan.io/address/0x3F148612315AaE2514AC630D6FAf0D94B8Cd8E33#code)

[Community Vault](https://etherscan.io/address/0x2dDdddDCEA12B277aAAa4Da6aE65E9CC1E53c430#code)

[Yield Farm XYZ](https://etherscan.io/address/0xcBA851105bFa485E390FBD456B9190824aE1212a#code)

[Yield Farm MANA](https://etherscan.io/address/0x9b11E10f54010A52DdFAAF2E37C11EF9891a59F0#code)

[Yield Farm SAND](https://etherscan.io/address/0x123d229c6fAf32C3C99b2670111C705e6B644fA2#code)

[Yield Farm ILV](https://etherscan.io/address/0x271DBa83ccADd6A9719e314F53D9BF4e2C79d21A#code)

[Yield Farm AXS](https://etherscan.io/address/0xEa0B66eEc998Bb559fA6f1c6b159828F0a2db09d#code)

[Yield Farm BOND](https://etherscan.io/address/0xd65483B8755aC5Fea7120e3f68Df961d88181Dd2#code)

[Yield Farm SUSHI](https://etherscan.io/address/0xA9B4B5e05EF90cFb8644591186AbCf883eDA5735#code)

## Rinkeby Contracts

### YieldFarmGenericToken.sol
The farming rewards are paid in the Rinkeby FDT: 0x822a5c31679f4a580deb6ae4596437acdb9ddcab

We have 5 mock tokens for farming

[Fiat AAVE](https://rinkeby.etherscan.io/address/0xB81Ed1453Ab2db133A10a8c97888BEbe82cFac9C#code)

[Fiat XYZ](https://rinkeby.etherscan.io/address/0x5FfA3420213348a11b54063e3Dc0fda5e87891ab#code)

[Fiat ILV](https://rinkeby.etherscan.io/address/0x969e55dFA15396Da623769C0A0D651a187EbDc67#code)

[Fiat BOND](https://rinkeby.etherscan.io/address/0x038D06578Bb35EaE582EDfCc869fFa0E93761F2B#code)

[Fiat Sushi LP](https://rinkeby.etherscan.io/address/0x43f0265F0A0E81365051220aa24E9CeC4796a741#code)

You can go ahead and trigger their mint function to mint new tokens - they are free.

### Addresses

[Staking](https://rinkeby.etherscan.io/address/0x0Ca02A559DfB17860f1eA358f1F81E2b7fea8fAC#code)

[Community Vault](https://rinkeby.etherscan.io/address/0x0bD786b4bb89C8558c6B05f5D5102c25dfDDA105#code)

[Yield Farm AAVE](https://rinkeby.etherscan.io/address/0x8F175C7D96d176057EA0CFDEa4958bc2c88B4270#code)

[Yield Farm XYZ](https://rinkeby.etherscan.io/address/0x5e7A0fB101B16E5449325975b49575Ec51d71531#code)

[Yield Farm BOND](https://rinkeby.etherscan.io/address/0xbebb9855Af5caC8acDA84A2496CBBd4ae8af4531#code)

[Yield Farm ILV](https://rinkeby.etherscan.io/address/0x1c5737b9417134a337f86a11bdc25Be1E584F45a#code)

[Yield Farm SUSHI LP](https://rinkeby.etherscan.io/address/0xc73f763553EdCa96886883174c7e998491D23Bf4#code)
