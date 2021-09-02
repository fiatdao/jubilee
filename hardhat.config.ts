import { task, HardhatUserConfig } from 'hardhat/config';
import * as config from './config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-abi-exporter';
import 'hardhat-typechain';
import 'solidity-coverage';
import 'hardhat-gas-reporter';

task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
    const accounts = await ethers.getSigners()

    for (const account of accounts) {
        console.log(await account.getAddress())
    }
})

task("deploy-token-18", "Deploys mock token with 18 symbols")
    .addParam("name", "The name of the token")
    .addParam("symbol", "The symbol of the token")
    .addParam("supply", "The supply to mint to the deployer")
    .setAction(async ({ name, symbol, supply }, hre, runSuper) => {
        const { deployERC20_18 } = require("./scripts/deploy-mock-erc20");
        await deployERC20_18(name, symbol, supply);
    });

task("deploy-token-6", "Deploys mock token with 6 symbols")
    .addParam("name", "The name of the token")
    .addParam("symbol", "The symbol of the token")
    .addParam("supply", "The supply to mint to the deployer")
    .setAction(async ({ name, symbol, supply }, hre, runSuper) => {
        const { deployERC20_6 } = require("./scripts/deploy-mock-erc20");
        await deployERC20_6(name, symbol, supply);
    });

task("deploy-vault", "Deploys Community Vault")
    .addParam("token", "The token of the vault")
    .setAction(async ({ token }, hre, runSuper) => {
        const deploy = require("./scripts/deploy-cv");
        await deploy(token);
    });

task("deploy-rinkeby", "Deploys staking and farming to rinkeby")
    .addParam("token", "The token of the rewards")
    .addParam("vault", "The valut address")
    .addParam("start", "The timestamp of the staking")
    .addParam("days", "Duration in days for an epoch")
    .setAction(async ({ token, vault, start, days }, hre, runSuper) => {
        const { deployRinkeby } = require("./scripts/deploy");
        await deployRinkeby(token, vault, start, days);
    });

const cfg: HardhatUserConfig = {
    solidity: {
        version: '0.6.12',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        }
    },

    defaultNetwork: "hardhat",
    networks: config.networks,
    etherscan: config.etherscan,

    abiExporter: {
        only: ['Staking', 'YieldFarm', 'ERC20Mock', 'CommunityVault'],
        clear: true,
    },

    gasReporter: {
        enabled: !!(process.env.REPORT_GAS),
    },
};

export default cfg;
