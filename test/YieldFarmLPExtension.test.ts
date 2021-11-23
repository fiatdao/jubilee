import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { moveAtEpoch, tenPow18 } from "./helpers/helpers";
import { deployContract } from "./helpers/deploy";
import { expect } from "chai";
import { CommunityVault, ERC20Mock, Staking, YieldFarmSushiLPToken, YieldFarmSushiLPTokenExtension } from "../typechain";

describe.only('YieldFarm Liquidity Pool - Extending existing pool', function () {
    let staking: Staking;
    let fdtToken: ERC20Mock;
    let sushiLP: ERC20Mock;
    let communityVault: CommunityVault;
    let yieldFarm: YieldFarmSushiLPToken;
    let yieldFarmExtension: YieldFarmSushiLPTokenExtension;
    let creator: Signer, user: Signer;
    let userAddr: string;

    const epochStart = Math.floor(Date.now() / 1000) + 1000;
    const epochDuration = 1000;
    const numberOfEpochs = 100;

    const distributedAmount: BigNumber = BigNumber.from(600_000).mul(tenPow18);
    const distributedAmountExtension: BigNumber = BigNumber.from(500_000).mul(tenPow18);
    const amount = BigNumber.from(100).mul(tenPow18) as BigNumber;

    let snapshotId: any;

    before(async function () {
        [creator, user] = await ethers.getSigners();
        userAddr = await user.getAddress();

        staking = (await deployContract("Staking", [epochStart, epochDuration])) as Staking;
        fdtToken = (await deployContract("ERC20Mock", ["Mock Token", "MCK", 0])) as ERC20Mock;
        sushiLP = (await deployContract("ERC20Mock", ["Mock Token", "MCK", 0])) as ERC20Mock;

        communityVault = (await deployContract("CommunityVault", [fdtToken.address])) as CommunityVault;
        yieldFarm = (await deployContract("YieldFarmSushiLPToken", [
            sushiLP.address,
            fdtToken.address,
            staking.address,
            communityVault.address,
        ])) as YieldFarmSushiLPToken;

        yieldFarmExtension = (await deployContract("YieldFarmSushiLPTokenExtension", [
            sushiLP.address,
            fdtToken.address,
            staking.address,
            communityVault.address,
        ])) as YieldFarmSushiLPTokenExtension;

        await fdtToken.mint(communityVault.address, distributedAmount);
        await fdtToken.mint(communityVault.address, distributedAmountExtension);
        await communityVault.connect(creator).setAllowance(yieldFarm.address, distributedAmount);
        await communityVault.connect(creator).setAllowance(yieldFarmExtension.address, distributedAmountExtension);
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send("evm_snapshot", []);
    });

    afterEach(async function () {
        await ethers.provider.send("evm_revert", [snapshotId]);
    });

    describe('General Contract checks', function () {
        it('should be deployed', async function () {
            expect(staking.address).to.not.equal(0)
            expect(yieldFarm.address).to.not.equal(0)
            expect(fdtToken.address).to.not.equal(0)
            expect(yieldFarmExtension.address).to.not.equal(0)
        })

        it('Get epoch PoolSize and distribute tokens', async function () {
            await depositsushiLP(amount)
            await moveAtEpoch(epochStart, epochDuration, 3)
            const totalAmount = amount

            expect(await yieldFarm.getPoolSize(1)).to.equal(totalAmount)
            expect(await yieldFarm.getEpochStake(userAddr, 1)).to.equal(totalAmount)
            expect(await fdtToken.allowance(communityVault.address, yieldFarm.address)).to.equal(distributedAmount)
            expect(await yieldFarm.getCurrentEpoch()).to.equal(2) // epoch on yield is staking - 1

            await yieldFarm.connect(user).harvest(1)
            let balanceBeforeExtension = await fdtToken.balanceOf(userAddr);
            expect(await fdtToken.balanceOf(userAddr)).to.equal(distributedAmount.div(numberOfEpochs))

            await moveAtEpoch(epochStart, epochDuration, 103)

            expect(await yieldFarmExtension.getPoolSize(1)).to.equal(totalAmount)
            expect(await yieldFarmExtension.getEpochStake(userAddr, 1)).to.equal(totalAmount)
            expect(await fdtToken.allowance(communityVault.address, yieldFarmExtension.address)).to.equal(distributedAmountExtension)
            expect(await yieldFarmExtension.getCurrentEpoch()).to.equal(2) // epoch on yield is staking - 1

            await yieldFarmExtension.connect(user).harvest(1)
            expect((await fdtToken.balanceOf(userAddr)).sub(balanceBeforeExtension)).to.equal(distributedAmountExtension.div(numberOfEpochs))
        })
    })

    describe('Contract Tests', function () {
        it('User harvest and mass Harvest', async function () {
            await depositsushiLP(amount)
            const totalAmount = amount
            // initialize epochs meanwhile
            await moveAtEpoch(epochStart, epochDuration, 9)
            expect(await yieldFarm.getPoolSize(1)).to.equal(amount)

            expect(await yieldFarm.lastInitializedEpoch()).to.equal(0) // no epoch initialized
            await expect(yieldFarm.harvest(10)).to.be.revertedWith('This epoch is in the future')
            await expect(yieldFarm.harvest(3)).to.be.revertedWith('Harvest in order')
            await (await yieldFarm.connect(user).harvest(1)).wait()

            expect(await fdtToken.balanceOf(userAddr)).to.equal(
                amount.mul(distributedAmount.div(numberOfEpochs)).div(totalAmount),
            )
            expect(await yieldFarm.connect(user).userLastEpochIdHarvested()).to.equal(1)
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(1) // epoch 1 have been initialized

            await (await yieldFarm.connect(user).massHarvest()).wait()
            const totalDistributedAmount = amount.mul(distributedAmount.div(numberOfEpochs)).div(totalAmount).mul(7)
            expect(await fdtToken.balanceOf(userAddr)).to.equal(totalDistributedAmount)
            expect(await yieldFarm.connect(user).userLastEpochIdHarvested()).to.equal(7)
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(7) // epoch 7 have been initialized

            const fdtBalanceBeforeExtension = await fdtToken.balanceOf(userAddr);

            await moveAtEpoch(epochStart, epochDuration, 109)
            for (let i = 2; i <= 109; i++) {
                await staking.connect(user).manualEpochInit([sushiLP.address], i);
            }

            await depositsushiLP(amount)
            const totalAmountExtension = amount.add(amount);
            // initialize epochs meanwhile
            expect(await yieldFarmExtension.getPoolSize(109)).to.equal(totalAmountExtension)

            expect(await yieldFarmExtension.lastInitializedEpoch()).to.equal(0) // no epoch initialized
            await expect(yieldFarmExtension.harvest(10)).to.be.revertedWith('This epoch is in the future')
            await expect(yieldFarmExtension.harvest(3)).to.be.revertedWith('Harvest in order')
            await (await yieldFarmExtension.connect(user).harvest(1)).wait()

            // Expect the balance after extension (minus the balance for the first pool) to be equal to the 7 epoch harvested amount
            expect((await fdtToken.balanceOf(userAddr)).sub(fdtBalanceBeforeExtension)).to.equal(
                totalAmountExtension.mul(distributedAmountExtension.div(numberOfEpochs)).div(totalAmountExtension),
            )
            expect(await yieldFarmExtension.connect(user).userLastEpochIdHarvested()).to.equal(1)
            expect(await yieldFarmExtension.lastInitializedEpoch()).to.equal(1) // epoch 1 have been initialized

            await (await yieldFarmExtension.connect(user).massHarvest()).wait()
            const totalDistributedAmountExtension = totalAmountExtension.mul(distributedAmountExtension.div(numberOfEpochs)).div(totalAmountExtension).mul(7)
            expect((await fdtToken.balanceOf(userAddr)).sub(fdtBalanceBeforeExtension)).to.equal(totalDistributedAmountExtension)
            expect(await yieldFarmExtension.connect(user).userLastEpochIdHarvested()).to.equal(7)
            expect(await yieldFarmExtension.lastInitializedEpoch()).to.equal(7) // epoch 7 have been initialized
        })

        it('Have nothing to harvest', async function () {
            await depositsushiLP(amount)
            await moveAtEpoch(epochStart, epochDuration, 30)
            expect(await yieldFarm.getPoolSize(1)).to.equal(amount)
            await yieldFarm.connect(creator).harvest(1)
            expect(await fdtToken.balanceOf(await creator.getAddress())).to.equal(0)
            await yieldFarm.connect(creator).massHarvest()
            expect(await fdtToken.balanceOf(await creator.getAddress())).to.equal(0)

            await moveAtEpoch(epochStart, epochDuration, 101)
            for (let i = 2; i <= 101; i++) {
                await staking.connect(user).manualEpochInit([sushiLP.address], i);
            }

            await depositsushiLP(amount)
            const totalAmountExtension = amount.add(amount);

            await moveAtEpoch(epochStart, epochDuration, 103)

            expect(await yieldFarmExtension.getPoolSize(1)).to.equal(totalAmountExtension);
            await yieldFarmExtension.connect(creator).harvest(1)
            expect(await fdtToken.balanceOf(await creator.getAddress())).to.equal(0)
            await yieldFarmExtension.connect(creator).massHarvest()
            expect(await fdtToken.balanceOf(await creator.getAddress())).to.equal(0)
        })

        it("Fail to harvest more epochs than the maximum", async function () {
            await depositsushiLP(amount);
            await moveAtEpoch(epochStart, epochDuration, 112);
            expect(await yieldFarm.getPoolSize(1)).to.equal(amount);
            await expect(yieldFarm.harvest(110)).to.be.revertedWith("Maximum number of epochs is 100");

            await moveAtEpoch(epochStart, epochDuration, 101)
            for (let i = 2; i <= 101; i++) {
                await staking.connect(user).manualEpochInit([sushiLP.address], i);
            }

            await depositsushiLP(amount);
            const totalAmountExtension = amount.add(amount);

            await moveAtEpoch(epochStart, epochDuration, 212);
            expect(await yieldFarmExtension.getPoolSize(1)).to.equal(totalAmountExtension);
            await expect(yieldFarmExtension.harvest(110)).to.be.revertedWith("Maximum number of epochs is 100");
        });

        it('harvest maximum 100 epochs', async function () {
            await depositsushiLP(amount)
            await moveAtEpoch(epochStart, epochDuration, 105)

            expect(await yieldFarm.getPoolSize(1)).to.equal(amount)
            await (await yieldFarm.connect(user).massHarvest()).wait()
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(numberOfEpochs)

            for (let i = 2; i <= 105; i++) {
                await staking.connect(user).manualEpochInit([sushiLP.address], i);
            }
            await depositsushiLP(amount)
            const totalAmountExtension = amount.add(amount);
            await moveAtEpoch(epochStart, epochDuration, 300)
            await (await yieldFarm.connect(user).massHarvest()).wait()

            expect(await yieldFarmExtension.getPoolSize(5)).to.equal(totalAmountExtension)
            await (await yieldFarmExtension.connect(user).massHarvest()).wait()
            expect(await yieldFarmExtension.lastInitializedEpoch()).to.equal(numberOfEpochs)
        })

        it('gives epochid = 0 for previous epochs', async function () {
            await moveAtEpoch(epochStart, epochDuration, -2)
            expect(await yieldFarm.getCurrentEpoch()).to.equal(0)
            await moveAtEpoch(epochStart, epochDuration, 95)
            expect(await yieldFarmExtension.getCurrentEpoch()).to.equal(0)
        })

        it('it should return 0 if no deposit in an epoch', async function () {
            await moveAtEpoch(epochStart, epochDuration, 3)
            await yieldFarm.connect(user).harvest(1)
            expect(await fdtToken.balanceOf(await user.getAddress())).to.equal(0)

            await moveAtEpoch(epochStart, epochDuration, 104)
            await yieldFarmExtension.connect(user).harvest(1)
            expect(await fdtToken.balanceOf(await user.getAddress())).to.equal(0)
        })
    })

    describe('Events', function () {
        it('Harvest emits Harvest', async function () {
            await depositsushiLP(amount)
            await moveAtEpoch(epochStart, epochDuration, 9)

            await expect(yieldFarm.connect(user).harvest(1))
                .to.emit(yieldFarm, 'Harvest')
        })

        it('MassHarvest emits MassHarvest', async function () {
            await depositsushiLP(amount)
            await moveAtEpoch(epochStart, epochDuration, 9)

            await expect(yieldFarm.connect(user).massHarvest())
                .to.emit(yieldFarm, 'MassHarvest')
        })
    })

    async function depositsushiLP(x: BigNumber, u = user) {
        const ua = await u.getAddress()
        await sushiLP.mint(ua, x)
        await sushiLP.connect(u).approve(staking.address, x)
        return await staking.connect(u).deposit(sushiLP.address, x)
    }
})
