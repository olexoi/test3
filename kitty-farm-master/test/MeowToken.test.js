
const MeowToken = artifacts.require('MeowToken');

contract('MeowToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.meow = await MeowToken.new({ from: minter });
    });


    it('mint', async () => {
        // const num = 0.01 * Math.pow(10, 18);
        // const numAsHex = "0x" + num.toString(16);
        // await this.meow.mint(alice, num)
    })

});
