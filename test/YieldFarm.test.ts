import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import { moveAtEpoch, tenPow18 } from "./helpers/helpers";
import { deployContract } from "./helpers/deploy";
import { expect } from "chai";
import { CommunityVault, ERC20Mock, Staking, YieldFarmGenericToken } from "../typechain";

describe("YieldFarmGenericToken", function () {
    let staking: Staking;
    let xyzToken: ERC20Mock, genericErc20: ERC20Mock;
    let communityVault: CommunityVault;
    let yieldFarm: YieldFarmGenericToken;
    let creator: Signer, owner: Signer, user: Signer;
    let ownerAddr: string, userAddr: string;

    const epochStart = Math.floor(Date.now() / 1000) + 1000;
    const epochDuration = 1000;

    const distributedAmount: BigNumber = BigNumber.from(10_000_000).mul(tenPow18);
    const amount = BigNumber.from(100).mul(tenPow18) as BigNumber;

    let snapshotId: any;

    before(async function () {
        [creator, owner, user] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        userAddr = await user.getAddress();

        staking = (await deployContract("Staking", [epochStart, epochDuration])) as Staking;

        xyzToken = (await deployContract("ERC20Mock")) as ERC20Mock;
        genericErc20 = (await deployContract("ERC20Mock")) as ERC20Mock;

        communityVault = (await deployContract("CommunityVault", [xyzToken.address])) as CommunityVault;
        yieldFarm = (await deployContract("YieldFarmGenericToken", [
            genericErc20.address,
            xyzToken.address,
            staking.address,
            communityVault.address
        ])) as YieldFarmGenericToken;

        await xyzToken.mint(communityVault.address, distributedAmount);
        await communityVault.connect(creator).setAllowance(yieldFarm.address, distributedAmount);
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send("evm_snapshot", []);
    });

    afterEach(async function () {
        await ethers.provider.send("evm_revert", [snapshotId]);
    });

    describe("General Contract checks", function () {
        it("should be deployed", async function () {
            expect(staking.address).to.not.equal(0);
            expect(yieldFarm.address).to.not.equal(0);
            expect(xyzToken.address).to.not.equal(0);
        });
        it("Get epoch PoolSize and distribute tokens", async function () {
            await depositGenericErc20(amount);
            await moveAtEpoch(epochStart, epochDuration, 3);

            const totalAmount = amount;
            expect(await yieldFarm.getPoolSize(1)).to.equal(totalAmount);
            expect(await yieldFarm.getEpochStake(userAddr, 1)).to.equal(totalAmount);
            expect(await xyzToken.allowance(communityVault.address, yieldFarm.address)).to.equal(distributedAmount);
            expect(await yieldFarm.getCurrentEpoch()).to.equal(3);

            await yieldFarm.connect(user).harvest(1);
            expect(await xyzToken.balanceOf(userAddr)).to.equal(distributedAmount.div(20));
        });
    });

    describe("Contract Tests", function () {
        it("User harvest and mass Harvest", async function () {
            await depositGenericErc20(amount);
            const totalAmount = amount;
            await moveAtEpoch(epochStart, epochDuration, 8);

            expect(await yieldFarm.getPoolSize(1)).to.equal(totalAmount);
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(0); // no epoch initialized
            await expect(yieldFarm.harvest(10)).to.be.revertedWith("This epoch is in the future");
            await expect(yieldFarm.harvest(3)).to.be.revertedWith("Harvest in order");

            await yieldFarm.connect(user).harvest(1)
            expect(await xyzToken.balanceOf(userAddr)).to.equal(
                amount.mul(distributedAmount.div(20)).div(totalAmount)
            );
            expect(await yieldFarm.connect(user).userLastEpochIdHarvested()).to.equal(1);
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(1); // epoch 1 have been initialized

            await (await yieldFarm.connect(user).massHarvest()).wait();
            const totalDistributedAmount = amount.mul(distributedAmount.div(20)).div(totalAmount).mul(7);
            expect(await xyzToken.balanceOf(userAddr)).to.equal(totalDistributedAmount);
            expect(await yieldFarm.connect(user).userLastEpochIdHarvested()).to.equal(7);
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(7); // epoch 7 have been initialized
        });

        it("Have nothing to harvest", async function () {
            await depositGenericErc20(amount);
            await moveAtEpoch(epochStart, epochDuration, 9);
            expect(await yieldFarm.getPoolSize(1)).to.equal(amount);
            await yieldFarm.connect(owner).harvest(1);
            expect(await xyzToken.balanceOf(await owner.getAddress())).to.equal(0);
            await yieldFarm.connect(owner).massHarvest();
            expect(await xyzToken.balanceOf(await owner.getAddress())).to.equal(0);
        });

        it("harvest maximum 20 epochs", async function () {
            await depositGenericErc20(amount);
            const totalAmount = amount;
            await moveAtEpoch(epochStart, epochDuration, 30);

            expect(await yieldFarm.getPoolSize(1)).to.equal(totalAmount);
            await (await yieldFarm.connect(user).massHarvest()).wait();
            expect(await yieldFarm.lastInitializedEpoch()).to.equal(20); // epoch 7 have been initialized
        });

        it("gives epochid = 0 for previous epochs", async function () {
            await moveAtEpoch(epochStart, epochDuration, -2);
            expect(await yieldFarm.getCurrentEpoch()).to.equal(0); // epoch 7 have been initialized
        });

        it("it should return 0 if no deposit in an epoch", async function () {
            await moveAtEpoch(epochStart, epochDuration, 3);
            await yieldFarm.connect(owner).harvest(1);
            expect(await xyzToken.balanceOf(await owner.getAddress())).to.equal(0);
        });
    });

    describe("Events", function () {
        it("Harvest emits Harvest", async function () {
            await depositGenericErc20(amount, owner);
            await moveAtEpoch(epochStart, epochDuration, 9);

            await expect(yieldFarm.connect(user).harvest(1))
                .to.emit(yieldFarm, "Harvest");
        });

        it("MassHarvest emits MassHarvest", async function () {
            await depositGenericErc20(amount, owner);
            await moveAtEpoch(epochStart, epochDuration, 9);

            await expect(yieldFarm.connect(user).massHarvest())
                .to.emit(yieldFarm, "MassHarvest");
        });
    });

    async function depositGenericErc20(x: BigNumber, u = user) {
        const ua = await u.getAddress();
        await genericErc20.mint(ua, x);
        await genericErc20.connect(u).approve(staking.address, x);
        return await staking.connect(u).deposit(genericErc20.address, x);
    }
});
