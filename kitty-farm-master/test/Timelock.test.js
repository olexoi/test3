const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const MeowToken = artifacts.require('MeowToken');
const MasterChef = artifacts.require('MasterChef');
const MockERC20 = artifacts.require('MockERC20');
const Timelock = artifacts.require('Timelock');
const MrrBar = artifacts.require('MrrBar');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

contract('Timelock', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.meow = await MeowToken.new({ from: alice });
        this.timelock = await Timelock.new(bob, '28800', { from: alice }); //8hours
    });

    it('should not allow non-owner to do operation', async () => {
        await this.meow.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.meow.transferOwnership(carol, { from: alice }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.meow.transferOwnership(carol, { from: bob }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.timelock.queueTransaction(
                this.meow.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]),
                (await time.latest()).add(time.duration.hours(6)),
                { from: alice },
            ),
            'Timelock::queueTransaction: Call must come from admin.',
        );
    });

    it('should do the timelock thing', async () => {
        await this.meow.transferOwnership(this.timelock.address, { from: alice });
        const eta = (await time.latest()).add(time.duration.hours(9));
        console.log(await time.latest(), eta)
        await this.timelock.queueTransaction(
            this.meow.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        await time.increase(time.duration.hours(1));
        await expectRevert(
            this.timelock.executeTransaction(
                this.meow.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]), eta, { from: bob },
            ),
            "Timelock::executeTransaction: Transaction hasn't surpassed time lock.",
        );
        await time.increase(time.duration.hours(8));
        await this.timelock.executeTransaction(
            this.meow.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        assert.equal((await this.meow.owner()).valueOf(), carol);
    });

    it('should also work with MasterChef', async () => {
        // this.lp1 = await MockERC20.new('LPToken', 'LP', '10000000000', { from: minter });
        // this.lp2 = await MockERC20.new('LPToken', 'LP', '10000000000', { from: minter });
        // this.mrr = await MrrBar.new(this.meow.address, { from: minter });
        // this.chef = await MasterChef.new(this.meow.address, this.mrr.address, dev, '1000', '0', { from: alice });
        // await this.meow.transferOwnership(this.chef.address, { from: alice });
        // await this.chef.add('100', this.lp1.address, true);
        // await this.chef.transferOwnership(this.timelock.address, { from: alice });
        // const eta = (await time.latest()).add(time.duration.hours(6));
        // await this.timelock.queueTransaction(
        //     this.chef.address, '0', 'set(uint256,uint256,bool)',
        //     encodeParameters(['uint256', 'uint256', 'bool'], ['0', '200', false]), eta, { from: bob },
        // );
        // await this.timelock.queueTransaction(
        //     this.chef.address, '0', 'add(uint256,address,bool)',
        //     encodeParameters(['uint256', 'address', 'bool'], ['100', this.lp2.address, false]), eta, { from: bob },
        // );
        // await time.increase(time.duration.hours(6));
        // await this.timelock.executeTransaction(
        //     this.chef.address, '0', 'set(uint256,uint256,bool)',
        //     encodeParameters(['uint256', 'uint256', 'bool'], ['0', '200', false]), eta, { from: bob },
        // );
        // await this.timelock.executeTransaction(
        //     this.chef.address, '0', 'add(uint256,address,bool)',
        //     encodeParameters(['uint256', 'address', 'bool'], ['100', this.lp2.address, false]), eta, { from: bob },
        // );
        // assert.equal((await this.chef.poolInfo('0')).valueOf().allocPoint, '200');
        // assert.equal((await this.chef.totalAllocPoint()).valueOf(), '300');
        // assert.equal((await this.chef.poolLength()).valueOf(), '2');
    });
});
